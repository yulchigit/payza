const test = require("node:test");
const assert = require("node:assert/strict");
const { ZodError } = require("zod");
const {
  favoritesQuerySchema,
  upsertFavoriteRecipientSchema,
  favoriteRecipientParamSchema
} = require("../src/validators/recipientValidators");

test("favoritesQuerySchema applies safe default limit", () => {
  const parsed = favoritesQuerySchema.parse({});
  assert.equal(parsed.limit, 20);
});

test("upsertFavoriteRecipientSchema accepts valid recipient", () => {
  const parsed = upsertFavoriteRecipientSchema.parse({
    recipientIdentifier: "+998901234567",
    recipientName: "Test Recipient"
  });

  assert.equal(parsed.recipientIdentifier, "+998901234567");
});

test("upsertFavoriteRecipientSchema rejects invalid characters", () => {
  assert.throws(
    () =>
      upsertFavoriteRecipientSchema.parse({
        recipientIdentifier: "Robert'); DROP TABLE recipient_favorites;--",
        recipientName: "Bad Actor"
      }),
    ZodError
  );
});

test("favoriteRecipientParamSchema requires UUID", () => {
  assert.throws(() => favoriteRecipientParamSchema.parse({ id: "123" }), ZodError);
});
