const pool = require("../db/pool");
const { isCryptoCurrency, isFiatCurrency, toUsd } = require("../utils/currency");

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
    `SELECT id, source_currency, amount, status, recipient_identifier, created_at
     FROM transactions
     WHERE sender_user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows.map((row) => ({
    id: row.id,
    type: "send",
    description: `Transfer to ${row.recipient_identifier}`,
    method: `${row.source_currency} Wallet`,
    date: row.created_at,
    amount: parseAmount(row.amount),
    currency: row.source_currency,
    status: row.status
  }));
}

function buildOverview({ balances, paymentMethods, recentTransactions }) {
  const traditionalBalances = balances.filter((item) => isFiatCurrency(item.currency));
  const cryptoBalances = balances.filter((item) => isCryptoCurrency(item.currency));

  const traditionalMethods = paymentMethods.filter((item) => item.category === "traditional");
  const cryptoMethods = paymentMethods.filter((item) => item.category === "crypto");

  const totalBalanceUsd = balances.reduce((sum, item) => sum + toUsd(item.amount, item.currency), 0);

  return {
    summary: {
      totalBalanceUsd: Number(totalBalanceUsd.toFixed(2))
    },
    traditionalBalances,
    cryptoBalances,
    traditionalMethods,
    cryptoMethods,
    recentTransactions
  };
}

module.exports = {
  getWalletBalances,
  getPaymentMethods,
  getRecentTransactions,
  buildOverview
};
