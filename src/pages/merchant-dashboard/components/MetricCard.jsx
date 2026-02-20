import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ 
  title, 
  value, 
  currency = 'UZS', 
  change, 
  trend = 'up',
  icon,
  iconBg = 'bg-primary/10',
  iconColor = 'var(--color-primary)'
}) => {
  const formatValue = (val) => {
    if (currency === 'COUNT') {
      return new Intl.NumberFormat('en-US')?.format(val);
    }

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
    <div className="bg-card rounded-xl p-6 md:p-8 border border-border transition-all duration-250 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon name={icon} size={24} color={iconColor} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
          }`}>
            <Icon name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={14} />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-sm md:text-base text-muted-foreground mb-2 font-medium" style={{ fontFamily: 'var(--font-caption)' }}>
        {title}
      </h3>
      <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
        {formatValue(value)}
        {currency === 'UZS' && <span className="text-lg md:text-xl lg:text-2xl ml-2 text-muted-foreground">UZS</span>}
        {currency === 'COUNT' && <span className="text-base md:text-lg ml-2 text-muted-foreground">tx</span>}
      </p>
    </div>
  );
};

export default MetricCard;
