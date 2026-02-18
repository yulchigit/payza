import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TransactionSummary = ({ 
  cryptoType,
  cryptoAmount,
  fiatCurrency,
  fiatAmount,
  selectedCard,
  linkedCards,
  onConfirm,
  isProcessing
}) => {
  const card = linkedCards?.find(c => c?.id === selectedCard);
  const networkFee = cryptoType === 'BTC' ? 0.0001 : 0.5;
  const platformFee = parseFloat(cryptoAmount || 0) * 0.005;
  const totalFeesUSD = (cryptoType === 'BTC' ? networkFee * 45000 : networkFee) + (platformFee * (cryptoType === 'BTC' ? 45000 : 1));
  const netProceeds = parseFloat(fiatAmount || 0) - (totalFeesUSD * (fiatCurrency === 'UZS' ? 12650 : 1));

  const isValid = cryptoAmount && parseFloat(cryptoAmount) > 0 && selectedCard;

  return (
    <div className="bg-card rounded-xl border border-border p-6 md:p-8 sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="FileText" size={20} className="text-primary" />
        <h3 className="text-lg md:text-xl font-semibold text-foreground">Transaction Summary</h3>
      </div>
      <div className="space-y-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">You Send</span>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{cryptoAmount || '0.00'} {cryptoType}</p>
            </div>
          </div>
          <div className="flex items-center justify-center my-2">
            <Icon name="ArrowDown" size={20} className="text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">You Receive</span>
            <div className="text-right">
              <p className="text-lg font-bold text-accent">{netProceeds?.toLocaleString()} {fiatCurrency}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Fees</span>
            <span className="font-medium text-foreground">≈ ${totalFeesUSD?.toFixed(2)}</span>
          </div>
          {card && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Destination</span>
              <span className="font-medium text-foreground">{card?.type} •••• {card?.lastFour}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Processing Time</span>
            <span className="font-medium text-foreground">{card?.processingTime || 'N/A'}</span>
          </div>
        </div>
      </div>
      <Button
        variant="default"
        fullWidth
        onClick={onConfirm}
        disabled={!isValid || isProcessing}
        loading={isProcessing}
        iconName="ArrowRight"
        iconPosition="right"
        className="mb-4"
      >
        {isProcessing ? 'Processing...' : 'Confirm Conversion'}
      </Button>
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex items-start gap-2">
          <Icon name="CheckCircle2" size={14} className="text-success flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">Rate locked for 30 seconds</p>
        </div>
        <div className="flex items-start gap-2">
          <Icon name="CheckCircle2" size={14} className="text-success flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">Slippage protection enabled</p>
        </div>
        <div className="flex items-start gap-2">
          <Icon name="CheckCircle2" size={14} className="text-success flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">Instant notification on completion</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;