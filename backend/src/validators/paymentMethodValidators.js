const { z } = require("zod");

const updatePaymentMethodSchema = z.object({
  actionType: z.enum(["connect", "disconnect"]),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  walletAddress: z.string().optional()
});

const paymentMethodParamSchema = z.object({
  id: z.string().uuid("Invalid payment method id")
});

module.exports = {
  updatePaymentMethodSchema,
  paymentMethodParamSchema
};
