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

test("getMarketSnapshot combines Binance and CBU reference rates", async () => {
  global.fetch = async (url) => {
    if (url.includes("cbu.uz")) {
      return createJsonResponse([
        {
          Rate: "12125.50",
          Date: "14.04.2026"
        }
      ]);
    }

    if (url.includes("ticker/24hr")) {
      return createJsonResponse({
        symbol: "BTCUSDT",
        lastPrice: "70000.00",
        openPrice: "69000.00",
        highPrice: "71000.00",
        lowPrice: "68000.00",
        volume: "100.0",
        quoteVolume: "7000000.0",
        priceChangePercent: "1.45",
        closeTime: 1776143880755
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

    if (url.includes("ticker/24hr")) {
      return createJsonResponse({
        symbol: "BTCUSDT",
        lastPrice: "75000.00",
        openPrice: "74000.00",
        highPrice: "76000.00",
        lowPrice: "73000.00",
        volume: "100.0",
        quoteVolume: "7500000.0",
        priceChangePercent: "1.2",
        closeTime: 1776143880755
      });
    }

    if (url.includes("klines")) {
      return createJsonResponse([
        [1776100000000, "74000.00", "74200.00", "73800.00", "74100.00", "10", 1776103599999],
        [1776103600000, "74100.00", "74400.00", "73900.00", "74300.00", "12", 1776107199999]
      ]);
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
