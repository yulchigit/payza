const express = require("express");
const requireAuth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { getMarketSnapshot, getAssetHistory } = require("../services/marketDataService");
const { createDemoQuote, executeDemoSwap } = require("../services/demoSwapService");
const { marketQuoteSchema, marketSwapSchema, marketHistoryQuerySchema } = require("../validators/marketValidators");

const router = express.Router();
router.use(requireAuth);

router.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const snapshot = await getMarketSnapshot();

    return res.json({
      success: true,
      data: snapshot
    });
  })
);

router.get(
  "/history",
  asyncHandler(async (req, res) => {
    const query = marketHistoryQuerySchema.parse(req.query);
    const history = await getAssetHistory(query);

    return res.json({
      success: true,
      data: history
    });
  })
);

router.post(
  "/quote",
  asyncHandler(async (req, res) => {
    const payload = marketQuoteSchema.parse(req.body);
    const quote = await createDemoQuote(payload);

    return res.json({
      success: true,
      data: quote
    });
  })
);

router.post(
  "/swap",
  asyncHandler(async (req, res) => {
    const payload = marketSwapSchema.parse(req.body);
    const idempotencyKey = req.get("Idempotency-Key");
    if (idempotencyKey && !/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Idempotency-Key header"
      });
    }

    const result = await executeDemoSwap({
      userId: req.user.id,
      amount: payload.amount,
      fromCurrency: payload.fromCurrency,
      toCurrency: payload.toCurrency,
      idempotencyKey
    });

    return res.status(result.reused ? 200 : 201).json({
      success: true,
      data: result
    });
  })
);

module.exports = router;
