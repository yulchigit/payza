import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Button from '../../../components/ui/Button';

const FALLBACK_WEEKLY_DATA = [
  { day: 'Mon', card: 4500000, visa: 2300000, crypto: 1800000 },
  { day: 'Tue', card: 5200000, visa: 2800000, crypto: 2100000 },
  { day: 'Wed', card: 4800000, visa: 2500000, crypto: 1900000 },
  { day: 'Thu', card: 6100000, visa: 3200000, crypto: 2400000 },
  { day: 'Fri', card: 7200000, visa: 3800000, crypto: 2900000 },
  { day: 'Sat', card: 8500000, visa: 4200000, crypto: 3500000 },
  { day: 'Sun', card: 6800000, visa: 3500000, crypto: 2700000 }
];

const FALLBACK_MONTHLY_DATA = [
  { week: 'Week 1', card: 28000000, visa: 15000000, crypto: 12000000 },
  { week: 'Week 2', card: 32000000, visa: 17000000, crypto: 14000000 },
  { week: 'Week 3', card: 35000000, visa: 19000000, crypto: 15000000 },
  { week: 'Week 4', card: 38000000, visa: 21000000, crypto: 17000000 }
];

const RevenueChart = ({ weeklyData = [], monthlyData = [] }) => {
  const [timeFilter, setTimeFilter] = useState('weekly');

  const safeWeeklyData = weeklyData.length > 0 ? weeklyData : FALLBACK_WEEKLY_DATA;
  const safeMonthlyData = monthlyData.length > 0 ? monthlyData : FALLBACK_MONTHLY_DATA;
  const data = timeFilter === 'weekly' ? safeWeeklyData : safeMonthlyData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-xs text-muted-foreground" style={{ color: entry?.color }}>
              {entry?.name}: {new Intl.NumberFormat('en-US')?.format(entry?.value)} UZS
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl p-6 md:p-8 border border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg md:text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          Revenue Trends
        </h3>
        <div className="flex gap-2">
          <Button
            variant={timeFilter === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={timeFilter === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('monthly')}
          >
            Monthly
          </Button>
        </div>
      </div>
      <div className="w-full h-64 md:h-80" aria-label="Revenue Trends Bar Chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey={timeFilter === 'weekly' ? 'day' : 'week'} 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px', fontFamily: 'var(--font-caption)' }}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px', fontFamily: 'var(--font-caption)' }}
              tickFormatter={(value) => `${(value / 1000000)?.toFixed(0)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px', fontFamily: 'var(--font-caption)' }}
            />
            <Bar dataKey="card" fill="var(--color-primary)" name="Card Payments" radius={[4, 4, 0, 0]} />
            <Bar dataKey="visa" fill="var(--color-accent)" name="Visa Payments" radius={[4, 4, 0, 0]} />
            <Bar dataKey="crypto" fill="var(--color-warning)" name="Crypto Payments" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
