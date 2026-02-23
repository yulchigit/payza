const { z } = require("zod");
const { normalizeCurrency } = require("../utils/currency");

const createTransactionSchema = z.object({
  recipientIdentifier: z
    .string()
    .trim()
    .min(2)
    .max(255)
    .regex(/^[\p{L}\p{N}\s@+_.\-():#]+$/u, "Recipient contains invalid characters"),
  sourceCurrency: z
    .string()
    .trim()
    .min(2)
    .max(10)
    .transform((value) => normalizeCurrency(value)),
  amount: z.number().positive().max(10_000_000)
});

const DATE_YMD_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TRANSACTION_STATUSES = ["pending", "processing", "success", "failed"];

const parseUtcDateFromYmd = (value) => {
  const [year, month, day] = String(value).split("-").map((part) => Number.parseInt(part, 10));
  return new Date(Date.UTC(year, month - 1, day));
};

const transactionsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).max(5000).default(0),
    status: z.enum(TRANSACTION_STATUSES).optional(),
    sourceCurrency: z
      .string()
      .trim()
      .min(2)
      .max(10)
      .regex(/^[A-Za-z]{2,10}$/)
      .transform((value) => normalizeCurrency(value))
      .optional(),
    search: z
      .string()
      .trim()
      .min(2)
      .max(120)
      .regex(/^[\p{L}\p{N}\s@+_.\-():#]+$/u, "Search contains invalid characters")
      .optional(),
    from: z.string().regex(DATE_YMD_REGEX, "Invalid 'from' date format").optional(),
    to: z.string().regex(DATE_YMD_REGEX, "Invalid 'to' date format").optional()
  })
  .superRefine((value, context) => {
    if (!value.from || !value.to) {
      return;
    }

    const fromDate = parseUtcDateFromYmd(value.from);
    const toDate = parseUtcDateFromYmd(value.to);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["from"],
        message: "Invalid date value"
      });
      return;
    }

    if (fromDate > toDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["from"],
        message: "'from' date must be earlier than or equal to 'to' date"
      });
      return;
    }

    const rangeMs = toDate.getTime() - fromDate.getTime();
    const maxRangeMs = 366 * 24 * 60 * 60 * 1000;
    if (rangeMs > maxRangeMs) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["to"],
        message: "Date range is too large"
      });
    }
  });

const walletOverviewQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

const transactionIdParamSchema = z.object({
  id: z.string().uuid("Invalid transaction id")
});

module.exports = {
  createTransactionSchema,
  transactionsQuerySchema,
  walletOverviewQuerySchema,
  transactionIdParamSchema
};
