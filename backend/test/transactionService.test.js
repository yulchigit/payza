const test = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/payza";
process.env.JWT_SECRET = process.env.JWT_SECRET || "x".repeat(64);
process.env.JWT_ISSUER = process.env.JWT_ISSUER || "payza-api";
process.env.JWT_AUDIENCE = process.env.JWT_AUDIENCE || "payza-clients";

const pool = require("../src/db/pool");
const {
  createTransaction,
  listTransactions,
  getTransactionById
} = require("../src/services/transactionService");

const originalQuery = pool.query;
const originalConnect = pool.connect;

test.afterEach(() => {
  pool.query = originalQuery;
  pool.connect = originalConnect;
});

test("createTransaction reuses existing record for same idempotency key", async () => {
  const calls = [];
  const existing = {
    id: "22222222-2222-2222-2222-222222222222",
    recipient_identifier: "+998901234567",
    source_currency: "USD",
    amount: "10",
    fee_amount: "0.05",
    net_amount: "9.95",
    status: "success",
    created_at: "2026-02-20T10:00:00.000Z"
  };

  pool.connect = async () => ({
    async query(sql, params) {
      calls.push({ sql, params });
      if (sql === "BEGIN" || sql === "COMMIT") return { rows: [] };
      if (sql.includes("FROM transactions") && sql.includes("idempotency_key")) {
        return { rows: [existing] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
    release() {
      calls.push({ sql: "RELEASE", params: [] });
    }
  });

  const result = await createTransaction({
    userId: "11111111-1111-1111-1111-111111111111",
    payload: {
      recipientIdentifier: "+998901234567",
      sourceCurrency: "USD",
      amount: 10
    },
    idempotencyKey: "idem-key-12345678"
  });

  assert.equal(result.reused, true);
  assert.equal(result.transaction.id, existing.id);
  assert.equal(result.transaction.feeAmount, 0.05);
  assert.ok(calls.some((item) => item.sql === "COMMIT"));
});

test("createTransaction rolls back when balance is insufficient", async () => {
  const calls = [];
  pool.connect = async () => ({
    async query(sql, params) {
      calls.push({ sql, params });
      if (sql === "BEGIN" || sql === "ROLLBACK") return { rows: [] };
      if (sql.includes("FROM wallets") && sql.includes("FOR UPDATE")) {
        return {
          rows: [
            {
              id: "wallet-1",
              currency: "USD",
              balance: "5"
            }
          ]
        };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
    release() {
      calls.push({ sql: "RELEASE", params: [] });
    }
  });

  await assert.rejects(
    () =>
      createTransaction({
        userId: "11111111-1111-1111-1111-111111111111",
        payload: {
          recipientIdentifier: "Ali Valiyev",
          sourceCurrency: "USD",
          amount: 8
        },
        idempotencyKey: null
      }),
    (error) => error?.publicMessage === "Insufficient balance" && error?.statusCode === 400
  );

  assert.ok(calls.some((item) => item.sql === "ROLLBACK"));
});

test("listTransactions returns mapped rows with safe meta", async () => {
  const calls = [];
  pool.query = async (sql, params) => {
    calls.push({ sql, params });
    if (sql.includes("COUNT(*)::int AS total")) {
      return { rows: [{ total: 3 }] };
    }
    if (sql.includes("ORDER BY created_at DESC")) {
      return {
        rows: [
          {
            id: "tx-1",
            recipient_identifier: "Ali Valiyev",
            source_currency: "USD",
            amount: "100",
            fee_amount: "0.5",
            net_amount: "99.5",
            status: "success",
            created_at: "2026-02-20T10:00:00.000Z"
          }
        ]
      };
    }
    throw new Error(`Unexpected query: ${sql}`);
  };

  const result = await listTransactions("user-1", {
    limit: 1,
    offset: 0,
    status: "success",
    sourceCurrency: "USD",
    search: "Ali",
    from: "2026-02-01",
    to: "2026-02-20"
  });

  assert.equal(result.transactions.length, 1);
  assert.equal(result.transactions[0].amount, 100);
  assert.equal(result.meta.total, 3);
  assert.equal(result.meta.hasMore, true);

  const countParams = calls[0].params;
  assert.ok(countParams.includes("success"));
  assert.ok(countParams.includes("USD"));
  assert.ok(countParams.includes("%Ali%"));
  assert.ok(countParams.includes("2026-02-01T00:00:00.000Z"));
  assert.ok(countParams.includes("2026-02-21T00:00:00.000Z"));
});

test("getTransactionById returns null when transaction is missing", async () => {
  pool.query = async () => ({ rows: [] });

  const transaction = await getTransactionById(
    "11111111-1111-1111-1111-111111111111",
    "33333333-3333-3333-3333-333333333333"
  );

  assert.equal(transaction, null);
});
