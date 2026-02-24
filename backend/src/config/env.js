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

const DEFAULT_DEV_CORS_ORIGINS = [
  "http://localhost:4029",
  "http://127.0.0.1:4029",
  "http://localhost",
  "http://127.0.0.1",
  "capacitor://localhost",
  "ionic://localhost"
];

const DEFAULT_PRODUCTION_CORS_ORIGINS = [
  "https://payza-gray.vercel.app",
  "https://payza.vercel.app",
  "https://payza-fj0xjzd4n-yulchinarziyev-1538s-projects.vercel.app"
];

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const isDisallowedLocalOrigin = (origin) => {
  const value = String(origin || "").trim().toLowerCase();
  if (!value) return false;

  if (value === "capacitor://localhost" || value === "ionic://localhost") {
    return false;
  }

  try {
    const parsed = new URL(value);
    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";
    const isLocalHost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    return isHttp && isLocalHost;
  } catch (error) {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(value);
  }
};

const hasLocalOrigin = (origins) => origins.some((origin) => isDisallowedLocalOrigin(origin));

const isPlaceholderSecret = (value) => {
  const lower = String(value || "").toLowerCase();
  return (
    lower.includes("change-me") ||
    lower.includes("your-secret") ||
    lower.includes("placeholder") ||
    lower.includes("example")
  );
};

const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret.length < 32) {
  throw new Error("JWT_SECRET is too short. Use at least 32 characters.");
}

const nodeEnv = process.env.NODE_ENV || "development";
const providedCorsOrigins = parseOrigins(process.env.CORS_ORIGINS);
const corsOrigins =
  providedCorsOrigins.length > 0
    ? providedCorsOrigins
    : nodeEnv === "production"
      ? DEFAULT_PRODUCTION_CORS_ORIGINS
      : DEFAULT_DEV_CORS_ORIGINS;

const databaseUrl = String(process.env.DATABASE_URL || "").trim();
if (!/^postgres(ql)?:\/\//i.test(databaseUrl)) {
  throw new Error("DATABASE_URL must be a valid PostgreSQL connection string.");
}

const jwtIssuer = String(process.env.JWT_ISSUER || "payza-api").trim();
const jwtAudience = String(process.env.JWT_AUDIENCE || "payza-clients").trim();
if (!jwtIssuer) {
  throw new Error("JWT_ISSUER cannot be empty.");
}
if (!jwtAudience) {
  throw new Error("JWT_AUDIENCE cannot be empty.");
}

if (nodeEnv === "production") {
  if (corsOrigins.length === 0) {
    throw new Error("CORS_ORIGINS is required in production.");
  }
  if (hasLocalOrigin(corsOrigins)) {
    throw new Error("CORS_ORIGINS cannot include http/https localhost or 127.0.0.1 in production.");
  }
  if (isPlaceholderSecret(jwtSecret)) {
    throw new Error("JWT_SECRET looks like a placeholder and is not allowed in production.");
  }
}

module.exports = {
  nodeEnv,
  port: Number(process.env.PORT || 5000),
  databaseUrl,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtIssuer,
  jwtAudience,
  bcryptRounds: clamp(toInt(process.env.BCRYPT_ROUNDS, 12), 10, 14),
  authMaxFailedAttempts: clamp(toInt(process.env.AUTH_MAX_FAILED_ATTEMPTS, 5), 3, 10),
  authLockMinutes: clamp(toInt(process.env.AUTH_LOCK_MINUTES, 15), 5, 120),
  apiRateLimitWindowMs: clamp(toInt(process.env.API_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000), 60_000, 3_600_000),
  apiRateLimitMax: clamp(toInt(process.env.API_RATE_LIMIT_MAX, 300), 50, 5_000),
  corsOrigins
};
