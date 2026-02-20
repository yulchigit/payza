import React, { useEffect, useMemo, useState } from 'react';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import TotalBalanceCard from './components/TotalBalanceCard';
import BalanceCard from './components/BalanceCard';
import ActionButtons from './components/ActionButtons';
import RecentTransactions from './components/RecentTransactions';
import QuickLinks from './components/QuickLinks';
import apiClient from 'lib/apiClient';

const UserWalletDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const normalizeMethodStatus = (status) => {
    if (status === 'connected') return 'active';
    if (status === 'disconnected') return 'inactive';
    return status || 'pending';
  };

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiClient.get('/wallet/overview', {
          params: { limit: 10 }
        });

        const data = response?.data?.data;
        if (!data) {
          throw new Error('Invalid dashboard response');
        }

        const normalized = {
          totalBalance: Number(data?.summary?.totalBalanceUsd || 0),
          traditionalBalances: (data?.traditionalBalances || [])?.map((item) => ({
            currency: item?.currency,
            amount: Number(item?.amount || 0)
          })),
          cryptoBalances: (data?.cryptoBalances || [])?.map((item) => ({
            currency: item?.currency,
            amount: Number(item?.amount || 0)
          })),
          traditionalMethods: (data?.traditionalMethods || [])?.map((item) => ({
            name: item?.name,
            status: normalizeMethodStatus(item?.status)
          })),
          cryptoMethods: (data?.cryptoMethods || [])?.map((item) => ({
            name: item?.name,
            status: normalizeMethodStatus(item?.status)
          })),
          recentTransactions: (data?.recentTransactions || [])?.map((item) => ({
            id: item?.id,
            type: item?.type || 'send',
            description: item?.description || 'Transaction',
            method: item?.method || 'Wallet',
            date: item?.date,
            amount: Number(item?.amount || 0),
            currency: item?.currency || 'USD',
            status: item?.status || 'pending'
          }))
        };

        if (isMounted) {
          setDashboardData(normalized);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError?.response?.data?.error || 'Failed to load wallet data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const safeData = useMemo(
    () =>
      dashboardData || {
        totalBalance: 0,
        traditionalBalances: [],
        cryptoBalances: [],
        traditionalMethods: [],
        cryptoMethods: [],
        recentTransactions: []
      },
    [dashboardData]
  );

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
            totalBalance={safeData?.totalBalance}
            currency="USD" />

          {isLoading && (
            <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground">
              Loading wallet overview...
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BalanceCard
              title="Traditional Currency"
              icon="CreditCard"
              iconBg="bg-primary/10"
              iconColor="var(--color-primary)"
              balances={safeData?.traditionalBalances}
              connectedMethods={safeData?.traditionalMethods} />

            <BalanceCard
              title="Cryptocurrency"
              icon="Bitcoin"
              iconBg="bg-accent/10"
              iconColor="var(--color-accent)"
              balances={safeData?.cryptoBalances}
              connectedMethods={safeData?.cryptoMethods} />

          </div>

          <ActionButtons />

          <QuickActionPanel userRole="user" />

          <RecentTransactions transactions={safeData?.recentTransactions} />

          <QuickLinks />
        </div>
      </main>
    </div>);

};

export default UserWalletDashboard;
