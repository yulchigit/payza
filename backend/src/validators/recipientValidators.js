const { z } = require("zod");

const favoritesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20)
});

const recipientIdentifierSchema = z
  .string()
  .trim()
  .min(2)
  .max(255)
  .regex(/^[\p{L}\p{N}\s@+_.\-():#]+$/u, "Recipient identifier contains invalid characters");

const recipientNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[\p{L}\p{N}\s.'-]+$/u, "Recipient name contains invalid characters");

const upsertFavoriteRecipientSchema = z.object({
  recipientIdentifier: recipientIdentifierSchema,
  recipientName: recipientNameSchema.optional()
});

const favoriteRecipientParamSchema = z.object({
  id: z.string().uuid("Invalid favorite recipient id")
});

module.exports = {
  favoritesQuerySchema,
  upsertFavoriteRecipientSchema,
  favoriteRecipientParamSchema
};
