const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const backendEnvPath = path.resolve(__dirname, "../../.env");
const rootEnvPath = path.resolve(__dirname, "../../../.env");
const envPath = fs.existsSync(backendEnvPath) ? backendEnvPath : rootEnvPath;

dotenv.config({ path: envPath });

const required = ["DATABASE_URL", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const parseOrigins = (value) =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret.length < 32) {
  throw new Error("JWT_SECRET is too short. Use at least 32 characters.");
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtIssuer: process.env.JWT_ISSUER || "payza-api",
  jwtAudience: process.env.JWT_AUDIENCE || "payza-clients",
  bcryptRounds: clamp(toInt(process.env.BCRYPT_ROUNDS, 12), 10, 14),
  authMaxFailedAttempts: clamp(toInt(process.env.AUTH_MAX_FAILED_ATTEMPTS, 5), 3, 10),
  authLockMinutes: clamp(toInt(process.env.AUTH_LOCK_MINUTES, 15), 5, 120),
  apiRateLimitWindowMs: clamp(toInt(process.env.API_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000), 60_000, 3_600_000),
  apiRateLimitMax: clamp(toInt(process.env.API_RATE_LIMIT_MAX, 300), 50, 5_000),
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS)
};
