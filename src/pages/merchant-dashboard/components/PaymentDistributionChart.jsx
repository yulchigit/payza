import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PaymentDistributionChart = () => {
  const data = [
    { name: 'Card Payments', value: 43000000, color: 'var(--color-primary)' },
    { name: 'Visa Payments', value: 23000000, color: 'var(--color-accent)' },
    { name: 'Crypto Payments', value: 18000000, color: 'var(--color-warning)' }
  ];

  const COLORS = data?.map(item => item?.color);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-1">{payload?.[0]?.name}</p>
          <p className="text-xs text-muted-foreground">
            {new Intl.NumberFormat('en-US')?.format(payload?.[0]?.value)} UZS
          </p>
          <p className="text-xs text-primary font-medium mt-1">
            {((payload?.[0]?.value / data?.reduce((sum, item) => sum + item?.value, 0)) * 100)?.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
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
    </div>
  );
};

export default PaymentDistributionChart;