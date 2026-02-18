import React from 'react';
import Icon from '../../../components/AppIcon';
import StatusIndicatorSystem from '../../../components/ui/StatusIndicatorSystem';

const BalanceCard = ({ 
  title, 
  icon, 
  iconBg, 
  iconColor, 
  balances, 
  connectedMethods 
}) => {
  const formatAmount = (amount, currency) => {
    // List of valid ISO 4217 currency codes
    const validCurrencyCodes = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];
    
    // Check if currency is a valid ISO code
    if (validCurrencyCodes?.includes(currency?.toUpperCase())) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })?.format(amount);
    } else {
      // For cryptocurrencies and other non-ISO currencies, format manually
      return `${parseFloat(amount)?.toFixed(2)} ${currency}`;
    }
  };

  const calculateTotal = () => {
    return balances?.reduce((sum, balance) => sum + balance?.amount, 0);
  };

  const calculatePercentage = (amount) => {
    const total = calculateTotal();
    return total > 0 ? ((amount / total) * 100)?.toFixed(1) : 0;
  };

  return (
    <div className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-sm hover:shadow-md transition-all duration-250">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${iconBg} flex items-center justify-center`}>
            <Icon name={icon} size={20} color={iconColor} />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground">{title}</h3>
        </div>
      </div>
      <div className="space-y-4 mb-6">
        {balances?.map((balance, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {balance?.currency}
                </span>
              </div>
              <div>
                <p className="text-sm md:text-base font-semibold text-foreground">
                  {formatAmount(balance?.amount, balance?.currency)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {calculatePercentage(balance?.amount)}% of total
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-3">Connected Methods</p>
        <div className="flex flex-wrap gap-2">
          {connectedMethods?.map((method, index) => (
            <StatusIndicatorSystem
              key={index}
              status={method?.status}
              label={method?.name}
              showIcon={true}
              size="default"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;