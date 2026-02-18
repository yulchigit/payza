import React from 'react';
import Icon from '../../../components/AppIcon';

const PaymentBreakdownCard = ({ 
  title, 
  amount, 
  currency = 'UZS',
  percentage,
  icon,
  iconBg,
  iconColor,
  transactionCount
}) => {
  const formatAmount = (val) => {
    if (currency === 'UZS') {
      return new Intl.NumberFormat('en-US')?.format(val);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    })?.format(val);
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border transition-all duration-250 hover:shadow-md">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon name={icon} size={20} color={iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm md:text-base font-semibold text-foreground mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            {title}
          </h4>
          <p className="text-xs text-muted-foreground">
            {transactionCount} transactions
          </p>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl md:text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-data)' }}>
            {formatAmount(amount)}
            {currency === 'UZS' && <span className="text-sm md:text-base ml-1 text-muted-foreground">UZS</span>}
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg md:text-xl font-bold text-primary">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentBreakdownCard;