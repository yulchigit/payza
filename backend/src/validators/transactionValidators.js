const { z } = require("zod");
const { normalizeCurrency } = require("../utils/currency");

const createTransactionSchema = z.object({
  recipientIdentifier: z.string().trim().min(2).max(255),
  sourceCurrency: z
    .string()
    .trim()
    .min(2)
    .max(10)
    .transform((value) => normalizeCurrency(value)),
  amount: z.number().positive().max(10_000_000)
});

const transactionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

const walletOverviewQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

module.exports = {
  createTransactionSchema,
  transactionsQuerySchema,
  walletOverviewQuerySchema
};
