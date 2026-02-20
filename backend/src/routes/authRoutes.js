const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const delay = require("../utils/delay");
const { loginSchema, registerSchema } = require("../validators/authValidators");
const {
  createUser,
  findUserByEmail,
  recordFailedLoginAttempt,
  clearLoginSecurityState,
  createAuthAuditLog
} = require("../services/userService");
const { authLimiter } = require("../middleware/rateLimiters");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.ip || null;
};

const signAccessToken = (user) =>
  jwt.sign({ email: user.email }, env.jwtSecret, {
    subject: user.id,
    expiresIn: env.jwtExpiresIn,
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
    algorithm: "HS256"
  });

router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const clientIp = getClientIp(req);
    const userAgent = req.get("user-agent") || null;
    const existing = await findUserByEmail(payload.email);

    if (existing) {
      await createAuthAuditLog({
        userId: existing.id,
        email: payload.email,
        eventType: "register",
        isSuccess: false,
        failureReason: "email_exists",
        ipAddress: clientIp,
        userAgent
      });

      return res.status(409).json({
        success: false,
        error: "Email already registered"
      });
    }

    const passwordHash = await bcrypt.hash(payload.password, env.bcryptRounds);
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

    await pool.query(
      `INSERT INTO payment_methods (user_id, name, type, category, status)
       VALUES
        ($1, 'Uzcard', 'Debit Card', 'traditional', 'disconnected'),
        ($1, 'Humo', 'Debit Card', 'traditional', 'disconnected'),
        ($1, 'Visa', 'Credit Card', 'traditional', 'disconnected'),
        ($1, 'USDT Wallet', 'Tether (TRC-20)', 'crypto', 'disconnected'),
        ($1, 'Bitcoin Wallet', 'BTC (Native SegWit)', 'crypto', 'disconnected')
       ON CONFLICT (user_id, name) DO NOTHING`,
      [user.id]
    );

    const token = signAccessToken({ id: user.id, email: user.email });

    await createAuthAuditLog({
      userId: user.id,
      email: user.email,
      eventType: "register",
      isSuccess: true,
      ipAddress: clientIp,
      userAgent
    });

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
    const clientIp = getClientIp(req);
    const userAgent = req.get("user-agent") || null;
    const user = await findUserByEmail(payload.email);

    if (!user) {
      await createAuthAuditLog({
        userId: null,
        email: payload.email,
        eventType: "login",
        isSuccess: false,
        failureReason: "invalid_credentials",
        ipAddress: clientIp,
        userAgent
      });
      await delay(400);
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      await createAuthAuditLog({
        userId: user.id,
        email: user.email,
        eventType: "login",
        isSuccess: false,
        failureReason: "account_locked",
        ipAddress: clientIp,
        userAgent
      });
      return res.status(423).json({
        success: false,
        error: "Account is temporarily locked. Try again later."
      });
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.password_hash);
    if (!isPasswordValid) {
      await recordFailedLoginAttempt({
        userId: user.id,
        maxAttempts: env.authMaxFailedAttempts,
        lockMinutes: env.authLockMinutes
      });
      await createAuthAuditLog({
        userId: user.id,
        email: user.email,
        eventType: "login",
        isSuccess: false,
        failureReason: "invalid_credentials",
        ipAddress: clientIp,
        userAgent
      });
      await delay(400);
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    await clearLoginSecurityState(user.id);
    const token = signAccessToken({ id: user.id, email: user.email });
    await createAuthAuditLog({
      userId: user.id,
      email: user.email,
      eventType: "login",
      isSuccess: true,
      ipAddress: clientIp,
      userAgent
    });

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
