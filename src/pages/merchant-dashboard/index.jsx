import React from 'react';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import MetricCard from './components/MetricCard';
import PaymentBreakdownCard from './components/PaymentBreakdownCard';
import RevenueChart from './components/RevenueChart';
import PaymentDistributionChart from './components/PaymentDistributionChart';
import RecentTransactionsTable from './components/RecentTransactionsTable';
import QuickActionsPanel from './components/QuickActionsPanel';

const MerchantDashboard = () => {
  const metrics = [
    {
      title: "Today\'s Earnings",
      value: 12450000,
      currency: 'UZS',
      change: 15.3,
      trend: 'up',
      icon: 'TrendingUp',
      iconBg: 'bg-success/10',
      iconColor: 'var(--color-success)'
    },
    {
      title: 'Total Balance',
      value: 84000000,
      currency: 'UZS',
      change: 8.7,
      trend: 'up',
      icon: 'Wallet',
      iconBg: 'bg-primary/10',
      iconColor: 'var(--color-primary)'
    },
    {
      title: 'Payment Volume',
      value: 156,
      currency: 'transactions',
      change: 12.4,
      trend: 'up',
      icon: 'Activity',
      iconBg: 'bg-accent/10',
      iconColor: 'var(--color-accent)'
    }
  ];

  const paymentBreakdown = [
    {
      title: 'Card Payments',
      amount: 43000000,
      currency: 'UZS',
      percentage: 51.2,
      icon: 'CreditCard',
      iconBg: 'bg-primary/10',
      iconColor: 'var(--color-primary)',
      transactionCount: 89
    },
    {
      title: 'International Visa',
      amount: 23000000,
      currency: 'UZS',
      percentage: 27.4,
      icon: 'Globe',
      iconBg: 'bg-accent/10',
      iconColor: 'var(--color-accent)',
      transactionCount: 45
    },
    {
      title: 'Crypto Payments',
      amount: 18000000,
      currency: 'UZS',
      percentage: 21.4,
      icon: 'Bitcoin',
      iconBg: 'bg-warning/10',
      iconColor: 'var(--color-warning)',
      transactionCount: 22
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="merchant" />
      <main className="pt-24 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
          {/* Header Section */}
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Merchant Dashboard
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Monitor your business performance and manage payments
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {metrics?.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>

          {/* Payment Breakdown Section */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              Payment Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {paymentBreakdown?.map((payment, index) => (
                <PaymentBreakdownCard key={index} {...payment} />
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <RevenueChart />
            <PaymentDistributionChart />
          </div>

          {/* Recent Transactions */}
          <RecentTransactionsTable />

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              Quick Actions
            </h2>
            <QuickActionsPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MerchantDashboard;