import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import PaymentFlowBreadcrumb from '../../components/ui/PaymentFlowBreadcrumb';
import SuccessHeader from './components/SuccessHeader';
import TransactionSummary from './components/TransactionSummary';
import TransactionTimeline from './components/TransactionTimeline';
import ActionButtons from './components/ActionButtons';
import SuggestionsPanel from './components/SuggestionsPanel';
import NotificationBanner from './components/NotificationBanner';

const PaymentConfirmation = () => {
  const [currentLanguage] = useState('en');

  const transactionData = {
    id: "TXN-2026-0106-7845",
    recipient: {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1fb6cf439-1763299224286.png",
      avatarAlt: "Professional woman with long brown hair wearing white blouse smiling at camera in bright office setting"
    },
    amount: "$250.00",
    paymentMethod: {
      name: "Visa •••• 4532",
      icon: "CreditCard"
    },
    fee: "$2.50",
    processingTime: "Instant",
    exchangeRate: "1 USD = 12,450 UZS",
    expectedArrival: "January 6, 2026 at 7:15 AM",
    timestamp: "January 6, 2026 at 7:04 AM"
  };

  const timelineSteps = [
  {
    id: 1,
    title: "Payment Submitted",
    description: "Your payment request has been received and validated",
    timestamp: "Jan 6, 2026 at 7:04 AM",
    icon: "Send",
    completed: true,
    active: false
  },
  {
    id: 2,
    title: "Processing Payment",
    description: "Funds are being transferred through secure payment network",
    timestamp: "Jan 6, 2026 at 7:05 AM",
    icon: "Loader2",
    completed: true,
    active: false
  },
  {
    id: 3,
    title: "Payment Completed",
    description: "Transaction successful - recipient has been notified",
    timestamp: "Jan 6, 2026 at 7:05 AM",
    icon: "CheckCircle2",
    completed: true,
    active: true
  },
  {
    id: 4,
    title: "Funds Available",
    description: "Recipient can access funds in their account",
    timestamp: "Estimated: Jan 6, 2026 at 7:15 AM",
    icon: "Wallet",
    completed: false,
    active: false
  }];


  const suggestions = [
  {
    id: 1,
    title: "Save Recipient",
    description: "Add Sarah to your frequent contacts for faster payments",
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
  },
  {
    id: 4,
    title: "Share Receipt",
    description: "Send payment confirmation to your email or contacts",
    icon: "Share2",
    iconBg: "bg-muted",
    iconColor: "var(--color-muted-foreground)",
    action: "share-receipt"
  }];


  const handleDownloadReceipt = () => {
    console.log('Downloading receipt for transaction:', transactionData?.id);
    alert('Receipt download started. Check your downloads folder.');
  };

  const handleSuggestionClick = (action) => {
    console.log('Suggestion clicked:', action);
    const messages = {
      'save-recipient': 'Recipient saved to your contacts successfully!',
      'setup-recurring': 'Recurring payment setup initiated.',
      'view-history': 'Navigating to transaction history...',
      'share-receipt': 'Receipt sharing options opened.'
    };
    alert(messages?.[action] || 'Action completed');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Payment Confirmation - FinPay Platform</title>
        <meta name="description" content="Your payment has been sent successfully. View transaction details and receipt." />
      </Helmet>
      <RoleBasedNavigation userRole="user" />
      <div className="min-h-screen bg-background pt-20 md:pt-24 pb-12 md:pb-16 lg:pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <PaymentFlowBreadcrumb currentStep="confirm" />

          <SuccessHeader transactionId={transactionData?.id} />

          <NotificationBanner
            message="The recipient has been notified via email and will receive the funds within the estimated time."
            type="success" />


          <TransactionSummary transaction={transactionData} />

          <TransactionTimeline steps={timelineSteps} />

          <ActionButtons onDownloadReceipt={handleDownloadReceipt} />

          <SuggestionsPanel
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick} />


          <div className="mt-8 md:mt-10 lg:mt-12 text-center">
            <p className="text-xs md:text-sm text-muted-foreground">
              Need help? Contact our support team 24/7 at support@finpay.com
            </p>
          </div>
        </div>
      </div>
    </>);

};

export default PaymentConfirmation;