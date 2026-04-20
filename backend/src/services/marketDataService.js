const { normalizeCurrency } = require("../utils/currency");
const { decimalToUnits, unitsToDecimal, multiplyUnits, divideUnits } = require("../utils/decimal");

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
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

// CoinGecko-based ticker and simple kline generation (avoids blocked exchange APIs)
const COIN_ID = "bitcoin";
const VS_CURRENCY = "usd";

const getCoinGeckoTicker = async () => {
  const payload = await withTimeout(
    `${COINGECKO_BASE_URL}/coins/${COIN_ID}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
  );

  const md = payload?.market_data;
  if (!md || typeof md.current_price?.[VS_CURRENCY] === "undefined") {
    throw new Error("Failed to load CoinGecko ticker for bitcoin.");
  }

  const last = Number(md.current_price[VS_CURRENCY]);
  const priceChange24 = typeof md.price_change_24h === "object" ? md.price_change_24h[VS_CURRENCY] : md.price_change_24h;
  const open = typeof priceChange24 === "number" ? last - priceChange24 : md.current_price[VS_CURRENCY];

  return {
    symbol: "BTCUSDT",
    lastPrice: String(Number(last).toFixed(2)),
    openPrice: String(Number(open).toFixed(2)),
    highPrice: String(Number(md.high_24h?.[VS_CURRENCY] ?? last).toFixed(2)),
    lowPrice: String(Number(md.low_24h?.[VS_CURRENCY] ?? last).toFixed(2)),
    volume: String(md.total_volume?.[VS_CURRENCY] ?? 0),
    quoteVolume: String(md.total_volume?.[VS_CURRENCY] ?? 0),
    priceChangePercent: String(md.price_change_percentage_24h ?? 0),
    closeTime: Date.now()
  };
};

const parseIntervalToHours = (interval) => {
  if (typeof interval !== 'string') return 1;
  if (interval.endsWith('h')) return Number(interval.slice(0, -1)) || 1;
  if (interval.endsWith('d')) return (Number(interval.slice(0, -1)) || 1) * 24;
  return 1;
};

const getCoinGeckoKlines = async ({ symbol, interval = "1h", limit = 24 }) => {
  // We approximate candles from CoinGecko's market_chart prices
  const hoursPerInterval = parseIntervalToHours(interval);
  const days = Math.max(1, Math.ceil((limit * hoursPerInterval) / 24));

  const payload = await withTimeout(`${COINGECKO_BASE_URL}/coins/${COIN_ID}/market_chart?vs_currency=${VS_CURRENCY}&days=${days}`);

  const prices = Array.isArray(payload?.prices) ? payload.prices : [];
  const volumes = Array.isArray(payload?.total_volumes) ? payload.total_volumes : [];

  const lastTimestamp = prices.length ? prices[prices.length - 1][0] : Date.now();
  const intervalMs = hoursPerInterval * 60 * 60 * 1000;
  const earliestBucketStart = lastTimestamp - limit * intervalMs;

  const klines = [];
  let pIdx = 0;

  for (let i = 0; i < limit; i++) {
    const bucketStart = earliestBucketStart + i * intervalMs;
    const bucketEnd = bucketStart + intervalMs;

    const bucketPrices = [];
    let bucketVolume = 0;

    while (pIdx < prices.length && prices[pIdx][0] <= bucketEnd) {
      const [ts, price] = prices[pIdx];
      if (ts > bucketStart && ts <= bucketEnd) {
        bucketPrices.push(price);
      }
      pIdx++;
    }

    if (bucketPrices.length === 0) {
      // fallback: use last known price before bucketEnd or the first available
      const fallbackIdx = Math.max(0, Math.min(prices.length - 1, pIdx - 1));
      const fallbackPrice = prices[fallbackIdx]?.[1] ?? 0;
      klines.push({
        openTime: bucketStart,
        closeTime: bucketEnd,
        openPrice: String(fallbackPrice),
        highPrice: String(fallbackPrice),
        lowPrice: String(fallbackPrice),
        closePrice: String(fallbackPrice),
        volume: String(0),
        label: formatLabel(bucketStart, interval)
      });
      continue;
    }

    const openPrice = bucketPrices[0];
    const closePrice = bucketPrices[bucketPrices.length - 1];
    const highPrice = Math.max(...bucketPrices);
    const lowPrice = Math.min(...bucketPrices);

    // approximate volume from volumes array by finding an entry within the bucket
    const volEntry = volumes.find((v) => v[0] > bucketStart && v[0] <= bucketEnd);
    bucketVolume = volEntry ? volEntry[1] : 0;

    klines.push({
      openTime: bucketStart,
      closeTime: bucketEnd,
      openPrice: String(openPrice),
      highPrice: String(highPrice),
      lowPrice: String(lowPrice),
      closePrice: String(closePrice),
      volume: String(bucketVolume),
      label: formatLabel(bucketStart, interval)
    });
  }

  return klines;
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
      source: "CoinGecko"
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
      source: "CoinGecko x CBU"
    }
  ];
};

const getMarketSnapshot = async () => {
  const [fxRate, btcTicker] = await Promise.all([
    getUsdToUzsRate(),
    getCoinGeckoTicker()
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
        provider: "CoinGecko",
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
    const klines = await getCoinGeckoKlines({ symbol: "BTCUSDT", interval, limit });
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
  const btcHistory = await getCoinGeckoKlines({ symbol: "BTCUSDT", interval: "1d", limit: points });
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

