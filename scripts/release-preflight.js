#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

function readTargetFromArgs() {
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--target=")) {
      return arg.slice("--target=".length);
    }
  }
  return null;
}

const cliTarget = readTargetFromArgs();
const target = String(cliTarget || process.env.RELEASE_TARGET || "local").trim().toLowerCase();
const strictProduction = target === "production";

const frontendEnvPath = strictProduction
  ? path.join(projectRoot, ".env.production")
  : path.join(projectRoot, ".env");

const backendEnvPath = strictProduction
  ? path.join(projectRoot, "backend", ".env.production")
  : path.join(projectRoot, "backend", ".env");

const frontendEnvName = strictProduction ? ".env.production" : ".env";
const backendEnvName = strictProduction ? "backend/.env.production" : "backend/.env";

const errors = [];
const warnings = [];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const result = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }

  return result;
}

function ensure(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function warn(condition, message) {
  if (!condition) {
    warnings.push(message);
  }
}

function isLikelyPlaceholderSecret(secret) {
  if (!secret) return true;
  const value = secret.toLowerCase();
  return (
    value.includes("change-me") ||
    value.includes("your-secret") ||
    value.includes("example") ||
    value.includes("placeholder")
  );
}

function isLikelyPlaceholderApiBaseUrl(urlValue) {
  const value = String(urlValue || "").trim().toLowerCase();
  if (!value) return true;
  return (
    value.includes("your-domain.com") ||
    value.includes("example.com") ||
    value.includes("placeholder") ||
    value.includes("replace-me")
  );
}

function toBool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function isDisallowedLocalOrigin(origin) {
  const value = String(origin || "").trim().toLowerCase();
  if (!value) return false;

  try {
    const parsed = new URL(value);
    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";
    const isLocalHost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    return isHttp && isLocalHost;
  } catch (error) {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(value);
  }
}

function hasDisallowedLocalOrigin(originsValue, allowMobileLocalhostOrigin) {
  const origins = String(originsValue || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return origins.some((origin) => {
    const value = String(origin || "").trim().toLowerCase();
    if (!value) return false;
    if (value === "capacitor://localhost" || value === "ionic://localhost") return false;
    if (isDisallowedLocalOrigin(value)) {
      return !allowMobileLocalhostOrigin;
    }
    return false;
  });
}

const frontendEnv = parseEnvFile(frontendEnvPath);
const backendEnv = parseEnvFile(backendEnvPath);

if (!frontendEnv) {
  warnings.push(`${frontendEnvName} not found. Frontend will rely on runtime fallback.`);
}

if (!backendEnv) {
  errors.push(`${backendEnvName} not found. Backend cannot start without required secrets.`);
}

if (frontendEnv) {
  const apiBaseUrl = String(frontendEnv.VITE_API_BASE_URL || "").trim();
  const mobileApiBaseUrl = String(frontendEnv.VITE_MOBILE_API_BASE_URL || "").trim();
  warn(apiBaseUrl.length > 0, `VITE_API_BASE_URL is empty in ${frontendEnvName}.`);
  warn(mobileApiBaseUrl.length > 0, `VITE_MOBILE_API_BASE_URL is empty in ${frontendEnvName}.`);

  if (strictProduction) {
    ensure(apiBaseUrl.startsWith("https://"), "Production requires VITE_API_BASE_URL to start with https://");
    ensure(
      !apiBaseUrl.includes("localhost") && !apiBaseUrl.includes("127.0.0.1"),
      "Production VITE_API_BASE_URL must not point to localhost."
    );
    ensure(
      !isLikelyPlaceholderApiBaseUrl(apiBaseUrl),
      "Production VITE_API_BASE_URL cannot be a placeholder domain."
    );
    ensure(
      mobileApiBaseUrl.startsWith("https://"),
      "Production requires VITE_MOBILE_API_BASE_URL to start with https://"
    );
    ensure(
      !mobileApiBaseUrl.includes("localhost") && !mobileApiBaseUrl.includes("127.0.0.1"),
      "Production VITE_MOBILE_API_BASE_URL must not point to localhost."
    );
    ensure(
      !isLikelyPlaceholderApiBaseUrl(mobileApiBaseUrl),
      "Production VITE_MOBILE_API_BASE_URL cannot be a placeholder domain."
    );
  }
}

if (backendEnv) {
  const databaseUrl = String(backendEnv.DATABASE_URL || "").trim();
  const jwtSecret = String(backendEnv.JWT_SECRET || "");
  const jwtIssuer = String(backendEnv.JWT_ISSUER || "").trim();
  const jwtAudience = String(backendEnv.JWT_AUDIENCE || "").trim();
  const corsOrigins = String(backendEnv.CORS_ORIGINS || "").trim();
  const nodeEnv = String(backendEnv.NODE_ENV || "development").trim().toLowerCase();
  const allowMobileLocalhostOrigin = toBool(backendEnv.CORS_ALLOW_MOBILE_LOCALHOST_ORIGIN, false);

  ensure(databaseUrl.length > 0, `DATABASE_URL is required in ${backendEnvName}.`);
  ensure(jwtSecret.length >= 32, `JWT_SECRET must be at least 32 characters in ${backendEnvName}.`);
  ensure(jwtIssuer.length > 0, `JWT_ISSUER is required in ${backendEnvName}.`);
  ensure(jwtAudience.length > 0, `JWT_AUDIENCE is required in ${backendEnvName}.`);
  warn(!isLikelyPlaceholderSecret(jwtSecret), "JWT_SECRET looks like a placeholder.");

  if (strictProduction) {
    ensure(nodeEnv === "production", `Production release requires NODE_ENV=production in ${backendEnvName}.`);
    ensure(corsOrigins.length > 0, `Production release requires CORS_ORIGINS in ${backendEnvName}.`);
    ensure(
      !hasDisallowedLocalOrigin(corsOrigins, allowMobileLocalhostOrigin),
      "Production CORS_ORIGINS must not include http/https localhost or 127.0.0.1 origins unless CORS_ALLOW_MOBILE_LOCALHOST_ORIGIN=true."
    );
  } else {
    warn(
      corsOrigins.length > 0,
      "CORS_ORIGINS is empty. Development fallback exists, but explicit list is safer."
    );
  }
}

console.log(`Release preflight target: ${target}`);
if (warnings.length > 0) {
  console.log("\nWarnings:");
  for (const item of warnings) {
    console.log(`- ${item}`);
  }
}

if (errors.length > 0) {
  console.error("\nErrors:");
  for (const item of errors) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("\nPreflight checks passed.");
