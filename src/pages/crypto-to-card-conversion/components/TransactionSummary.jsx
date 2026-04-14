import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

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

const TransactionSummary = ({
  fromCurrency,
  toCurrency,
  fromAmount,
  walletBalances,
  quote,
  onConfirm,
  isProcessing,
  quoteLoading
}) => {
  const isValid = fromAmount && Number(fromAmount) > 0 && Number(walletBalances?.[fromCurrency] || 0) >= Number(fromAmount || 0);

  return (
    <div className="bg-card rounded-xl border border-border p-6 md:p-8 sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="FileText" size={20} className="text-primary" />
        <h3 className="text-lg md:text-xl font-semibold text-foreground">Swap Summary</h3>
      </div>
      <div className="space-y-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">You Spend</span>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{formatAmount(fromAmount || 0, fromCurrency)}</p>
            </div>
          </div>
          <div className="flex items-center justify-center my-2">
            <Icon name="ArrowDown" size={20} className="text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">You Receive</span>
            <div className="text-right">
              <p className="text-lg font-bold text-accent">{formatAmount(quote?.netOutput || 0, toCurrency)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Rate</span>
            <span className="font-medium text-foreground">
              {Number(quote?.effectiveRate || 0).toLocaleString('en-US', { maximumFractionDigits: 8 })} {toCurrency}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Platform Fee</span>
            <span className="font-medium text-foreground">{formatAmount(quote?.feeAmountSource || 0, fromCurrency)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Market Spread Impact</span>
            <span className="font-medium text-foreground">{formatAmount(quote?.spreadImpactTarget || 0, toCurrency)}</span>
          </div>
        </div>
      </div>
      <Button
        variant="default"
        fullWidth
        onClick={onConfirm}
        disabled={!isValid || isProcessing || quoteLoading || !quote}
        loading={isProcessing || quoteLoading}
        iconName="ArrowRight"
        iconPosition="right"
        className="mb-4"
      >
        {isProcessing ? 'Executing Swap...' : quoteLoading ? 'Refreshing Quote...' : 'Confirm Demo Swap'}
      </Button>
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex items-start gap-2">
          <Icon name="CheckCircle2" size={14} className="text-success flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">Wallet-to-wallet demo settlement</p>
        </div>
        <div className="flex items-start gap-2">
          <Icon name="CheckCircle2" size={14} className="text-success flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">Quote refreshed against live market references</p>
        </div>
        <div className="flex items-start gap-2">
          <Icon name="CheckCircle2" size={14} className="text-success flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">Operation history is stored in the backend</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;
