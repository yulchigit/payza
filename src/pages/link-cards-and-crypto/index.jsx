import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleBasedNavigation from "../../components/ui/RoleBasedNavigation";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import PaymentMethodCard from "./components/PaymentMethodCard";
import ConnectionModal from "./components/ConnectionModal";
import SecurityScoreCard from "./components/SecurityScoreCard";
import SuccessNotification from "./components/SuccessNotification";
import apiClient from "lib/apiClient";

const METHOD_META = {
  Uzcard: {
    icon: "CreditCard",
    iconBg: "bg-primary/10",
    iconColor: "var(--color-primary)",
    description: "National payment system of Uzbekistan for secure local transactions"
  },
  Humo: {
    icon: "CreditCard",
    iconBg: "bg-accent/10",
    iconColor: "var(--color-accent)",
    description: "Alternative national payment card system with wide acceptance across Uzbekistan"
  },
  Visa: {
    icon: "CreditCard",
    iconBg: "bg-warning/10",
    iconColor: "var(--color-warning)",
    description: "International payment network for global transactions and online purchases"
  },
  "USDT Wallet": {
    icon: "Wallet",
    iconBg: "bg-success/10",
    iconColor: "var(--color-success)",
    description: "Stablecoin pegged to USD for stable value cryptocurrency transactions"
  },
  "Bitcoin Wallet": {
    icon: "Bitcoin",
    iconBg: "bg-warning/10",
    iconColor: "var(--color-warning)",
    description: "Original cryptocurrency for decentralized peer-to-peer digital payments"
  }
};

const defaultMetaFor = (method) => ({
  icon: method?.category === "crypto" ? "Wallet" : "CreditCard",
  iconBg: "bg-primary/10",
  iconColor: "var(--color-primary)",
  description: "Secure payment method"
});

const mapMethod = (method) => {
  const meta = METHOD_META[method?.name] || defaultMetaFor(method);
  const details = [];

  if (method?.status === "connected" && method?.category === "traditional" && method?.last_four) {
    details.push({ label: "Card Number", value: `**** **** **** ${method.last_four}` });
    if (method?.metadata?.expiryDate) {
      details.push({ label: "Expiry", value: method.metadata.expiryDate });
    }
  }

  if (method?.status === "connected" && method?.category === "crypto" && method?.wallet_address) {
    const raw = method.wallet_address;
    const shortAddress = raw.length > 12 ? `${raw.slice(0, 6)}...${raw.slice(-6)}` : raw;
    details.push({ label: "Address", value: shortAddress });
  }

  return {
    ...method,
    ...meta,
    details: details.length > 0 ? details : null
  };
};

const LinkCardsAndCrypto = () => {
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [notification, setNotification] = useState({ isVisible: false, message: "", type: "success" });
  const [modalState, setModalState] = useState({ isOpen: false, method: null, actionType: "connect" });

  useEffect(() => {
    let isMounted = true;

    const loadMethods = async () => {
      setLoadingMethods(true);
      try {
        const response = await apiClient.get("/payment-methods");
        const methods = (response?.data?.data || []).map(mapMethod);
        if (isMounted) {
          setPaymentMethods(methods);
        }
      } catch (error) {
        if (isMounted) {
          setNotification({
            isVisible: true,
            message: error?.response?.data?.error || "Failed to load payment methods",
            type: "error"
          });
        }
      } finally {
        if (isMounted) {
          setLoadingMethods(false);
        }
      }
    };

    loadMethods();
    return () => {
      isMounted = false;
    };
  }, []);

  const connectedCount = paymentMethods?.filter((m) => m?.status === "connected")?.length;
  const totalCount = paymentMethods?.length;
  const securityScore = totalCount > 0 ? Math.round((connectedCount / totalCount) * 100) : 0;

  const handleConnect = (method, actionType) => {
    setModalState({ isOpen: true, method, actionType });
  };

  const handleManage = (method) => {
    setNotification({
      isVisible: true,
      message: `Management options for ${method?.name} will be expanded in the next phase.`,
      type: "success"
    });
  };

  const handleModalSubmit = async (method, formData) => {
    const payload = {
      actionType: modalState?.actionType,
      cardNumber: formData?.cardNumber,
      expiryDate: formData?.expiryDate,
      walletAddress: formData?.walletAddress
    };

    const response = await apiClient.patch(`/payment-methods/${method?.id}/status`, payload);
    const updated = mapMethod(response?.data?.data);

    setPaymentMethods((prev) => prev.map((item) => (item?.id === updated?.id ? updated : item)));
    setNotification({
      isVisible: true,
      message:
        modalState?.actionType === "disconnect"
          ? `${method?.name} has been disconnected successfully`
          : `${method?.name} has been connected successfully`,
      type: "success"
    });
    setModalState({ isOpen: false, method: null, actionType: "connect" });
  };

  const traditionalMethods = useMemo(
    () => paymentMethods?.filter((m) => m?.category === "traditional"),
    [paymentMethods]
  );
  const cryptoMethods = useMemo(() => paymentMethods?.filter((m) => m?.category === "crypto"), [paymentMethods]);

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="user" />
      <main className="pt-24 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/user-wallet-dashboard")}
              iconName="ArrowLeft"
              iconPosition="left"
              className="mb-4"
            >
              Back to Dashboard
            </Button>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Link Payment Methods
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Connect your traditional cards and cryptocurrency wallets to enable seamless payments across all
              platforms
            </p>
          </div>

          {loadingMethods && (
            <div className="bg-card border border-border rounded-xl p-4 mb-6 text-sm text-muted-foreground">
              Loading payment methods...
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name="CreditCard" size={24} color="var(--color-primary)" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">Traditional Payment Cards</h2>
              </div>
              <div className="space-y-4">
                {traditionalMethods?.map((method) => (
                  <PaymentMethodCard key={method?.id} method={method} onConnect={handleConnect} onManage={handleManage} />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Icon name="Wallet" size={24} color="var(--color-accent)" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">Cryptocurrency Wallets</h2>
              </div>
              <div className="space-y-4">
                {cryptoMethods?.map((method) => (
                  <PaymentMethodCard key={method?.id} method={method} onConnect={handleConnect} onManage={handleManage} />
                ))}
              </div>
            </div>
          </div>

          <SecurityScoreCard connectedCount={connectedCount} totalCount={totalCount} securityScore={securityScore} />
        </div>
      </main>
      <ConnectionModal
        isOpen={modalState?.isOpen}
        onClose={() => setModalState({ isOpen: false, method: null, actionType: "connect" })}
        method={modalState?.method}
        onSubmit={handleModalSubmit}
        actionType={modalState?.actionType}
      />
      <SuccessNotification
        isVisible={notification?.isVisible}
        onClose={() => setNotification({ ...notification, isVisible: false })}
        message={notification?.message}
        type={notification?.type}
      />
    </div>
  );
};

export default LinkCardsAndCrypto;
