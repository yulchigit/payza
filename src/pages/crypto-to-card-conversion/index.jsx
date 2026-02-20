import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleBasedNavigation from "../../components/ui/RoleBasedNavigation";
import ConversionCalculator from "./components/ConversionCalculator";
import ExchangeRateCard from "./components/ExchangeRateCard";
import FeeBreakdown from "./components/FeeBreakdown";
import DestinationCardSelector from "./components/DestinationCardSelector";
import ConversionSettings from "./components/ConversionSettings";
import TransactionSummary from "./components/TransactionSummary";
import MarketDataWidget from "./components/MarketDataWidget";
import ConversionSuccessModal from "./components/ConversionSuccessModal";
import apiClient from "lib/apiClient";

const CARD_IMAGE = "https://img.rocket.new/generatedImages/rocket_gen_img_118081b5e-1767009652734.png";

const DEFAULT_EXCHANGE_RATES = {
  USDT: {
    USD: 1,
    UZS: 12650
  },
  BTC: {
    USD: 45000,
    UZS: 569250000
  }
};

const CryptoToCardConversion = () => {
  const navigate = useNavigate();
  const [cryptoType, setCryptoType] = useState("USDT");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [fiatCurrency, setFiatCurrency] = useState("USD");
  const [fiatAmount, setFiatAmount] = useState("0.00");
  const [selectedCard, setSelectedCard] = useState(null);
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [linkedCards, setLinkedCards] = useState([]);
  const [cryptoBalances, setCryptoBalances] = useState({
    USDT: "0.00",
    BTC: "0.00"
  });
  const [formError, setFormError] = useState("");

  const exchangeRates = DEFAULT_EXCHANGE_RATES;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [walletResponse, methodsResponse] = await Promise.all([
          apiClient.get("/wallet/overview", { params: { limit: 1 } }),
          apiClient.get("/payment-methods")
        ]);

        const overview = walletResponse?.data?.data || {};
        const methodRows = methodsResponse?.data?.data || [];

        const walletMap = {};
        (overview?.cryptoBalances || []).forEach((item) => {
          walletMap[item.currency] = Number(item.amount || 0);
        });

        const cards = methodRows
          .filter((method) => method?.category === "traditional" && method?.status === "connected")
          .map((method, index) => ({
            id: method.id,
            type: method.name,
            lastFour: method.last_four || "0000",
            logo: CARD_IMAGE,
            logoAlt: `${method.name} card`,
            processingTime: "1-2 hours",
            dailyLimit: "$5,000",
            isDefault: index === 0
          }));

        if (isMounted) {
          setLinkedCards(cards);
          setCryptoBalances({
            USDT: (walletMap.USDT || 0).toFixed(2),
            BTC: (walletMap.BTC || 0).toFixed(8)
          });
          if (cards.length > 0) {
            setSelectedCard(cards[0].id);
          }
        }
      } catch (error) {
        if (isMounted) {
          setFormError(error?.response?.data?.error || "Failed to load conversion data");
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (cryptoAmount && !Number.isNaN(Number.parseFloat(cryptoAmount))) {
      const amount = Number.parseFloat(cryptoAmount);
      const rate = exchangeRates?.[cryptoType]?.[fiatCurrency];
      const converted = amount * rate;
      setFiatAmount(converted?.toFixed(2));
    } else {
      setFiatAmount("0.00");
    }
  }, [cryptoAmount, cryptoType, fiatCurrency, exchangeRates]);

  const handleSwap = () => {};

  const handleConfirmConversion = async () => {
    setFormError("");
    if (!selectedCard) {
      setFormError("Connect a destination card first.");
      return;
    }

    setIsProcessing(true);
    try {
      const card = linkedCards.find((item) => item?.id === selectedCard);
      const response = await apiClient.post(
        "/transactions",
        {
          recipientIdentifier: `${card?.type} ****${card?.lastFour}`,
          sourceCurrency: cryptoType,
          amount: Number.parseFloat(cryptoAmount)
        },
        {
          headers: {
            "Idempotency-Key": `convert-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
          }
        }
      );

      setTransactionId(response?.data?.data?.id || "");
      setShowSuccessModal(true);
    } catch (error) {
      setFormError(error?.response?.data?.error || "Conversion failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/user-wallet-dashboard");
  };

  const selectedCardDetails = linkedCards?.find((card) => card?.id === selectedCard);

  const conversionDetails = useMemo(
    () => ({
      transactionId,
      cryptoAmount,
      cryptoType,
      fiatAmount: Number.parseFloat(fiatAmount),
      fiatCurrency,
      cardLastFour: selectedCardDetails?.lastFour || "",
      processingTime: selectedCardDetails?.processingTime || ""
    }),
    [cryptoAmount, cryptoType, fiatAmount, fiatCurrency, selectedCardDetails, transactionId]
  );

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="user" />

      <main className="pt-24 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Crypto to Card Conversion</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Convert your cryptocurrency to traditional currency and transfer to your linked cards
            </p>
          </div>

          {formError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive mb-6">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 space-y-6">
              <ConversionCalculator
                cryptoType={cryptoType}
                setCryptoType={setCryptoType}
                cryptoAmount={cryptoAmount}
                setCryptoAmount={setCryptoAmount}
                fiatCurrency={fiatCurrency}
                setFiatCurrency={setFiatCurrency}
                fiatAmount={fiatAmount}
                cryptoBalances={cryptoBalances}
                exchangeRates={exchangeRates}
                onSwap={handleSwap}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExchangeRateCard cryptoType={cryptoType} fiatCurrency={fiatCurrency} exchangeRates={exchangeRates} />

                <FeeBreakdown
                  cryptoType={cryptoType}
                  cryptoAmount={cryptoAmount}
                  fiatCurrency={fiatCurrency}
                  fiatAmount={fiatAmount}
                />
              </div>

              <DestinationCardSelector
                selectedCard={selectedCard}
                setSelectedCard={setSelectedCard}
                linkedCards={linkedCards}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ConversionSettings
                  slippageTolerance={slippageTolerance}
                  setSlippageTolerance={setSlippageTolerance}
                  minAmount={cryptoType === "BTC" ? "0.001" : "10"}
                  maxAmount={cryptoType === "BTC" ? "10" : "50000"}
                  cryptoType={cryptoType}
                  fiatCurrency={fiatCurrency}
                />

                <MarketDataWidget cryptoType={cryptoType} fiatCurrency={fiatCurrency} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <TransactionSummary
                cryptoType={cryptoType}
                cryptoAmount={cryptoAmount}
                fiatCurrency={fiatCurrency}
                fiatAmount={fiatAmount}
                selectedCard={selectedCard}
                linkedCards={linkedCards}
                onConfirm={handleConfirmConversion}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </div>
      </main>

      <ConversionSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        conversionDetails={conversionDetails}
      />
    </div>
  );
};

export default CryptoToCardConversion;
