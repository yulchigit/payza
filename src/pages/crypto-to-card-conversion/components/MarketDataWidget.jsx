import React from 'react';
import Icon from '../../../components/AppIcon';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MarketDataWidget = ({ cryptoType, fiatCurrency }) => {
  const rateHistoryData = [
    { time: '00:00', rate: cryptoType === 'BTC' ? 44800 : 0.998 },
    { time: '04:00', rate: cryptoType === 'BTC' ? 44950 : 0.999 },
    { time: '08:00', rate: cryptoType === 'BTC' ? 45100 : 1.001 },
    { time: '12:00', rate: cryptoType === 'BTC' ? 45200 : 1.000 },
    { time: '16:00', rate: cryptoType === 'BTC' ? 45050 : 0.999 },
    { time: '20:00', rate: cryptoType === 'BTC' ? 45000 : 1.000 }
  ];

  const volumeData = [
    { period: 'Last Hour', volume: '1.2M', change: '+5.2%' },
    { period: 'Last 24h', volume: '28.5M', change: '+12.8%' },
    { period: 'Last 7d', volume: '185.3M', change: '+8.4%' }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="BarChart3" size={20} className="text-primary" />
        <h3 className="text-lg md:text-xl font-semibold text-foreground">Market Data</h3>
      </div>
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">24h Rate History</h4>
          <div className="h-48 md:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rateHistoryData}>
                <XAxis 
                  dataKey="time" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  domain={['dataMin - 100', 'dataMax + 100']}
                />
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
                  dataKey="rate" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h4 className="text-sm font-medium text-foreground mb-4">Conversion Volume</h4>
          <div className="space-y-3">
            {volumeData?.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">{item?.period}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">${item?.volume}</span>
                  <span className={`text-xs font-medium ${
                    item?.change?.startsWith('+') ? 'text-success' : 'text-error'
                  }`}>
                    {item?.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-4 flex items-start gap-3">
          <Icon name="TrendingUp" size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Market Insight</p>
            <p className="text-xs text-muted-foreground">
              {cryptoType} conversion volume has increased by 12.8% in the last 24 hours, indicating strong market activity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDataWidget;