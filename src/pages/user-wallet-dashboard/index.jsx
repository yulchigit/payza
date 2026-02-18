import React from 'react';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import TotalBalanceCard from './components/TotalBalanceCard';
import BalanceCard from './components/BalanceCard';
import ActionButtons from './components/ActionButtons';
import RecentTransactions from './components/RecentTransactions';
import QuickLinks from './components/QuickLinks';

const UserWalletDashboard = () => {
  const mockData = {
    totalBalance: 15847.32,
    traditionalBalances: [
    { currency: "UZS", amount: 5420000 },
    { currency: "USD", amount: 3250.50 }],

    cryptoBalances: [
    { currency: "USDT", amount: 5876.82 },
    { currency: "BTC", amount: 0.15 }],

    traditionalMethods: [
    { name: "Uzcard", status: "active" },
    { name: "Humo", status: "active" },
    { name: "Visa", status: "active" }],

    cryptoMethods: [
    { name: "USDT Wallet", status: "active" },
    { name: "BTC Wallet", status: "active" }],

    recentTransactions: [
    {
      id: "txn001",
      type: "receive",
      description: "Payment from John Smith",
      method: "Uzcard",
      date: "2026-01-06T05:30:00",
      amount: 250000,
      currency: "UZS",
      status: "success"
    },
    {
      id: "txn002",
      type: "send",
      description: "Transfer to Sarah Johnson",
      method: "Visa",
      date: "2026-01-05T14:20:00",
      amount: 125.50,
      currency: "USD",
      status: "success"
    },
    {
      id: "txn003",
      type: "convert",
      description: "USDT to USD Conversion",
      method: "Crypto Exchange",
      date: "2026-01-05T10:15:00",
      amount: 500,
      currency: "USD",
      status: "success"
    },
    {
      id: "txn004",
      type: "receive",
      description: "Crypto payment received",
      method: "USDT Wallet",
      date: "2026-01-04T18:45:00",
      amount: 1250.00,
      currency: "USDT",
      status: "success"
    },
    {
      id: "txn005",
      type: "withdrawal",
      description: "Bank withdrawal",
      method: "Humo Card",
      date: "2026-01-04T09:30:00",
      amount: 500000,
      currency: "UZS",
      status: "processing"
    },
    {
      id: "txn006",
      type: "send",
      description: "Payment to merchant",
      method: "BTC Wallet",
      date: "2026-01-03T16:20:00",
      amount: 0.005,
      currency: "BTC",
      status: "success"
    }]

  };

  const calculateTraditionalTotal = () => {
    const uzsInUsd = mockData?.traditionalBalances?.[0]?.amount / 12500;
    return uzsInUsd + mockData?.traditionalBalances?.[1]?.amount;
  };

  const calculateCryptoTotal = () => {
    const btcInUsd = mockData?.cryptoBalances?.[1]?.amount * 45000;
    return mockData?.cryptoBalances?.[0]?.amount + btcInUsd;
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="user" />
      <main className="pt-24 pb-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Welcome!</h1>
          <p className="text-base md:text-lg text-muted-foreground">Manage your payments and balances</p>
        </div>

        <div className="space-y-6 md:space-y-8">
          <TotalBalanceCard
            totalBalance={mockData?.totalBalance}
            currency="USD" />


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BalanceCard
              title="Traditional Currency"
              icon="CreditCard"
              iconBg="bg-primary/10"
              iconColor="var(--color-primary)"
              balances={mockData?.traditionalBalances}
              connectedMethods={mockData?.traditionalMethods} />

            <BalanceCard
              title="Cryptocurrency"
              icon="Bitcoin"
              iconBg="bg-accent/10"
              iconColor="var(--color-accent)"
              balances={mockData?.cryptoBalances}
              connectedMethods={mockData?.cryptoMethods} />

          </div>

          <ActionButtons />

          <QuickActionPanel userRole="user" />

          <RecentTransactions transactions={mockData?.recentTransactions} />

          <QuickLinks />
        </div>
      </main>
    </div>);

};

export default UserWalletDashboard;