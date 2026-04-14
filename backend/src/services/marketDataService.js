const { normalizeCurrency } = require("../utils/currency");
const { decimalToUnits, unitsToDecimal, multiplyUnits, divideUnits } = require("../utils/decimal");

const BINANCE_REST_BASE_URL = "https://api.binance.com";
const CBU_USD_RATE_URL = "https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/";
const ONE = decimalToUnits("1");

const withTimeout = async (url, options = {}, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Request failed (${response.status}) for ${url}`);
    }

    return response.json();
  } finally {
    clearTimeout(timer);
  }
};

const formatLabel = (timestamp, interval) => {
  const date = new Date(Number(timestamp));
  if (interval.endsWith("m") || interval.endsWith("h")) {
    return date.toISOString().slice(11, 16);
  }
  return date.toISOString().slice(5, 10);
};

const getUsdToUzsRate = async () => {
  const payload = await withTimeout(CBU_USD_RATE_URL);
  const usdRow = Array.isArray(payload) ? payload[0] : null;

  if (!usdRow?.Rate) {
    throw new Error("Failed to load USD/UZS reference rate.");
  }

  return {
    source: "CBU",
    date: usdRow.Date,
    usdToUzs: String(usdRow.Rate)
  };
};

const getBinance24hrTicker = async (symbol) => {
  const payload = await withTimeout(`${BINANCE_REST_BASE_URL}/api/v3/ticker/24hr?symbol=${symbol}`);

  if (!payload?.symbol || !payload?.lastPrice) {
    throw new Error(`Failed to load Binance ticker for ${symbol}.`);
  }

  return {
    symbol: payload.symbol,
    lastPrice: String(payload.lastPrice),
    openPrice: String(payload.openPrice),
    highPrice: String(payload.highPrice),
    lowPrice: String(payload.lowPrice),
    volume: String(payload.volume),
    quoteVolume: String(payload.quoteVolume),
    priceChangePercent: String(payload.priceChangePercent),
    closeTime: payload.closeTime
  };
};

const getBinanceKlines = async ({ symbol, interval = "1h", limit = 24 }) => {
  const payload = await withTimeout(
    `${BINANCE_REST_BASE_URL}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  );

  if (!Array.isArray(payload)) {
    throw new Error(`Failed to load Binance klines for ${symbol}.`);
  }

  return payload.map((entry) => ({
    openTime: entry[0],
    closeTime: entry[6],
    openPrice: String(entry[1]),
    highPrice: String(entry[2]),
    lowPrice: String(entry[3]),
    closePrice: String(entry[4]),
    volume: String(entry[5]),
    label: formatLabel(entry[0], interval)
  }));
};

const buildSupportedUsdRates = ({ usdToUzs, btcToUsdt }) => {
  const usdToUzsUnits = decimalToUnits(usdToUzs);
  const btcToUsdtUnits = decimalToUnits(btcToUsdt);

  return {
    USD: unitsToDecimal(ONE),
    USDT: unitsToDecimal(ONE),
    UZS: unitsToDecimal(divideUnits(ONE, usdToUzsUnits)),
    BTC: unitsToDecimal(btcToUsdtUnits)
  };
};

const buildFeaturedMarkets = ({ usdToUzs, btcTicker }) => {
  const usdToUzsUnits = decimalToUnits(usdToUzs);
  const btcToUsdtUnits = decimalToUnits(btcTicker.lastPrice);
  const btcToUzsUnits = multiplyUnits(btcToUsdtUnits, usdToUzsUnits);

  return [
    {
      symbol: "BTC/USDT",
      baseCurrency: "BTC",
      quoteCurrency: "USDT",
      lastPrice: btcTicker.lastPrice,
      openPrice: btcTicker.openPrice,
      highPrice: btcTicker.highPrice,
      lowPrice: btcTicker.lowPrice,
      priceChangePercent: btcTicker.priceChangePercent,
      source: "Binance"
    },
    {
      symbol: "USDT/UZS",
      baseCurrency: "USDT",
      quoteCurrency: "UZS",
      lastPrice: unitsToDecimal(usdToUzsUnits),
      openPrice: unitsToDecimal(usdToUzsUnits),
      highPrice: unitsToDecimal(usdToUzsUnits),
      lowPrice: unitsToDecimal(usdToUzsUnits),
      priceChangePercent: "0",
      source: "CBU x USDT peg"
    },
    {
      symbol: "BTC/UZS",
      baseCurrency: "BTC",
      quoteCurrency: "UZS",
      lastPrice: unitsToDecimal(btcToUzsUnits),
      openPrice: unitsToDecimal(multiplyUnits(decimalToUnits(btcTicker.openPrice), usdToUzsUnits)),
      highPrice: unitsToDecimal(multiplyUnits(decimalToUnits(btcTicker.highPrice), usdToUzsUnits)),
      lowPrice: unitsToDecimal(multiplyUnits(decimalToUnits(btcTicker.lowPrice), usdToUzsUnits)),
      priceChangePercent: btcTicker.priceChangePercent,
      source: "Binance x CBU"
    }
  ];
};

const getMarketSnapshot = async () => {
  const [fxRate, btcTicker] = await Promise.all([
    getUsdToUzsRate(),
    getBinance24hrTicker("BTCUSDT")
  ]);

  const usdRates = buildSupportedUsdRates({
    usdToUzs: fxRate.usdToUzs,
    btcToUsdt: btcTicker.lastPrice
  });

  return {
    generatedAt: new Date().toISOString(),
    referenceRates: {
      usdToUzs: fxRate.usdToUzs,
      btcToUsdt: btcTicker.lastPrice
    },
    usdRates,
    featuredMarkets: buildFeaturedMarkets({
      usdToUzs: fxRate.usdToUzs,
      btcTicker
    }),
    sources: {
      fiat: {
        provider: fxRate.source,
        date: fxRate.date
      },
      crypto: {
        provider: "Binance",
        closeTime: btcTicker.closeTime
      }
    }
  };
};

const convertPriceUnits = ({ baseCurrency, quoteCurrency, basePriceUnits, snapshot }) => {
  const normalizedBase = normalizeCurrency(baseCurrency);
  const normalizedQuote = normalizeCurrency(quoteCurrency);
  const usdToUzsUnits = decimalToUnits(snapshot.referenceRates.usdToUzs);

  if (normalizedBase === normalizedQuote) {
    return ONE;
  }

  if (normalizedBase === "BTC" && normalizedQuote === "USDT") {
    return basePriceUnits;
  }

  if (normalizedBase === "BTC" && normalizedQuote === "UZS") {
    return multiplyUnits(basePriceUnits, usdToUzsUnits);
  }

  if (normalizedBase === "USDT" && normalizedQuote === "UZS") {
    return usdToUzsUnits;
  }

  if (normalizedBase === "USDT" && normalizedQuote === "USD") {
    return ONE;
  }

  if (normalizedBase === "BTC" && normalizedQuote === "USD") {
    return basePriceUnits;
  }

  if (normalizedBase === "UZS" && normalizedQuote === "USDT") {
    return divideUnits(ONE, usdToUzsUnits);
  }

  if (normalizedBase === "UZS" && normalizedQuote === "BTC") {
    return divideUnits(ONE, multiplyUnits(decimalToUnits(snapshot.referenceRates.btcToUsdt), usdToUzsUnits));
  }

  if (normalizedBase === "UZS" && normalizedQuote === "USD") {
    return divideUnits(ONE, usdToUzsUnits);
  }

  throw new Error(`Unsupported market pair: ${normalizedBase}/${normalizedQuote}`);
};

const getAssetHistory = async ({ baseCurrency, quoteCurrency, interval = "1h", limit = 24 }) => {
  const normalizedBase = normalizeCurrency(baseCurrency);
  const normalizedQuote = normalizeCurrency(quoteCurrency);
  const snapshot = await getMarketSnapshot();

  if (normalizedBase === "BTC") {
    const klines = await getBinanceKlines({ symbol: "BTCUSDT", interval, limit });
    return klines.map((entry) => {
      const priceUnits = convertPriceUnits({
        baseCurrency: normalizedBase,
        quoteCurrency: normalizedQuote,
        basePriceUnits: decimalToUnits(entry.closePrice),
        snapshot
      });

      return {
        label: entry.label,
        timestamp: entry.closeTime,
        price: unitsToDecimal(priceUnits)
      };
    });
  }

  if (normalizedBase === "USDT") {
    const priceUnits = convertPriceUnits({
      baseCurrency: normalizedBase,
      quoteCurrency: normalizedQuote,
      basePriceUnits: ONE,
      snapshot
    });

    return Array.from({ length: limit }, (_, index) => ({
      label: `${index + 1}`,
      timestamp: Date.now() - (limit - index) * 60 * 60 * 1000,
      price: unitsToDecimal(priceUnits)
    }));
  }

  throw new Error(`Unsupported history base currency: ${normalizedBase}`);
};

const buildPortfolioHistory = async ({ balances, points = 7 }) => {
  const snapshot = await getMarketSnapshot();
  const btcHistory = await getBinanceKlines({ symbol: "BTCUSDT", interval: "1d", limit: points });
  const usdRates = snapshot.usdRates;

  const stableUsdUnits = balances.reduce((sum, balance) => {
    const currency = normalizeCurrency(balance.currency);
    if (currency === "BTC") {
      return sum;
    }

    const amountUnits = decimalToUnits(balance.amount || 0);
    const usdRateUnits = decimalToUnits(usdRates[currency] || "0");
    return sum + multiplyUnits(amountUnits, usdRateUnits);
  }, 0n);

  const btcBalanceUnits = balances.reduce((sum, balance) => {
    const currency = normalizeCurrency(balance.currency);
    if (currency !== "BTC") {
      return sum;
    }
    return sum + decimalToUnits(balance.amount || 0);
  }, 0n);

  return btcHistory.map((point) => {
    const btcValueUsdUnits = multiplyUnits(btcBalanceUnits, decimalToUnits(point.closePrice));
    const totalValueUsdUnits = stableUsdUnits + btcValueUsdUnits;

    return {
      label: point.label,
      timestamp: point.closeTime,
      totalBalanceUsd: Number(unitsToDecimal(totalValueUsdUnits))
    };
  });
};

module.exports = {
  getMarketSnapshot,
  getAssetHistory,
  buildPortfolioHistory,
  convertPriceUnits
};

