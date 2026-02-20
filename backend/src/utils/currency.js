const FIAT_CURRENCIES = new Set(["USD", "UZS", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF"]);
const CRYPTO_CURRENCIES = new Set(["USDT", "BTC", "ETH"]);

const USD_RATES = {
  USD: 1,
  UZS: 1 / 12650,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0067,
  AUD: 0.64,
  CAD: 0.74,
  CHF: 1.1,
  USDT: 1,
  BTC: 45000,
  ETH: 2800
};

const normalizeCurrency = (value) => String(value || "").trim().toUpperCase();

const isFiatCurrency = (currency) => FIAT_CURRENCIES.has(normalizeCurrency(currency));
const isCryptoCurrency = (currency) => CRYPTO_CURRENCIES.has(normalizeCurrency(currency));

const toUsd = (amount, currency) => {
  const normalized = normalizeCurrency(currency);
  const rate = USD_RATES[normalized];
  if (!rate) return 0;
  return Number(amount) * rate;
};

module.exports = {
  normalizeCurrency,
  isFiatCurrency,
  isCryptoCurrency,
  toUsd
};
