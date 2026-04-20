const test = require("node:test");
const assert = require("node:assert/strict");

const originalFetch = global.fetch;
const marketDataService = require("../src/services/marketDataService");

const createJsonResponse = (payload) => ({
  ok: true,
  json: async () => payload
});

test.afterEach(() => {
  global.fetch = originalFetch;
});

test("getMarketSnapshot combines CoinGecko and CBU reference rates", async () => {
  global.fetch = async (url) => {
    if (url.includes("cbu.uz")) {
      return createJsonResponse([
        {
          Rate: "12125.50",
          Date: "14.04.2026"
        }
      ]);
    }

    if (url.includes("/coins/bitcoin?")) {
      return createJsonResponse({
        market_data: {
          current_price: { usd: 70000.0 },
          high_24h: { usd: 71000.0 },
          low_24h: { usd: 68000.0 },
          price_change_percentage_24h: 1.45,
          price_change_24h: { usd: 1000.0 },
          total_volume: { usd: 100.0 }
        }
      });
    }

    throw new Error(`Unexpected url: ${url}`);
  };

  const snapshot = await marketDataService.getMarketSnapshot();

  assert.equal(snapshot.referenceRates.usdToUzs, "12125.50");
  assert.equal(snapshot.referenceRates.btcToUsdt, "70000.00");
  assert.equal(snapshot.usdRates.USDT, "1");
  assert.ok(Number(snapshot.usdRates.UZS) > 0);
  assert.equal(snapshot.featuredMarkets[0].symbol, "BTC/USDT");
  assert.equal(snapshot.featuredMarkets[2].symbol, "BTC/UZS");
});

test("getAssetHistory converts BTC history into UZS", async () => {
  global.fetch = async (url) => {
    if (url.includes("cbu.uz")) {
      return createJsonResponse([
        {
          Rate: "12000.00",
          Date: "14.04.2026"
        }
      ]);
    }

    if (url.includes("/coins/bitcoin?")) {
      return createJsonResponse({
        market_data: {
          current_price: { usd: 75000.0 },
          high_24h: { usd: 76000.0 },
          low_24h: { usd: 73000.0 },
          price_change_percentage_24h: 1.2,
          price_change_24h: { usd: 1000.0 },
          total_volume: { usd: 100.0 }
        }
      });
    }

    if (url.includes("market_chart")) {
      return createJsonResponse({
        prices: [
          [1776103599999, 74100.0],
          [1776107199999, 74300.0]
        ],
        total_volumes: [
          [1776103599999, 10],
          [1776107199999, 12]
        ]
      });
    }

    throw new Error(`Unexpected url: ${url}`);
  };

  const history = await marketDataService.getAssetHistory({
    baseCurrency: "BTC",
    quoteCurrency: "UZS",
    interval: "1h",
    limit: 2
  });

  assert.equal(history.length, 2);
  assert.equal(history[0].price, "889200000");
  assert.equal(history[1].price, "891600000");
});
