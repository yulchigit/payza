const express = require("express");
const pool = require("../db/pool");
const requireAuth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const {
  updatePaymentMethodSchema,
  paymentMethodParamSchema
} = require("../validators/paymentMethodValidators");

const router = express.Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `SELECT id, name, type, category, status, last_four, wallet_address, metadata
       FROM payment_methods
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [req.user.id]
    );

    return res.json({
      success: true,
      data: result.rows
    });
  })
);

router.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const payload = updatePaymentMethodSchema.parse(req.body);
    const { id: methodId } = paymentMethodParamSchema.parse(req.params);

    const result = await pool.query(
      `SELECT id, user_id, category, status
       FROM payment_methods
       WHERE id = $1 AND user_id = $2
       LIMIT 1`,
      [methodId, req.user.id]
    );

    const method = result.rows[0];
    if (!method) {
      return res.status(404).json({
        success: false,
        error: "Payment method not found"
      });
    }

    if (payload.actionType === "disconnect") {
      const updateResult = await pool.query(
        `UPDATE payment_methods
         SET status = 'disconnected',
             last_four = NULL,
             wallet_address = NULL,
             metadata = '{}'::jsonb,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, name, type, category, status, last_four, wallet_address, metadata`,
        [method.id]
      );

      return res.json({
        success: true,
        data: updateResult.rows[0]
      });
    }

    if (method.category === "traditional") {
      const digitsOnly = String(payload.cardNumber || "").replace(/\D/g, "");
      if (digitsOnly.length < 12 || digitsOnly.length > 19) {
        return res.status(400).json({
          success: false,
          error: "Card number is invalid"
        });
      }

      const expiryDate = String(payload.expiryDate || "").trim();
      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        return res.status(400).json({
          success: false,
          error: "Expiry date must be in MM/YY format"
        });
      }

      const lastFour = digitsOnly.slice(-4);
      const updateResult = await pool.query(
        `UPDATE payment_methods
         SET status = 'connected',
             last_four = $2,
             metadata = jsonb_build_object('expiryDate', $3),
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, name, type, category, status, last_four, wallet_address, metadata`,
        [method.id, lastFour, expiryDate]
      );

      return res.json({
        success: true,
        data: updateResult.rows[0]
      });
    }

    const walletAddress = String(payload.walletAddress || "").trim();
    if (walletAddress.length < 10 || walletAddress.length > 255) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is invalid"
      });
    }

    const updateResult = await pool.query(
      `UPDATE payment_methods
       SET status = 'connected',
           wallet_address = $2,
           metadata = '{}'::jsonb,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, type, category, status, last_four, wallet_address, metadata`,
      [method.id, walletAddress]
    );

    return res.json({
      success: true,
      data: updateResult.rows[0]
    });
  })
);

module.exports = router;
