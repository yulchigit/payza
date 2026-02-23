const pool = require("../db/pool");
const { isCryptoCurrency } = require("../utils/currency");

const parseAmount = (value) => Number.parseFloat(value || 0);

const calculateFeeRate = (currency) => (isCryptoCurrency(currency) ? 0.01 : 0.005);

const escapeLikePattern = (value) =>
  String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");

const buildUtcStartOfDay = (dateYmd) => `${dateYmd}T00:00:00.000Z`;

const buildUtcStartOfNextDay = (dateYmd) => {
  const [year, month, day] = String(dateYmd).split("-").map((part) => Number.parseInt(part, 10));
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
  return nextDay.toISOString();
};

function buildTransactionsFilterQuery({ userId, query }) {
  const conditions = ["sender_user_id = $1"];
  const values = [userId];
  let index = 2;

  if (query.status) {
    conditions.push(`status = $${index}`);
    values.push(query.status);
    index += 1;
  }

  if (query.sourceCurrency) {
    conditions.push(`source_currency = $${index}`);
    values.push(query.sourceCurrency);
    index += 1;
  }

  if (query.search) {
    conditions.push(`recipient_identifier ILIKE $${index} ESCAPE '\\'`);
    values.push(`%${escapeLikePattern(query.search)}%`);
    index += 1;
  }

  if (query.from) {
    conditions.push(`created_at >= $${index}`);
    values.push(buildUtcStartOfDay(query.from));
    index += 1;
  }

  if (query.to) {
    conditions.push(`created_at < $${index}`);
    values.push(buildUtcStartOfNextDay(query.to));
    index += 1;
  }

  return {
    whereClause: conditions.join(" AND "),
    values
  };
}

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

    if (idempotencyKey && error?.code === "23505") {
      const existing = await findExistingByIdempotency({
        db: pool,
        userId,
        idempotencyKey
      });

      if (existing) {
        return {
          transaction: mapTransactionRow(existing),
          reused: true
        };
      }
    }

    throw error;
  } finally {
    client.release();
  }
}

async function listTransactions(userId, query) {
  const { whereClause, values } = buildTransactionsFilterQuery({
    userId,
    query
  });

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM transactions
     WHERE ${whereClause}`,
    values
  );

  const total = countResult.rows[0]?.total || 0;
  const limitIndex = values.length + 1;
  const offsetIndex = values.length + 2;

  const rowsResult = await pool.query(
    `SELECT id, recipient_identifier, source_currency, amount, fee_amount, net_amount, status, created_at
     FROM transactions
     WHERE ${whereClause}
     ORDER BY created_at DESC, id DESC
     LIMIT $${limitIndex}
     OFFSET $${offsetIndex}`,
    [...values, query.limit, query.offset]
  );

  return {
    transactions: rowsResult.rows.map(mapTransactionRow),
    meta: {
      total,
      limit: query.limit,
      offset: query.offset,
      hasMore: query.offset + query.limit < total
    }
  };
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
