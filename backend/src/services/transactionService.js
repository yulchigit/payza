const pool = require("../db/pool");
const { isCryptoCurrency } = require("../utils/currency");

const parseAmount = (value) => Number.parseFloat(value || 0);

const calculateFeeRate = (currency) => (isCryptoCurrency(currency) ? 0.01 : 0.005);

async function findExistingByIdempotency({ db, userId, idempotencyKey }) {
  if (!idempotencyKey) return null;
  const result = await db.query(
    `SELECT id, recipient_identifier, source_currency, amount, fee_amount, net_amount, status, created_at
     FROM transactions
     WHERE sender_user_id = $1 AND idempotency_key = $2
     LIMIT 1`,
    [userId, idempotencyKey]
  );

  return result.rows[0] || null;
}

async function createTransaction({ userId, payload, idempotencyKey }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (idempotencyKey) {
      const existing = await findExistingByIdempotency({ db: client, userId, idempotencyKey });
      if (existing) {
        await client.query("COMMIT");
        return {
          transaction: mapTransactionRow(existing),
          reused: true
        };
      }
    }

    const walletResult = await client.query(
      `SELECT id, currency, balance
       FROM wallets
       WHERE user_id = $1 AND currency = $2 AND status = 'active'
       LIMIT 1
       FOR UPDATE`,
      [userId, payload.sourceCurrency]
    );

    const wallet = walletResult.rows[0];
    if (!wallet) {
      const error = new Error("Wallet not found");
      error.statusCode = 404;
      error.publicMessage = "Source wallet not found";
      throw error;
    }

    const amount = Number(payload.amount);
    const walletBalance = parseAmount(wallet.balance);
    if (walletBalance < amount) {
      const error = new Error("Insufficient balance");
      error.statusCode = 400;
      error.publicMessage = "Insufficient balance";
      throw error;
    }

    const feeRate = calculateFeeRate(payload.sourceCurrency);
    const feeAmount = Number((amount * feeRate).toFixed(8));
    const netAmount = Number((amount - feeAmount).toFixed(8));
    if (netAmount <= 0) {
      const error = new Error("Invalid transaction amount");
      error.statusCode = 400;
      error.publicMessage = "Invalid amount after fees";
      throw error;
    }

    const insertResult = await client.query(
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
      RETURNING id, recipient_identifier, source_currency, amount, fee_amount, net_amount, status, created_at`,
      [
        userId,
        payload.recipientIdentifier,
        payload.sourceCurrency,
        payload.sourceCurrency,
        amount,
        feeAmount,
        netAmount,
        wallet.id,
        idempotencyKey || null
      ]
    );

    const tx = insertResult.rows[0];

    await client.query(
      `UPDATE wallets
       SET balance = balance - $2,
           updated_at = NOW()
       WHERE id = $1`,
      [wallet.id, amount]
    );

    await client.query(
      `INSERT INTO transaction_events (transaction_id, event_type, details)
       VALUES ($1, 'transaction_created', $2::jsonb),
              ($1, 'transaction_completed', $3::jsonb)`,
      [
        tx.id,
        JSON.stringify({ userId, amount, currency: payload.sourceCurrency }),
        JSON.stringify({ status: "success" })
      ]
    );

    await client.query("COMMIT");
    return {
      transaction: mapTransactionRow(tx),
      reused: false
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function listTransactions(userId, limit) {
  const result = await pool.query(
    `SELECT id, recipient_identifier, source_currency, amount, fee_amount, net_amount, status, created_at
     FROM transactions
     WHERE sender_user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows.map(mapTransactionRow);
}

async function getTransactionById(userId, transactionId) {
  const result = await pool.query(
    `SELECT id, recipient_identifier, source_currency, amount, fee_amount, net_amount, status, created_at
     FROM transactions
     WHERE sender_user_id = $1 AND id = $2
     LIMIT 1`,
    [userId, transactionId]
  );

  return result.rows[0] ? mapTransactionRow(result.rows[0]) : null;
}

function mapTransactionRow(row) {
  return {
    id: row.id,
    recipientIdentifier: row.recipient_identifier,
    sourceCurrency: row.source_currency,
    amount: parseAmount(row.amount),
    feeAmount: parseAmount(row.fee_amount),
    netAmount: parseAmount(row.net_amount),
    status: row.status,
    createdAt: row.created_at
  };
}

module.exports = {
  createTransaction,
  listTransactions,
  getTransactionById
};
