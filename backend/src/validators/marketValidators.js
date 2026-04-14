const { z } = require("zod");
const { normalizeCurrency } = require("../utils/currency");

const SUPPORTED_MARKET_CURRENCIES = ["UZS", "USDT", "BTC"];
const DECIMAL_AMOUNT_REGEX = /^\d+(\.\d{1,8})?$/;

const decimalAmountSchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value ?? "").trim())
  .refine((value) => DECIMAL_AMOUNT_REGEX.test(value), "Amount must be a valid decimal with up to 8 places")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero");

const currencySchema = z
  .string()
  .trim()
  .transform((value) => normalizeCurrency(value))
  .refine((value) => SUPPORTED_MARKET_CURRENCIES.includes(value), "Unsupported currency");

const marketQuoteSchema = z.object({
  fromCurrency: currencySchema,
  toCurrency: currencySchema,
  amount: decimalAmountSchema
});

const marketSwapSchema = marketQuoteSchema.extend({
  maxSlippageBps: z.coerce.number().int().min(0).max(500).optional()
});

const marketHistoryQuerySchema = z.object({
  baseCurrency: currencySchema,
  quoteCurrency: z
    .string()
    .trim()
    .transform((value) => normalizeCurrency(value))
    .refine((value) => ["USD", "UZS", "USDT", "BTC"].includes(value), "Unsupported quote currency"),
  interval: z.enum(["1h", "1d"]).default("1h"),
  limit: z.coerce.number().int().min(6).max(90).default(24)
});

module.exports = {
  marketQuoteSchema,
  marketSwapSchema,
  marketHistoryQuerySchema
};
