const pool = require("../db/pool");
const { isCryptoCurrency, isFiatCurrency, normalizeCurrency } = require("../utils/currency");
const { decimalToUnits, multiplyUnits, unitsToDecimal } = require("../utils/decimal");

const parseAmount = (value) => Number.parseFloat(value || 0);

async function getWalletBalances(userId) {
  const result = await pool.query(
    `SELECT id, currency, balance, status
     FROM wallets
     WHERE user_id = $1
     ORDER BY currency`,
    [userId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    currency: row.currency,
    amount: parseAmount(row.balance),
    status: row.status
  }));
}

async function getPaymentMethods(userId) {
  const result = await pool.query(
    `SELECT id, name, category, status
     FROM payment_methods
     WHERE user_id = $1
     ORDER BY created_at ASC`,
    [userId]
  );

  return result.rows;
}

async function getRecentTransactions(userId, limit) {
  const result = await pool.query(
    `SELECT id, source_currency, destination_currency, amount, fee_amount, net_amount, status, recipient_identifier, created_at
     FROM transactions
     WHERE sender_user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows.map((row) => {
    const isInternalSwap = String(row.recipient_identifier || "").startsWith("Internal swap ");
    if (isInternalSwap && row.destination_currency) {
      return {
        id: row.id,
        type: "convert",
        description: `Swap ${row.source_currency} to ${row.destination_currency}`,
        method: "PayZa Demo Exchange",
        date: row.created_at,
        amount: parseAmount(row.net_amount),
        currency: row.destination_currency,
        status: row.status,
        sourceAmount: parseAmount(row.amount),
        sourceCurrency: row.source_currency
      };
    }

    return {
      id: row.id,
      type: "send",
      description: `Transfer to ${row.recipient_identifier}`,
      method: `${row.source_currency} Wallet`,
      date: row.created_at,
      amount: parseAmount(row.amount),
      currency: row.source_currency,
      status: row.status
    };
  });
}

function buildOverview({ balances, paymentMethods, recentTransactions, marketSnapshot, portfolioHistory }) {
  const traditionalBalances = balances.filter((item) => isFiatCurrency(item.currency));
  const cryptoBalances = balances.filter((item) => isCryptoCurrency(item.currency));

  const traditionalMethods = paymentMethods.filter((item) => item.category === "traditional");
  const cryptoMethods = paymentMethods.filter((item) => item.category === "crypto");

  const usdRates = marketSnapshot?.usdRates || {};
  const totalBalanceUsdUnits = balances.reduce((sum, item) => {
    const rate = usdRates[normalizeCurrency(item.currency)] || "0";
    return sum + multiplyUnits(decimalToUnits(item.amount || 0), decimalToUnits(rate));
  }, 0n);

  const totalBalanceUsd = Number(unitsToDecimal(totalBalanceUsdUnits));
  const previousPoint = portfolioHistory?.[portfolioHistory.length - 2];
  const latestPoint = portfolioHistory?.[portfolioHistory.length - 1];
  const dailyChangePercent = previousPoint?.totalBalanceUsd
    ? Number((((latestPoint.totalBalanceUsd - previousPoint.totalBalanceUsd) / previousPoint.totalBalanceUsd) * 100).toFixed(2))
    : 0;

  return {
    summary: {
      totalBalanceUsd: Number(totalBalanceUsd.toFixed(2)),
      dailyChangePercent
    },
    traditionalBalances,
    cryptoBalances,
    traditionalMethods,
    cryptoMethods,
    recentTransactions,
    market: marketSnapshot,
    portfolioHistory: portfolioHistory || []
  };
}

module.exports = {
  getWalletBalances,
  getPaymentMethods,
  getRecentTransactions,
  buildOverview
};
