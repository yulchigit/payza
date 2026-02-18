import React from 'react';
import Icon from '../../../components/AppIcon';

const TransactionSummary = ({ recipient, amount, currency, paymentSource }) => {
  const calculateFee = () => {
    if (!amount || !paymentSource) return 0;
    const feePercentage = parseFloat(paymentSource?.fee?.replace('%', ''));
    return (parseFloat(amount) * feePercentage / 100)?.toFixed(2);
  };

  const calculateTotal = () => {
    if (!amount) return 0;
    return (parseFloat(amount) + parseFloat(calculateFee()))?.toFixed(2);
  };

  const formatCurrency = (value) => {
    if (currency === 'BTC') {
      return `${value} BTC`;
    } else if (currency === 'USDT') {
      return `${value} USDT`;
    } else if (currency === 'USD') {
      return `$${value}`;
    } else {
      return `${value} UZS`;
    }
  };

  if (!recipient || !amount || !paymentSource) {
    return null;
  }

  return (
    <div className="p-6 bg-card border border-border rounded-lg space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <Icon name="FileText" size={20} className="text-primary" />
        <h3 className="text-base font-semibold text-foreground">Transaction Summary</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon name="User" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Recipient</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {recipient?.name || 'Manual Entry'}
            </p>
            {recipient?.phone && (
              <p className="text-xs text-muted-foreground">{recipient?.phone}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="DollarSign" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Amount</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {formatCurrency(amount)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="CreditCard" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Payment Source</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {paymentSource?.name}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Percent" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Transaction Fee</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {formatCurrency(calculateFee())}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Clock" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Processing Time</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {paymentSource?.processingTime}
          </p>
        </div>
      </div>
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-foreground">Total Amount</span>
          <span className="text-lg font-bold text-primary">
            {formatCurrency(calculateTotal())}
          </span>
        </div>
      </div>
      <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <Icon name="Shield" size={16} className="text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-primary">
          Your transaction is protected by bank-level encryption and security protocols.
        </p>
      </div>
    </div>
  );
};

export default TransactionSummary;