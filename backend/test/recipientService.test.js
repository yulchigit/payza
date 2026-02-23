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
  listFavoriteRecipients,
  upsertFavoriteRecipient,
  deleteFavoriteRecipient
} = require("../src/services/recipientService");

const originalQuery = pool.query;

test.afterEach(() => {
  pool.query = originalQuery;
});

test("upsertFavoriteRecipient trims identifier and falls back name", async () => {
  const captured = [];
  pool.query = async (sql, params) => {
    captured.push({ sql, params });
    return {
      rows: [
        {
          id: "fav-1",
          recipient_name: params[1],
          recipient_identifier: params[2],
          last_used_at: "2026-02-20T10:00:00.000Z",
          created_at: "2026-02-20T10:00:00.000Z"
        }
      ]
    };
  };

  const favorite = await upsertFavoriteRecipient({
    userId: "user-1",
    recipientName: "   ",
    recipientIdentifier: "  +998901234567  "
  });

  assert.equal(favorite.recipientName, "+998901234567");
  assert.equal(favorite.recipientIdentifier, "+998901234567");
  assert.equal(captured[0].params[1], "+998901234567");
  assert.equal(captured[0].params[2], "+998901234567");
});

test("listFavoriteRecipients applies caller-provided limit", async () => {
  const calls = [];
  pool.query = async (sql, params) => {
    calls.push({ sql, params });
    return { rows: [] };
  };

  const result = await listFavoriteRecipients("user-1", 15);

  assert.deepEqual(result, []);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].params[1], 15);
});

test("deleteFavoriteRecipient returns false when row not found", async () => {
  pool.query = async () => ({ rowCount: 0 });

  const deleted = await deleteFavoriteRecipient({
    userId: "user-1",
    favoriteId: "44444444-4444-4444-4444-444444444444"
  });

  assert.equal(deleted, false);
});
