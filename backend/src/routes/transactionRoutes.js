const express = require("express");
const requireAuth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const {
  createTransactionSchema,
  transactionsQuerySchema
} = require("../validators/transactionValidators");
const {
  createTransaction,
  listTransactions,
  getTransactionById
} = require("../services/transactionService");

const router = express.Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = transactionsQuerySchema.parse(req.query);
    const transactions = await listTransactions(req.user.id, query.limit);
    return res.json({
      success: true,
      data: transactions
    });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = createTransactionSchema.parse(req.body);
    const idempotencyKey = req.get("Idempotency-Key");
    if (idempotencyKey && !/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Idempotency-Key header"
      });
    }

    const result = await createTransaction({
      userId: req.user.id,
      payload,
      idempotencyKey
    });

    return res.status(result.reused ? 200 : 201).json({
      success: true,
      data: result.transaction
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const transaction = await getTransactionById(req.user.id, req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found"
      });
    }

    return res.json({
      success: true,
      data: transaction
    });
  })
);

module.exports = router;
