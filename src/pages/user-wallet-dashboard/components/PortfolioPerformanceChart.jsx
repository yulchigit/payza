import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const PortfolioPerformanceChart = ({ data = [] }) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground">Portfolio Performance</h3>
          <p className="text-sm text-muted-foreground">Live balances valued with current market references</p>
        </div>
      </div>

      <div className="h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={safeData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.28} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
            />
            <Tooltip
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Portfolio']}
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px'
              }}
            />
            <Area
              type="monotone"
              dataKey="totalBalanceUsd"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#portfolioGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioPerformanceChart;
