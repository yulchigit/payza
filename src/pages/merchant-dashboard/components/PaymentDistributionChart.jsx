import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const FALLBACK_DATA = [
  { name: 'Card Payments', value: 43000000, color: 'var(--color-primary)' },
  { name: 'Visa Payments', value: 23000000, color: 'var(--color-accent)' },
  { name: 'Crypto Payments', value: 18000000, color: 'var(--color-warning)' }
];

const PaymentDistributionChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : FALLBACK_DATA;
  const total = chartData.reduce((sum, item) => sum + Number(item?.value || 0), 0);

  const normalizedData = total > 0
    ? chartData
    : chartData.map((item) => ({
        ...item,
        value: 1
      }));

  const dataForTooltip = total > 0 ? chartData : [];

  const dataColors = normalizedData?.map(item => item?.color);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const source = dataForTooltip.find((item) => item?.name === payload?.[0]?.name);
      const value = Number(source?.value || 0);
      const percentage = total > 0 ? ((value / total) * 100)?.toFixed(1) : '0.0';

      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-1">{payload?.[0]?.name}</p>
          <p className="text-xs text-muted-foreground">
            {new Intl.NumberFormat('en-US')?.format(value)} UZS
          </p>
          <p className="text-xs text-primary font-medium mt-1">
            {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (total === 0) {
      return null;
    }

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-data)' }}
      >
        {`${(percent * 100)?.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-card rounded-xl p-6 md:p-8 border border-border">
      <h3 className="text-lg md:text-xl font-bold text-foreground mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
        Payment Distribution
      </h3>
      <div className="w-full h-64 md:h-80" aria-label="Payment Distribution Pie Chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={normalizedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {normalizedData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={dataColors?.[index % dataColors?.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{ fontSize: '12px', fontFamily: 'var(--font-caption)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {total === 0 && (
        <p className="text-xs text-muted-foreground mt-2">No transactions yet.</p>
      )}
    </div>
  );
};

export default PaymentDistributionChart;
