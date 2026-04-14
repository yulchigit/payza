const express = require("express");
const pool = require("../db/pool");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// Enhanced health check with database status
router.get(
  "/health",
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    let dbStatus = "ok";
    let dbResponseTime = 0;

    try {
      const dbStart = Date.now();
      await pool.query("SELECT 1");
      dbResponseTime = Date.now() - dbStart;
    } catch (error) {
      dbStatus = "error";
      console.error("[HEALTH CHECK] Database connection failed:", error.message);
    }

    const responseTime = Date.now() - startTime;
    const healthStatus = dbStatus === "ok" ? "healthy" : "degraded";

    res.status(dbStatus === "ok" ? 200 : 503).json({
      success: dbStatus === "ok",
      service: "payza-backend",
      status: healthStatus,
      database: {
        status: dbStatus,
        responseTime: `${dbResponseTime}ms`
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    });
  })
);

module.exports = router;
