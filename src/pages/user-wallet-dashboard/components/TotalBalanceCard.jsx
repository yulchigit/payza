import React from 'react';
import Icon from '../../../components/AppIcon';

const TotalBalanceCard = ({ totalBalance, currency = 'USD', dailyChangePercent = 0 }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const isPositive = Number(dailyChangePercent || 0) >= 0;

  return (
    <div className="bg-gradient-to-br from-primary to-accent rounded-xl p-6 md:p-8 lg:p-10 shadow-lg">
      <div className="flex items-start justify-between mb-4 md:mb-6 gap-4">
        <div>
          <p className="text-sm md:text-base mb-2 text-white">Total Balance</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
            {formatCurrency(totalBalance)}
          </h1>
        </div>
        <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <Icon name="Wallet" size={24} color="var(--color-primary-foreground)" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 text-primary-foreground/90">
        <span className="text-xs md:text-sm text-neutral-50">Demo portfolio valued with live market references</span>
        <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${isPositive ? 'bg-white/20 text-white' : 'bg-black/20 text-white'}`}>
          <Icon name={isPositive ? 'TrendingUp' : 'TrendingDown'} size={14} color="var(--color-primary-foreground)" />
          <span>{isPositive ? '+' : ''}{Number(dailyChangePercent || 0).toFixed(2)}% 24h</span>
        </div>
      </div>
    </div>
  );
};

export default TotalBalanceCard;
