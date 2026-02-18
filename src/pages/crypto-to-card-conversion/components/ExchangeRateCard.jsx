import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ExchangeRateCard = ({ cryptoType, fiatCurrency, exchangeRates }) => {
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [rateHistory, setRateHistory] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) return 30;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const history = [
      { time: '5m ago', rate: exchangeRates?.[cryptoType]?.[fiatCurrency] * 0.998, change: -0.2 },
      { time: '10m ago', rate: exchangeRates?.[cryptoType]?.[fiatCurrency] * 1.001, change: 0.1 },
      { time: '15m ago', rate: exchangeRates?.[cryptoType]?.[fiatCurrency] * 0.999, change: -0.1 },
      { time: '20m ago', rate: exchangeRates?.[cryptoType]?.[fiatCurrency] * 1.002, change: 0.2 }
    ];
    setRateHistory(history);
  }, [cryptoType, fiatCurrency, exchangeRates]);

  const currentRate = exchangeRates?.[cryptoType]?.[fiatCurrency];
  const trend = rateHistory?.length > 0 && rateHistory?.[0]?.change > 0 ? 'up' : 'down';

  return (
    <div className="bg-card rounded-xl border border-border p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-foreground">Current Exchange Rate</h3>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
          trend === 'up' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
        }`}>
          <Icon name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={14} />
          <span>{Math.abs(rateHistory?.[0]?.change || 0)}%</span>
        </div>
      </div>
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl md:text-4xl font-bold text-foreground">
            {currentRate?.toLocaleString()}
          </span>
          <span className="text-lg text-muted-foreground">{fiatCurrency}</span>
        </div>
        <p className="text-sm text-muted-foreground">per 1 {cryptoType}</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Icon name="Clock" size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Rate Lock Duration</span>
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
            {rateHistory?.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item?.time}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{item?.rate?.toLocaleString()}</span>
                  <span className={`text-xs ${item?.change > 0 ? 'text-success' : 'text-error'}`}>
                    {item?.change > 0 ? '+' : ''}{item?.change}%
                  </span>
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