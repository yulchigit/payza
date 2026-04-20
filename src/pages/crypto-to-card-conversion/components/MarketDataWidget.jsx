import React from 'react';
import Icon from '../../../components/AppIcon';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MarketDataWidget = ({ baseCurrency, quoteCurrency, history = [], featuredMarkets = [] }) => {
  const chartData = Array.isArray(history)
    ? history.map((item) => ({
        label: item?.label,
        price: Number(item?.price || 0)
      }))
    : [];

  return (
    <div className="bg-card rounded-xl border border-border p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="BarChart3" size={20} className="text-primary" />
        <h3 className="text-lg md:text-xl font-semibold text-foreground">Market Data</h3>
      </div>
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">{baseCurrency}/{quoteCurrency} Rate History</h4>
          <div className="h-48 md:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h4 className="text-sm font-medium text-foreground mb-4">Market References</h4>
          <div className="space-y-3">
            {featuredMarkets.map((item) => (
              <div key={item?.symbol} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item?.symbol}</p>
                  <p className="text-xs text-muted-foreground">{item?.source}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {Number(item?.lastPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 6 })}
                  </p>
                  <p className={`text-xs ${Number(item?.priceChangePercent || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {Number(item?.priceChangePercent || 0) >= 0 ? '+' : ''}{Number(item?.priceChangePercent || 0).toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-4 flex items-start gap-3">
          <Icon name="TrendingUp" size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Live Reference Flow</p>
            <p className="text-xs text-muted-foreground">
              Crypto prices come from CoinGecko public market data. UZS conversion uses the official CBU USD reference rate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDataWidget;
