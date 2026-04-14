const test = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/payza";
process.env.JWT_SECRET = process.env.JWT_SECRET || "x".repeat(64);
process.env.JWT_ISSUER = process.env.JWT_ISSUER || "payza-api";
process.env.JWT_AUDIENCE = process.env.JWT_AUDIENCE || "payza-clients";

const pool = require("../src/db/pool");
const { createDemoQuote, executeDemoSwap } = require("../src/services/demoSwapService");

const originalFetch = global.fetch;
const originalConnect = pool.connect;

const createJsonResponse = (payload) => ({
  ok: true,
  json: async () => payload
});

const installMarketFetchMock = () => {
  global.fetch = async (url) => {
    if (url.includes("cbu.uz")) {
      return createJsonResponse([
        {
          Rate: "12000.00",
          Date: "14.04.2026"
        }
      ]);
    }

    if (url.includes("ticker/24hr")) {
      return createJsonResponse({
        symbol: "BTCUSDT",
        lastPrice: "72000.00",
        openPrice: "71000.00",
        highPrice: "72500.00",
        lowPrice: "70500.00",
        volume: "100.0",
        quoteVolume: "7200000.0",
        priceChangePercent: "1.4",
        closeTime: 1776143880755
      });
    }

    throw new Error(`Unexpected url: ${url}`);
  };
};

test.afterEach(() => {
  global.fetch = originalFetch;
  pool.connect = originalConnect;
});

test("createDemoQuote calculates UZS to USDT output with fee and spread", async () => {
  installMarketFetchMock();

  const quote = await createDemoQuote({
    amount: "1200000",
    fromCurrency: "UZS",
    toCurrency: "USDT"
  });

  assert.equal(quote.fromCurrency, "UZS");
  assert.equal(quote.toCurrency, "USDT");
  assert.equal(quote.marketRate, "0.00008333");
  assert.ok(Number(quote.netOutput) > 99);
  assert.equal(quote.feeBps, 50);
  assert.equal(quote.spreadBps, 20);
});

test("executeDemoSwap debits source wallet and credits destination wallet", async () => {
  installMarketFetchMock();
  const calls = [];

  pool.connect = async () => ({
    async query(sql, params) {
      calls.push({ sql, params });

      if (sql === "BEGIN" || sql === "COMMIT") {
        return { rows: [] };
      }

      if (sql.includes("FROM transactions") && sql.includes("idempotency_key")) {
        return { rows: [] };
      }

      if (sql.includes("FROM wallets") && params[1] === "UZS") {
        return {
          rows: [
            {
              id: "wallet-uzs",
              currency: "UZS",
              balance: "2500000.00000000",
              status: "active"
            }
          ]
        };
      }

      if (sql.includes("FROM wallets") && params[1] === "USDT") {
        return {
          rows: [
            {
              id: "wallet-usdt",
              currency: "USDT",
              balance: "15.00000000",
              status: "active"
            }
          ]
        };
      }

      if (sql.startsWith("UPDATE wallets")) {
        return { rows: [] };
      }

      if (sql.includes("INSERT INTO transactions")) {
        return {
          rows: [
            {
              id: "swap-1",
              source_currency: params[2],
              destination_currency: params[3],
              amount: params[4],
              fee_amount: params[5],
              net_amount: params[6],
              status: "success",
              created_at: "2026-04-14T12:00:00.000Z"
            }
          ]
        };
      }

      if (sql.includes("INSERT INTO transaction_events")) {
        return { rows: [] };
      }

      throw new Error(`Unexpected query: ${sql}`);
    },
    release() {
      calls.push({ sql: "RELEASE", params: [] });
    }
  });

  const result = await executeDemoSwap({
    userId: "11111111-1111-1111-1111-111111111111",
    amount: "1200000",
    fromCurrency: "UZS",
    toCurrency: "USDT",
    idempotencyKey: "swap-demo-12345678"
  });

  assert.equal(result.reused, false);
  assert.equal(result.transaction.type, "convert");
  assert.equal(result.transaction.destinationCurrency, "USDT");
  assert.ok(Number(result.transaction.netAmount) > 99);
  assert.ok(calls.some((entry) => entry.sql === "COMMIT"));
  assert.ok(calls.some((entry) => entry.sql.startsWith("UPDATE wallets")));
});
