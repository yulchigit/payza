import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import RoleBasedNavigation from "../../components/ui/RoleBasedNavigation";
import PaymentFlowBreadcrumb from "../../components/ui/PaymentFlowBreadcrumb";
import SuccessHeader from "./components/SuccessHeader";
import TransactionSummary from "./components/TransactionSummary";
import TransactionTimeline from "./components/TransactionTimeline";
import ActionButtons from "./components/ActionButtons";
import SuggestionsPanel from "./components/SuggestionsPanel";
import NotificationBanner from "./components/NotificationBanner";
import apiClient from "lib/apiClient";

const formatAmount = (amount, currency) => {
  if (!Number.isFinite(Number(amount))) return `0 ${currency}`;
  if (currency === "USD") return `$${Number(amount).toFixed(2)}`;
  if (currency === "BTC") return `${Number(amount).toFixed(8)} BTC`;
  return `${Number(amount).toFixed(2)} ${currency}`;
};

const formatDateTime = (value) => {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

const PaymentConfirmation = () => {
  const location = useLocation();
  const [transactionState, setTransactionState] = useState(location?.state?.transaction || null);
  const [error, setError] = useState("");

  const recipientState = location?.state?.recipient || null;
  const paymentSourceState = location?.state?.paymentSource || null;

  useEffect(() => {
    let isMounted = true;

    const transactionId = location?.state?.transaction?.id || location?.state?.transactionId;
    if (!transactionId || transactionState) return undefined;

    const loadTransaction = async () => {
      try {
        const response = await apiClient.get(`/transactions/${transactionId}`);
        if (isMounted) {
          setTransactionState(response?.data?.data || null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError?.response?.data?.error || "Failed to load transaction details");
        }
      }
    };

    loadTransaction();
    return () => {
      isMounted = false;
    };
  }, [location?.state, transactionState]);

  const transactionData = useMemo(() => {
    if (!transactionState) return null;

    const sourceCurrency = transactionState?.sourceCurrency || paymentSourceState?.currency || "USD";
    const recipientName =
      recipientState?.name ||
      recipientState?.phone ||
      transactionState?.recipientIdentifier ||
      "Recipient";

    return {
      id: transactionState?.id,
      recipient: {
        name: recipientName,
        email: recipientState?.phone || "Not provided",
        avatar:
          recipientState?.avatar ||
          "https://img.rocket.new/generatedImages/rocket_gen_img_1fb6cf439-1763299224286.png",
        avatarAlt: "Recipient profile image"
      },
      amount: formatAmount(transactionState?.amount, sourceCurrency),
      paymentMethod: {
        name: paymentSourceState?.name || `${sourceCurrency} Wallet`,
        icon: "CreditCard"
      },
      fee: formatAmount(transactionState?.feeAmount, sourceCurrency),
      processingTime: transactionState?.status === "success" ? "Completed" : "Processing",
      expectedArrival: transactionState?.status === "success" ? "Available now" : "In progress",
      timestamp: formatDateTime(transactionState?.createdAt)
    };
  }, [paymentSourceState, recipientState, transactionState]);

  const timelineSteps = useMemo(() => {
    if (!transactionState) return [];

    const createdAt = transactionState?.createdAt || new Date().toISOString();
    const createdAtLabel = formatDateTime(createdAt);
    const isSuccess = transactionState?.status === "success";

    return [
      {
        id: 1,
        title: "Payment Submitted",
        description: "Your payment request has been received and validated",
        timestamp: createdAtLabel,
        icon: "Send",
        completed: true,
        active: false
      },
      {
        id: 2,
        title: "Processing Payment",
        description: "Funds are being transferred through secure payment network",
        timestamp: createdAtLabel,
        icon: "Loader2",
        completed: isSuccess,
        active: !isSuccess
      },
      {
        id: 3,
        title: isSuccess ? "Payment Completed" : "Awaiting Completion",
        description: isSuccess
          ? "Transaction successful - recipient has been notified"
          : "Transaction is pending final confirmation",
        timestamp: createdAtLabel,
        icon: "CheckCircle2",
        completed: isSuccess,
        active: false
      }
    ];
  }, [transactionState]);

  const suggestions = [
    {
      id: 1,
      title: "Save Recipient",
      description: "Add this recipient to your frequent contacts for faster payments",
      icon: "UserPlus",
      iconBg: "bg-primary/10",
      iconColor: "var(--color-primary)",
      action: "save-recipient"
    },
    {
      id: 2,
      title: "Set Up Recurring",
      description: "Schedule automatic payments to this recipient",
      icon: "Calendar",
      iconBg: "bg-accent/10",
      iconColor: "var(--color-accent)",
      action: "setup-recurring"
    },
    {
      id: 3,
      title: "View History",
      description: "See all your past transactions and payment records",
      icon: "History",
      iconBg: "bg-warning/10",
      iconColor: "var(--color-warning)",
      action: "view-history"
    }
  ];

  const handleDownloadReceipt = () => {
    if (!transactionData) return;

    const receipt = {
      transactionId: transactionData.id,
      recipient: transactionData.recipient,
      amount: transactionData.amount,
      fee: transactionData.fee,
      status: transactionState?.status,
      timestamp: transactionData.timestamp
    };

    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payza-receipt-${transactionData.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSuggestionClick = () => {};

  return (
    <>
      <Helmet>
        <title>Payment Confirmation - PayZa</title>
        <meta name="description" content="Your payment has been processed successfully." />
      </Helmet>
      <RoleBasedNavigation userRole="user" />
      <div className="min-h-screen bg-background pt-20 md:pt-24 pb-12 md:pb-16 lg:pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <PaymentFlowBreadcrumb currentStep="confirm" />

          {transactionData ? (
            <>
              <SuccessHeader transactionId={transactionData?.id} />
              <NotificationBanner
                message="Transaction stored successfully. Recipient can track incoming funds from their activity feed."
                type="success"
              />
              <TransactionSummary transaction={transactionData} />
              <TransactionTimeline steps={timelineSteps} />
              <ActionButtons onDownloadReceipt={handleDownloadReceipt} />
              <SuggestionsPanel suggestions={suggestions} onSuggestionClick={handleSuggestionClick} />
            </>
          ) : (
            <NotificationBanner
              message={error || "Transaction details are not available yet. Please check your dashboard history."}
              type="warning"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentConfirmation;
