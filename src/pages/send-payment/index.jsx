import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import RoleBasedNavigation from "../../components/ui/RoleBasedNavigation";
import PaymentFlowBreadcrumb from "../../components/ui/PaymentFlowBreadcrumb";
import RecipientSelector from "./components/RecipientSelector";
import AmountInput from "./components/AmountInput";
import PaymentSourceSelector from "./components/PaymentSourceSelector";
import TransactionSummary from "./components/TransactionSummary";
import SecurityVerification from "./components/SecurityVerification";
import apiClient from "lib/apiClient";

const CURRENCY_META = {
  UZS: {
    type: "card",
    name: "UZS Wallet",
    number: "Domestic account",
    processingTime: "Instant",
    fee: "0.5%"
  },
  USD: {
    type: "card",
    name: "USD Wallet",
    number: "International account",
    processingTime: "Instant",
    fee: "0.5%"
  },
  USDT: {
    type: "crypto",
    name: "USDT Wallet",
    address: "TRC-20 wallet",
    processingTime: "5-10 minutes",
    fee: "1.0%"
  },
  BTC: {
    type: "crypto",
    name: "Bitcoin Wallet",
    address: "Native SegWit wallet",
    processingTime: "10-30 minutes",
    fee: "1.0%"
  }
};

const WALLET_ICON = "https://img.rocket.new/generatedImages/rocket_gen_img_1b4fd9e83-1765179231133.png";

const SendPayment = () => {
  const navigate = useNavigate();
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [favoriteRecipients, setFavoriteRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("UZS");
  const [selectedSource, setSelectedSource] = useState(null);
  const [paymentSources, setPaymentSources] = useState([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setLoadingSources(true);
      setLoadingRecipients(true);
      try {
        const [walletResponse, recipientResponse] = await Promise.all([
          apiClient.get("/wallet/overview", { params: { limit: 1 } }),
          apiClient.get("/recipients/favorites", { params: { limit: 20 } })
        ]);

        const overview = walletResponse?.data?.data;
        const balances = [...(overview?.traditionalBalances || []), ...(overview?.cryptoBalances || [])];
        const mapped = balances.map((item) => {
          const meta = CURRENCY_META[item.currency] || {
            type: "card",
            name: `${item.currency} Wallet`,
            number: "Wallet account",
            processingTime: "Instant",
            fee: "0.5%"
          };
          return {
            id: `wallet-${item.currency}`,
            currency: item.currency,
            balance: Number(item.amount || 0),
            status: "active",
            icon: WALLET_ICON,
            iconAlt: `${item.currency} wallet`,
            ...meta
          };
        });
        const recipientRows = recipientResponse?.data?.data || [];
        const mappedRecipients = recipientRows.map((row) => ({
          id: row?.id,
          name: row?.recipientName || row?.recipientIdentifier || "Recipient",
          phone: row?.recipientIdentifier || "",
          lastTransaction: row?.lastUsedAt || row?.createdAt || null
        }));

        if (isMounted) {
          setPaymentSources(mapped);
          setFavoriteRecipients(mappedRecipients);
        }
      } catch (error) {
        if (isMounted) {
          setErrors((prev) => ({
            ...prev,
            source: error?.response?.data?.error || "Failed to load payment sources"
          }));
        }
      } finally {
        if (isMounted) {
          setLoadingSources(false);
          setLoadingRecipients(false);
        }
      }
    };

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedRecipient) {
      newErrors.recipient = "Please select or enter a recipient";
    } else {
      const recipientIdentifier = selectedRecipient?.phone || selectedRecipient?.name || "";
      if (!recipientIdentifier.trim()) {
        newErrors.recipient = "Recipient name or phone is required";
      }
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!selectedSource) {
      newErrors.source = "Please select a payment source";
    }

    if (selectedSource && amount) {
      const sourceBalance = Number(selectedSource?.balance || 0);
      const requiredAmount = Number.parseFloat(amount);
      if (requiredAmount > sourceBalance) {
        newErrors.amount = "Insufficient balance in selected payment source";
      }
      if (currency !== selectedSource.currency) {
        newErrors.amount = `Currency must match selected source (${selectedSource.currency})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      setShowVerification(true);
    }
  };

  const createIdempotencyKey = () => `payza-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const handleVerificationSuccess = async () => {
    const recipientIdentifier = selectedRecipient?.phone || selectedRecipient?.name || "";
    setSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: "" }));

    try {
      const response = await apiClient.post(
        "/transactions",
        {
          recipientIdentifier: recipientIdentifier.trim(),
          sourceCurrency: selectedSource.currency,
          amount: Number.parseFloat(amount)
        },
        {
          headers: {
            "Idempotency-Key": createIdempotencyKey()
          }
        }
      );

      const transaction = response?.data?.data;
      setShowVerification(false);
      navigate("/payment-confirmation", {
        state: {
          transaction,
          recipient: selectedRecipient,
          paymentSource: selectedSource
        }
      });
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error?.response?.data?.error || "Failed to create transaction"
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveRecipient = async () => {
    const recipientIdentifier = (selectedRecipient?.phone || selectedRecipient?.name || "").trim();
    const recipientName = (selectedRecipient?.name || "").trim();

    if (!recipientIdentifier) {
      setErrors((prev) => ({ ...prev, submit: "Recipient is required to save favorite." }));
      return;
    }

    try {
      const response = await apiClient.post("/recipients/favorites", {
        recipientIdentifier,
        recipientName: recipientName || recipientIdentifier
      });
      const saved = response?.data?.data;
      const nextRecipient = {
        id: saved?.id,
        name: saved?.recipientName || saved?.recipientIdentifier || recipientIdentifier,
        phone: saved?.recipientIdentifier || recipientIdentifier,
        lastTransaction: saved?.lastUsedAt || saved?.createdAt || null
      };

      setFavoriteRecipients((prev) => {
        const withoutSame = prev.filter((item) => item.phone !== nextRecipient.phone);
        return [nextRecipient, ...withoutSame].slice(0, 20);
      });
      setErrors((prev) => ({ ...prev, submit: "" }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error?.response?.data?.error || "Failed to save favorite recipient"
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="user" />
      <main className="pt-24 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <PaymentFlowBreadcrumb currentStep="send" />

          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">Send Payment</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Transfer money securely across cards and crypto wallets
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="Send" size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Payment Details</h2>
                    <p className="text-xs text-muted-foreground">Enter recipient and amount information</p>
                  </div>
                </div>

                <RecipientSelector
                  selectedRecipient={selectedRecipient}
                  onRecipientSelect={setSelectedRecipient}
                  error={errors?.recipient}
                  recipients={favoriteRecipients}
                  isLoadingRecipients={loadingRecipients}
                />

                {selectedRecipient && (
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Star"
                    iconPosition="left"
                    onClick={handleSaveRecipient}
                  >
                    Save as Favorite
                  </Button>
                )}

                <AmountInput
                  amount={amount}
                  currency={currency}
                  onAmountChange={setAmount}
                  onCurrencyChange={setCurrency}
                  error={errors?.amount}
                />

                <PaymentSourceSelector
                  selectedSource={selectedSource}
                  onSourceSelect={(source) => {
                    setSelectedSource(source);
                    setCurrency(source.currency);
                  }}
                  error={errors?.source}
                  paymentSources={paymentSources}
                />

                {loadingSources && (
                  <p className="text-sm text-muted-foreground">Loading available wallets...</p>
                )}

                {errors?.submit && (
                  <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    {errors.submit}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="ArrowLeft"
                    iconPosition="left"
                    onClick={() => navigate("/user-wallet-dashboard")}
                  >
                    Back to Dashboard
                  </Button>
                  <Button
                    variant="default"
                    fullWidth
                    iconName="ArrowRight"
                    iconPosition="right"
                    onClick={handleContinue}
                    disabled={!selectedRecipient || !amount || !selectedSource || submitting}
                    loading={submitting}
                  >
                    Continue to Confirmation
                  </Button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                <div className="flex items-start gap-3">
                  <Icon name="Shield" size={24} className="text-accent flex-shrink-0" />
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-2">Secure Transaction Guarantee</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Icon name="Check" size={16} className="text-accent flex-shrink-0 mt-0.5" />
                        <span>Bank-level encryption protects your payment data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Check" size={16} className="text-accent flex-shrink-0 mt-0.5" />
                        <span>Server-side validation is enabled for every transaction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Check" size={16} className="text-accent flex-shrink-0 mt-0.5" />
                        <span>Rate-limited API protects against brute-force abuse</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <TransactionSummary
                  recipient={selectedRecipient}
                  amount={amount}
                  currency={currency}
                  paymentSource={selectedSource}
                />

                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="HelpCircle" size={20} className="text-primary" />
                    <h3 className="text-base font-semibold text-foreground">Need Help?</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our support team is available 24/7 to assist with your transactions.
                  </p>
                  <Button variant="outline" fullWidth iconName="MessageCircle" iconPosition="left">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SecurityVerification
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        onVerify={handleVerificationSuccess}
      />
    </div>
  );
};

export default SendPayment;
