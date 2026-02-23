const test = require("node:test");
const assert = require("node:assert/strict");

const envModulePath = require.resolve("../src/config/env");
const originalEnv = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) {
      delete process.env[key];
    }
  }

  for (const [key, value] of Object.entries(originalEnv)) {
    process.env[key] = value;
  }
}

function loadProductionEnv(corsOrigins) {
  process.env.NODE_ENV = "production";
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/payza";
  process.env.JWT_SECRET = "x".repeat(64);
  process.env.JWT_ISSUER = "payza-api";
  process.env.JWT_AUDIENCE = "payza-clients";
  process.env.CORS_ORIGINS = corsOrigins;

  delete require.cache[envModulePath];
  return require("../src/config/env");
}

test.afterEach(() => {
  restoreEnv();
  delete require.cache[envModulePath];
});

test("production env allows capacitor and ionic localhost origins", () => {
  const env = loadProductionEnv("https://payza.example,capacitor://localhost,ionic://localhost");
  assert.equal(env.nodeEnv, "production");
  assert.deepEqual(env.corsOrigins, [
    "https://payza.example",
    "capacitor://localhost",
    "ionic://localhost"
  ]);
});

test("production env rejects http localhost origins", () => {
  assert.throws(
    () => loadProductionEnv("https://payza.example,http://localhost:4029"),
    /CORS_ORIGINS cannot include http\/https localhost or 127\.0\.0\.1 in production\./
  );
});
