const express = require("express");
const requireAuth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { walletOverviewQuerySchema } = require("../validators/transactionValidators");
const {
  getWalletBalances,
  getPaymentMethods,
  getRecentTransactions,
  buildOverview
} = require("../services/walletService");

const router = express.Router();
router.use(requireAuth);

router.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const query = walletOverviewQuerySchema.parse(req.query);
    const [balances, paymentMethods, recentTransactions] = await Promise.all([
      getWalletBalances(req.user.id),
      getPaymentMethods(req.user.id),
      getRecentTransactions(req.user.id, query.limit)
    ]);

    const overview = buildOverview({
      balances,
      paymentMethods,
      recentTransactions
    });

    return res.json({
      success: true,
      data: overview
    });
  })
);

module.exports = router;
