const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const { loginSchema, registerSchema } = require("../validators/authValidators");
const { createUser, findUserByEmail } = require("../services/userService");
const { authLimiter } = require("../middleware/rateLimiters");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const signAccessToken = (user) =>
  jwt.sign({ email: user.email }, env.jwtSecret, {
    subject: user.id,
    expiresIn: env.jwtExpiresIn
  });

router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const existing = await findUserByEmail(payload.email);

    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Email already registered"
      });
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await createUser({
      fullName: payload.fullName,
      email: payload.email,
      passwordHash
    });

    // Create default wallets for a newly registered user.
    await pool.query(
      `INSERT INTO wallets (user_id, currency, balance)
       VALUES ($1, 'USD', 0), ($1, 'UZS', 0), ($1, 'USDT', 0), ($1, 'BTC', 0)`,
      [user.id]
    );

    const token = signAccessToken({ id: user.id, email: user.email });

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          createdAt: user.created_at
        }
      }
    });
  })
);

router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const user = await findUserByEmail(payload.email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    const token = signAccessToken({ id: user.id, email: user.email });

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email
        }
      }
    });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `SELECT id, full_name, email, created_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [req.user.id]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        createdAt: user.created_at
      }
    });
  })
);

module.exports = router;
