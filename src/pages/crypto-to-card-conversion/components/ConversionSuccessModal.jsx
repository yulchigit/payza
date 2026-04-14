import React from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const formatAmount = (value, currency) => {
  const amount = Number(value || 0);
  if (currency === 'BTC') {
    return `${amount.toFixed(8)} BTC`;
  }
  if (currency === 'UZS') {
    return `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} UZS`;
  }
  return `${amount.toFixed(4)} ${currency}`;
};

const ConversionSuccessModal = ({ isOpen, onClose, conversionDetails }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border max-w-md w-full p-6 md:p-8 shadow-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <Icon name="CheckCircle2" size={40} className="text-success" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Demo Swap Successful</h2>
          <p className="text-sm text-muted-foreground">
            Your wallet balances were updated using live market references.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Spent</span>
              <span className="text-lg font-bold text-foreground">
                {formatAmount(conversionDetails?.fromAmount, conversionDetails?.fromCurrency)}
              </span>
            </div>
            <div className="flex items-center justify-center my-2">
              <Icon name="ArrowDown" size={20} className="text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Received</span>
              <span className="text-lg font-bold text-accent">
                {formatAmount(conversionDetails?.toAmount, conversionDetails?.toCurrency)}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-xs text-foreground">
                {conversionDetails?.transactionId || `SWAP${Date.now()?.toString()?.slice(-8)}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pair</span>
              <span className="text-foreground">{conversionDetails?.fromCurrency} / {conversionDetails?.toCurrency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Effective Rate</span>
              <span className="text-foreground">{Number(conversionDetails?.effectiveRate || 0).toLocaleString('en-US', { maximumFractionDigits: 8 })}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button variant="default" fullWidth onClick={onClose} iconName="Home" iconPosition="left">
            Back to Dashboard
          </Button>
        </div>

        <div className="mt-6 p-4 bg-accent/10 rounded-lg flex items-start gap-3">
          <Icon name="Bell" size={18} className="text-accent flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            This investor demo records swap history in the backend and re-values your portfolio using the updated balances.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConversionSuccessModal;
