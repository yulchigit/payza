const rateLimit = require("express-rate-limit");
const env = require("../config/env");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: env.apiRateLimitWindowMs,
  limit: env.apiRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    error: "Too many requests. Try again later."
  }
});

// Strict rate limiter for authentication endpoints (login, register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Max 10 attempts per 15 min (stricter than before)
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  keyGenerator: (req) => {
    // Rate limit by IP + email combo for login/register
    const email = req.body?.email || "";
    return `${req.ip}-${email}`;
  },
  message: {
    success: false,
    error: "Too many authentication attempts. Try again in 15 minutes."
  }
});

// Extra strict for password reset attempts (prevent email enumeration)
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  limit: 3, // Max 3 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  keyGenerator: (req) => `${req.ip}-${req.body?.email || ""}`,
  message: {
    success: false,
    error: "Too many password reset attempts. Try again in 1 hour."
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter
};
