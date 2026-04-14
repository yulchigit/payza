import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleBasedNavigation from "../../components/ui/RoleBasedNavigation";
import ConversionCalculator from "./components/ConversionCalculator";
import ExchangeRateCard from "./components/ExchangeRateCard";
import FeeBreakdown from "./components/FeeBreakdown";
import ConversionSettings from "./components/ConversionSettings";
import TransactionSummary from "./components/TransactionSummary";
import MarketDataWidget from "./components/MarketDataWidget";
import ConversionSuccessModal from "./components/ConversionSuccessModal";
import apiClient from "lib/apiClient";

const DEFAULT_WALLET_BALANCES = {
  UZS: 0,
  USDT: 0,
  BTC: 0
};

const createIdempotencyKey = () => `swap-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const formatReceivedAmount = (value, currency) => {
  const amount = Number(value || 0);
  if (currency === 'BTC') {
    return amount.toFixed(8);
  }
  if (currency === 'UZS') {
    return amount.toFixed(2);
  }
  return amount.toFixed(4);
};

const CryptoToCardConversion = () => {
  const navigate = useNavigate();
  const [fromCurrency, setFromCurrency] = useState("UZS");
  const [toCurrency, setToCurrency] = useState("USDT");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("0.00");
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);
  const [walletBalances, setWalletBalances] = useState(DEFAULT_WALLET_BALANCES);
  const [marketOverview, setMarketOverview] = useState(null);
  const [history, setHistory] = useState([]);
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formError, setFormError] = useState("");

  const loadWalletOverview = async ({ silent = false } = {}) => {
    if (!silent) {
      setPageLoading(true);
    }

    try {
      const walletResponse = await apiClient.get("/wallet/overview", { params: { limit: 5 } });
      const overview = walletResponse?.data?.data || {};
      const balances = {
        UZS: 0,
        USDT: 0,
        BTC: 0
      };

      [...(overview?.traditionalBalances || []), ...(overview?.cryptoBalances || [])].forEach((item) => {
        balances[item.currency] = Number(item.amount || 0);
      });

      setWalletBalances(balances);
      setMarketOverview(overview?.market || null);
    } catch (error) {
      setFormError(error?.response?.data?.error || "Failed to load exchange data");
    } finally {
      if (!silent) {
        setPageLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await loadWalletOverview();
      } finally {
        if (!isMounted) {
          return;
        }
      }
    };

    bootstrap();
    const intervalId = setInterval(() => {
      loadWalletOverview({ silent: true });
    }, 20000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        const response = await apiClient.get("/market/history", {
          params: {
            baseCurrency: toCurrency,
            quoteCurrency: fromCurrency,
            interval: "1h",
            limit: 24
          }
        });

        if (!cancelled) {
          setHistory(response?.data?.data || []);
        }
      } catch (error) {
        if (!cancelled) {
          setHistory([]);
        }
      }
    };

    loadHistory();
    const intervalId = setInterval(loadHistory, 20000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    let cancelled = false;

    if (!fromAmount || Number(fromAmount) <= 0 || fromCurrency === toCurrency) {
      setQuote(null);
      setToAmount("0.00");
      return () => {};
    }

    const sourceBalance = Number(walletBalances?.[fromCurrency] || 0);
    if (Number(fromAmount) > sourceBalance) {
      setFormError(`Insufficient ${fromCurrency} balance for this swap.`);
      setQuote(null);
      setToAmount("0.00");
      return () => {};
    }

    const loadQuote = async () => {
      setQuoteLoading(true);
      setFormError("");

      try {
        const response = await apiClient.post("/market/quote", {
          fromCurrency,
          toCurrency,
          amount: fromAmount
        });

        const nextQuote = response?.data?.data || null;
        if (!cancelled) {
          setQuote(nextQuote);
          setToAmount(formatReceivedAmount(nextQuote?.netOutput, toCurrency));
        }
      } catch (error) {
        if (!cancelled) {
          setQuote(null);
          setToAmount("0.00");
          setFormError(error?.response?.data?.error || "Failed to refresh quote");
        }
      } finally {
        if (!cancelled) {
          setQuoteLoading(false);
        }
      }
    };

    loadQuote();
    const intervalId = setInterval(loadQuote, 15000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [fromAmount, fromCurrency, toCurrency, walletBalances]);

  const handleSwapDirection = () => {
    const nextSourceAmount = quote?.netOutput ? formatReceivedAmount(quote.netOutput, toCurrency) : "";
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(nextSourceAmount);
    setQuote(null);
    setToAmount("0.00");
  };

  const handleConfirmConversion = async () => {
    setFormError("");

    if (!fromAmount || Number(fromAmount) <= 0) {
      setFormError("Enter a valid amount first.");
      return;
    }

    if (Number(fromAmount) > Number(walletBalances?.[fromCurrency] || 0)) {
      setFormError(`Insufficient ${fromCurrency} balance for this swap.`);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiClient.post(
        "/market/swap",
        {
          fromCurrency,
          toCurrency,
          amount: fromAmount,
          maxSlippageBps: Math.round(Number(slippageTolerance || 0) * 100)
        },
        {
          headers: {
            "Idempotency-Key": createIdempotencyKey()
          }
        }
      );

      const result = response?.data?.data;
      setSuccessDetails({
        transactionId: result?.transaction?.id,
        fromCurrency,
        toCurrency,
        fromAmount,
        toAmount: result?.quote?.netOutput,
        effectiveRate: result?.quote?.effectiveRate
      });
      setShowSuccessModal(true);
      setFromAmount("");
      setQuote(null);
      setToAmount("0.00");
      await loadWalletOverview({ silent: true });
    } catch (error) {
      setFormError(error?.response?.data?.error || "Swap failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/user-wallet-dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="user" />

      <main className="pt-24 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Live Demo Exchange</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Convert UZS, USDT, and BTC using live Binance market data and official CBU FX references
            </p>
          </div>

          {pageLoading && (
            <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground mb-6">
              Loading market references and wallet balances...
            </div>
          )}

          {formError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive mb-6">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 space-y-6">
              <ConversionCalculator
                fromCurrency={fromCurrency}
                setFromCurrency={setFromCurrency}
                fromAmount={fromAmount}
                setFromAmount={setFromAmount}
                toCurrency={toCurrency}
                setToCurrency={setToCurrency}
                toAmount={toAmount}
                walletBalances={walletBalances}
                conversionRate={quote?.effectiveRate}
                onSwapDirection={handleSwapDirection}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExchangeRateCard
                  fromCurrency={fromCurrency}
                  toCurrency={toCurrency}
                  quote={quote}
                  history={history}
                />

                <FeeBreakdown quote={quote} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ConversionSettings
                  slippageTolerance={slippageTolerance}
                  setSlippageTolerance={setSlippageTolerance}
                  minAmount={fromCurrency === 'BTC' ? '0.0001' : fromCurrency === 'USDT' ? '5' : '50000'}
                  maxAmount={fromCurrency === 'BTC' ? '5' : fromCurrency === 'USDT' ? '100000' : '500000000'}
                  cryptoType={fromCurrency}
                  fiatCurrency={toCurrency}
                />

                <MarketDataWidget
                  baseCurrency={toCurrency}
                  quoteCurrency={fromCurrency}
                  history={history}
                  featuredMarkets={marketOverview?.featuredMarkets || []}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <TransactionSummary
                fromCurrency={fromCurrency}
                toCurrency={toCurrency}
                fromAmount={fromAmount}
                walletBalances={walletBalances}
                quote={quote}
                onConfirm={handleConfirmConversion}
                isProcessing={isProcessing}
                quoteLoading={quoteLoading}
              />
            </div>
          </div>
        </div>
      </main>

      <ConversionSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        conversionDetails={successDetails}
      />
    </div>
  );
};

export default CryptoToCardConversion;
