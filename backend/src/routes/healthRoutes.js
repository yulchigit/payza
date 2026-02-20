const express = require("express");
const pool = require("../db/pool");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/health",
  asyncHandler(async (req, res) => {
    await pool.query("SELECT 1");
    res.json({
      success: true,
      service: "payza-backend",
      status: "ok",
      timestamp: new Date().toISOString()
    });
  })
);

module.exports = router;
