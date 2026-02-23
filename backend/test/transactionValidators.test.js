const test = require("node:test");
const assert = require("node:assert/strict");
const { ZodError } = require("zod");
const {
  createTransactionSchema,
  transactionsQuerySchema
} = require("../src/validators/transactionValidators");

test("createTransactionSchema accepts valid payload and normalizes currency", () => {
  const parsed = createTransactionSchema.parse({
    recipientIdentifier: "Ali Valiyev +998901112233",
    sourceCurrency: "usdt",
    amount: 12.5
  });

  assert.equal(parsed.sourceCurrency, "USDT");
  assert.equal(parsed.amount, 12.5);
});

test("createTransactionSchema rejects recipient with invalid characters", () => {
  assert.throws(
    () =>
      createTransactionSchema.parse({
        recipientIdentifier: "Ali<script>alert(1)</script>",
        sourceCurrency: "USD",
        amount: 1
      }),
    ZodError
  );
});

test("transactionsQuerySchema parses valid filter set", () => {
  const parsed = transactionsQuerySchema.parse({
    limit: "10",
    offset: "20",
    status: "success",
    sourceCurrency: "usd",
    search: "Ali",
    from: "2026-01-01",
    to: "2026-01-31"
  });

  assert.equal(parsed.limit, 10);
  assert.equal(parsed.offset, 20);
  assert.equal(parsed.sourceCurrency, "USD");
});

test("transactionsQuerySchema rejects reversed date range", () => {
  assert.throws(
    () =>
      transactionsQuerySchema.parse({
        from: "2026-02-01",
        to: "2026-01-01"
      }),
    ZodError
  );
});

test("transactionsQuerySchema rejects oversized date range", () => {
  assert.throws(
    () =>
      transactionsQuerySchema.parse({
        from: "2024-01-01",
        to: "2026-01-01"
      }),
    ZodError
  );
});

test("transactionsQuerySchema rejects unsafe search pattern", () => {
  assert.throws(
    () =>
      transactionsQuerySchema.parse({
        search: "ali%admin"
      }),
    ZodError
  );
});
