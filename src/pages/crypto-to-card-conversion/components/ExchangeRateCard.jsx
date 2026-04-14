import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';

const ExchangeRateCard = ({ fromCurrency, toCurrency, quote, history = [] }) => {
  const [timeRemaining, setTimeRemaining] = useState(30);

  useEffect(() => {
    setTimeRemaining(30);
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [quote?.generatedAt, fromCurrency, toCurrency]);

  const recentHistory = useMemo(() => {
    const safeHistory = Array.isArray(history) ? history : [];
    return safeHistory.slice(-4).reverse();
  }, [history]);

  const currentRate = Number(quote?.marketRate || 0);
  const effectiveRate = Number(quote?.effectiveRate || 0);
  const trend = recentHistory.length > 1 && Number(recentHistory[0]?.price || 0) >= Number(recentHistory[1]?.price || 0) ? 'up' : 'down';
  const latestDelta = recentHistory.length > 1
    ? ((Number(recentHistory[0]?.price || 0) - Number(recentHistory[1]?.price || 0)) / Number(recentHistory[1]?.price || 1)) * 100
    : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-foreground">Current Exchange Rate</h3>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
          <Icon name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={14} />
          <span>{Number.isFinite(latestDelta) ? `${latestDelta >= 0 ? '+' : ''}${latestDelta.toFixed(2)}%` : '0.00%'}</span>
        </div>
      </div>
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl md:text-4xl font-bold text-foreground">
            {currentRate ? currentRate.toLocaleString('en-US', { maximumFractionDigits: 8 }) : '0.00'}
          </span>
          <span className="text-lg text-muted-foreground">{toCurrency}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-2">per 1 {fromCurrency}</p>
        <p className="text-xs text-muted-foreground">
          Effective rate after spread: {effectiveRate ? effectiveRate.toLocaleString('en-US', { maximumFractionDigits: 8 }) : '0.00'} {toCurrency}
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Icon name="Clock" size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Quote Refresh Window</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
              <span className="text-sm font-bold text-primary">{timeRemaining}</span>
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="4"
                  strokeDasharray={`${(timeRemaining / 30) * 125.6} 125.6`}
                  className="transition-all duration-1000"
                />
              </svg>
            </div>
            <span className="text-xs text-muted-foreground">seconds</span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Recent Rate History</h4>
          <div className="space-y-2">
            {recentHistory.map((item) => (
              <div key={item?.timestamp} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item?.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {Number(item?.price || 0).toLocaleString('en-US', { maximumFractionDigits: 8 })}
                  </span>
                  <span className="text-xs text-muted-foreground">{toCurrency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateCard;
