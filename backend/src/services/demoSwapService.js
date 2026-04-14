const pool = require("../db/pool");
const env = require("../config/env");
const { normalizeCurrency } = require("../utils/currency");
const { decimalToUnits, unitsToDecimal, multiplyUnits, divideUnits } = require("../utils/decimal");
const { getMarketSnapshot } = require("./marketDataService");

const RATIO_DENOMINATOR = 10000n;
const SUPPORTED_CURRENCIES = new Set(["UZS", "USDT", "BTC"]);
const DEFAULT_DEMO_SWAP_FEE_BPS = 50n;
const DEFAULT_DEMO_SWAP_SPREAD_BPS = 20n;

const roundDivision = (numerator, denominator) => {
  const dividend = BigInt(numerator);
  const divisor = BigInt(denominator);
  const quotient = dividend / divisor;
  const remainder = dividend % divisor;
  const remainderAbs = remainder < 0n ? -remainder : remainder;
  const divisorAbs = divisor < 0n ? -divisor : divisor;

  if (remainderAbs * 2n < divisorAbs) {
    return quotient;
  }

  return quotient >= 0n ? quotient + 1n : quotient - 1n;
};

const applyBps = (valueUnits, bps) => roundDivision(BigInt(valueUnits) * BigInt(bps), RATIO_DENOMINATOR);

const formatFixedDecimal = (units) => unitsToDecimal(units, undefined, { trimTrailingZeros: false });

const getConfiguredBps = () => ({
  feeBps: BigInt(env.demoSwapFeeBps || DEFAULT_DEMO_SWAP_FEE_BPS),
  spreadBps: BigInt(env.demoSwapSpreadBps || DEFAULT_DEMO_SWAP_SPREAD_BPS)
});

const ensureSupportedCurrency = (currency) => {
  const normalized = normalizeCurrency(currency);
  if (!SUPPORTED_CURRENCIES.has(normalized)) {
    const error = new Error(`Unsupported currency: ${normalized}`);
    error.statusCode = 400;
    error.publicMessage = `Unsupported currency: ${normalized}`;
    throw error;
  }
  return normalized;
};

const getRateUnits = ({ fromCurrency, toCurrency, snapshot }) => {
  const fromUsdRate = snapshot.usdRates[fromCurrency];
  const toUsdRate = snapshot.usdRates[toCurrency];

  if (!fromUsdRate || !toUsdRate) {
    const error = new Error(`Missing market rate for ${fromCurrency}/${toCurrency}`);
    error.statusCode = 503;
    error.publicMessage = "Market rate is temporarily unavailable";
    throw error;
  }

  return divideUnits(decimalToUnits(fromUsdRate), decimalToUnits(toUsdRate));
};

const createDemoQuote = async ({ amount, fromCurrency, toCurrency }) => {
  const normalizedFrom = ensureSupportedCurrency(fromCurrency);
  const normalizedTo = ensureSupportedCurrency(toCurrency);
  if (normalizedFrom === normalizedTo) {
    const error = new Error("Source and destination currencies must differ.");
    error.statusCode = 400;
    error.publicMessage = "Choose two different currencies";
    throw error;
  }

  const amountUnits = decimalToUnits(amount);
  if (amountUnits <= 0n) {
    const error = new Error("Amount must be positive.");
    error.statusCode = 400;
    error.publicMessage = "Amount must be greater than zero";
    throw error;
  }

  const snapshot = await getMarketSnapshot();
  const { feeBps, spreadBps } = getConfiguredBps();
  const marketRateUnits = getRateUnits({ fromCurrency: normalizedFrom, toCurrency: normalizedTo, snapshot });
  const effectiveRateUnits = applyBps(marketRateUnits, RATIO_DENOMINATOR - spreadBps);
  const referenceOutputUnits = multiplyUnits(amountUnits, marketRateUnits);
  const grossOutputUnits = multiplyUnits(amountUnits, effectiveRateUnits);
  const feeAmountSourceUnits = applyBps(amountUnits, feeBps);
  const sourceAfterFeeUnits = amountUnits - feeAmountSourceUnits;
  const netOutputUnits = multiplyUnits(sourceAfterFeeUnits, effectiveRateUnits);
  const spreadImpactUnits = referenceOutputUnits - grossOutputUnits;

  return {
    quoteId: `quote-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    fromCurrency: normalizedFrom,
    toCurrency: normalizedTo,
    amount: formatFixedDecimal(amountUnits),
    marketRate: formatFixedDecimal(marketRateUnits),
    effectiveRate: formatFixedDecimal(effectiveRateUnits),
    feeBps: Number(feeBps),
    spreadBps: Number(spreadBps),
    feeAmountSource: formatFixedDecimal(feeAmountSourceUnits),
    spreadImpactTarget: formatFixedDecimal(spreadImpactUnits),
    referenceOutput: formatFixedDecimal(referenceOutputUnits),
    netOutput: formatFixedDecimal(netOutputUnits),
    sources: snapshot.sources,
    marketSnapshot: snapshot
  };
};

const mapSwapTransactionRow = (row) => ({
  id: row.id,
  type: "convert",
  description: `Swap ${row.source_currency} to ${row.destination_currency}`,
  method: "PayZa Demo Exchange",
  sourceCurrency: row.source_currency,
  destinationCurrency: row.destination_currency,
  amount: Number(row.amount),
  feeAmount: Number(row.fee_amount),
  netAmount: Number(row.net_amount),
  status: row.status,
  createdAt: row.created_at
});

const findExistingSwapByIdempotency = async ({ db, userId, idempotencyKey }) => {
  if (!idempotencyKey) return null;

  const result = await db.query(
    `SELECT id, source_currency, destination_currency, amount, fee_amount, net_amount, status, created_at
     FROM transactions
     WHERE sender_user_id = $1 AND idempotency_key = $2
     LIMIT 1`,
    [userId, idempotencyKey]
  );

  return result.rows[0] || null;
};

const executeDemoSwap = async ({ userId, amount, fromCurrency, toCurrency, idempotencyKey }) => {
  const quote = await createDemoQuote({ amount, fromCurrency, toCurrency });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (idempotencyKey) {
      const existing = await findExistingSwapByIdempotency({
        db: client,
        userId,
        idempotencyKey
      });

      if (existing) {
        await client.query("COMMIT");
        return {
          reused: true,
          transaction: mapSwapTransactionRow(existing),
          quote
        };
      }
    }

    const sourceWalletResult = await client.query(
      `SELECT id, currency, balance, status
       FROM wallets
       WHERE user_id = $1 AND currency = $2 AND status = 'active'
       LIMIT 1
       FOR UPDATE`,
      [userId, quote.fromCurrency]
    );

    const destinationWalletResult = await client.query(
      `SELECT id, currency, balance, status
       FROM wallets
       WHERE user_id = $1 AND currency = $2 AND status = 'active'
       LIMIT 1
       FOR UPDATE`,
      [userId, quote.toCurrency]
    );

    const sourceWallet = sourceWalletResult.rows[0];
    const destinationWallet = destinationWalletResult.rows[0];

    if (!sourceWallet || !destinationWallet) {
      const error = new Error("Wallet not found.");
      error.statusCode = 404;
      error.publicMessage = "Required wallets were not found";
      throw error;
    }

    const sourceBalanceUnits = decimalToUnits(sourceWallet.balance);
    const amountUnits = decimalToUnits(quote.amount);
    const netOutputUnits = decimalToUnits(quote.netOutput);
    const feeAmountSourceUnits = decimalToUnits(quote.feeAmountSource);

    if (sourceBalanceUnits < amountUnits) {
      const error = new Error("Insufficient balance.");
      error.statusCode = 400;
      error.publicMessage = "Insufficient balance for this swap";
      throw error;
    }

    const destinationBalanceUnits = decimalToUnits(destinationWallet.balance);
    const nextSourceBalanceUnits = sourceBalanceUnits - amountUnits;
    const nextDestinationBalanceUnits = destinationBalanceUnits + netOutputUnits;

    await client.query(
      `UPDATE wallets
       SET balance = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [sourceWallet.id, formatFixedDecimal(nextSourceBalanceUnits)]
    );

    await client.query(
      `UPDATE wallets
       SET balance = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [destinationWallet.id, formatFixedDecimal(nextDestinationBalanceUnits)]
    );

    const transactionResult = await client.query(
      `INSERT INTO transactions (
        sender_user_id,
        recipient_identifier,
        source_currency,
        destination_currency,
        amount,
        fee_amount,
        net_amount,
        status,
        source_wallet_id,
        idempotency_key
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'success', $8, $9)
      RETURNING id, source_currency, destination_currency, amount, fee_amount, net_amount, status, created_at`,
      [
        userId,
        `Internal swap ${quote.fromCurrency}->${quote.toCurrency}`,
        quote.fromCurrency,
        quote.toCurrency,
        quote.amount,
        formatFixedDecimal(feeAmountSourceUnits),
        quote.netOutput,
        sourceWallet.id,
        idempotencyKey || null
      ]
    );

    const transaction = transactionResult.rows[0];

    await client.query(
      `INSERT INTO transaction_events (transaction_id, event_type, details)
       VALUES
         ($1, 'demo_swap_created', $2::jsonb),
         ($1, 'demo_swap_completed', $3::jsonb)`,
      [
        transaction.id,
        JSON.stringify({
          fromCurrency: quote.fromCurrency,
          toCurrency: quote.toCurrency,
          marketRate: quote.marketRate,
          effectiveRate: quote.effectiveRate,
          feeAmountSource: quote.feeAmountSource,
          netOutput: quote.netOutput
        }),
        JSON.stringify({ status: "success" })
      ]
    );

    await client.query("COMMIT");

    return {
      reused: false,
      transaction: mapSwapTransactionRow(transaction),
      quote
    };
  } catch (error) {
    await client.query("ROLLBACK");

    if (idempotencyKey && error?.code === "23505") {
      const existing = await findExistingSwapByIdempotency({
        db: pool,
        userId,
        idempotencyKey
      });

      if (existing) {
        return {
          reused: true,
          transaction: mapSwapTransactionRow(existing),
          quote
        };
      }
    }

    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createDemoQuote,
  executeDemoSwap,
  mapSwapTransactionRow
};
