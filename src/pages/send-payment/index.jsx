import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import PaymentFlowBreadcrumb from '../../components/ui/PaymentFlowBreadcrumb';
import RecipientSelector from './components/RecipientSelector';
import AmountInput from './components/AmountInput';
import PaymentSourceSelector from './components/PaymentSourceSelector';
import TransactionSummary from './components/TransactionSummary';
import SecurityVerification from './components/SecurityVerification';

const SendPayment = () => {
  const navigate = useNavigate();
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('UZS');
  const [selectedSource, setSelectedSource] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!selectedRecipient) {
      newErrors.recipient = 'Please select or enter a recipient';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!selectedSource) {
      newErrors.source = 'Please select a payment source';
    }

    if (selectedSource && amount) {
      const sourceBalance = selectedSource?.balance;
      const requiredAmount = parseFloat(amount);
      
      if (requiredAmount > sourceBalance) {
        newErrors.amount = 'Insufficient balance in selected payment source';
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

  const handleVerificationSuccess = () => {
    setShowVerification(false);
    navigate('/payment-confirmation', {
      state: {
        recipient: selectedRecipient,
        amount,
        currency,
        paymentSource: selectedSource,
        timestamp: new Date()?.toISOString()
      }
    });
  };

  const handleSaveRecipient = () => {
    alert('Recipient saved for future transactions');
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="user" />
      <main className="pt-24 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <PaymentFlowBreadcrumb currentStep="send" />

          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Send Payment
            </h1>
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
                  onSourceSelect={setSelectedSource}
                  error={errors?.source}
                />

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="ArrowLeft"
                    iconPosition="left"
                    onClick={() => navigate('/user-wallet-dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                  <Button
                    variant="default"
                    fullWidth
                    iconName="ArrowRight"
                    iconPosition="right"
                    onClick={handleContinue}
                    disabled={!selectedRecipient || !amount || !selectedSource}
                  >
                    Continue to Confirmation
                  </Button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                <div className="flex items-start gap-3">
                  <Icon name="Shield" size={24} className="text-accent flex-shrink-0" />
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      Secure Transaction Guarantee
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Icon name="Check" size={16} className="text-accent flex-shrink-0 mt-0.5" />
                        <span>Bank-level encryption protects your payment data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Check" size={16} className="text-accent flex-shrink-0 mt-0.5" />
                        <span>Two-factor authentication for all transactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Check" size={16} className="text-accent flex-shrink-0 mt-0.5" />
                        <span>Real-time fraud detection and prevention</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Check" size={16} className="text-accent flex-shrink-0 mt-0.5" />
                        <span>24/7 customer support for transaction issues</span>
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
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="MessageCircle"
                    iconPosition="left"
                  >
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