import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import MetricCard from './components/MetricCard';
import PaymentBreakdownCard from './components/PaymentBreakdownCard';
import RecentTransactionsTable from './components/RecentTransactionsTable';
import QuickActionsPanel from './components/QuickActionsPanel';
import apiClient from 'lib/apiClient';

// Lazy-load chart components
const RevenueChart = lazy(() => import('./components/RevenueChart'));
const PaymentDistributionChart = lazy(() => import('./components/PaymentDistributionChart'));

// Loading skeleton for charts
const ChartSkeleton = () => (
  <div className="bg-card border border-border rounded-xl p-6 md:p-8 animate-pulse">
    <div className="h-6 bg-muted rounded w-32 mb-6" />
    <div className="space-y-4">
      <div className="h-40 bg-muted rounded" />
      <div className="h-4 bg-muted rounded w-24" />
    </div>
  </div>
);

const UZS_PER_USD = 12650;
const USD_RATES = {
  UZS: 1 / UZS_PER_USD,
  USD: 1,
  USDT: 1,
  BTC: 45000,
  ETH: 2800
};

const PAYMENT_BUCKETS = {
  card: {
    title: 'Card Payments',
    icon: 'CreditCard',
    iconBg: 'bg-primary/10',
    iconColor: 'var(--color-primary)',
    typeLabel: 'Card Payment'
  },
  visa: {
    title: 'International Visa',
    icon: 'Globe',
    iconBg: 'bg-accent/10',
    iconColor: 'var(--color-accent)',
    typeLabel: 'Visa Payment'
  },
  crypto: {
    title: 'Crypto Payments',
    icon: 'Bitcoin',
    iconBg: 'bg-warning/10',
    iconColor: 'var(--color-warning)',
    typeLabel: 'Crypto Payment'
  }
};

const toUsd = (amount, currency) => {
  const rate = USD_RATES[currency] || 0;
  return Number(amount || 0) * rate;
};

const toUzs = (amount, currency) => toUsd(amount, currency) * UZS_PER_USD;

const bucketByCurrency = (currency) => {
  if (currency === 'USD') return 'visa';
  if (currency === 'USDT' || currency === 'BTC' || currency === 'ETH') return 'crypto';
  return 'card';
};

const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const startOfLocalDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const clampPercent = (value) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-999, Math.min(999, Number(value.toFixed(1))));
};

const percentageChange = (current, previous) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return clampPercent(((current - previous) / Math.abs(previous)) * 100);
};

const buildWeeklyRevenue = (rows) => {
  const now = startOfLocalDay(new Date());
  const firstDay = new Date(now);
  firstDay.setDate(now.getDate() - 6);
  const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

  const map = new Map();
  for (let index = 0; index < 7; index += 1) {
    const current = new Date(firstDay);
    current.setDate(firstDay.getDate() + index);
    map.set(dateKey(current), {
      day: weekdayFormatter.format(current),
      card: 0,
      visa: 0,
      crypto: 0
    });
  }

  rows.forEach((row) => {
    const key = dateKey(row.createdAtDate);
    const target = map.get(key);
    if (!target) return;
    target[row.bucket] += row.amountUzs;
  });

  return Array.from(map.values()).map((item) => ({
    ...item,
    card: Number(item.card.toFixed(2)),
    visa: Number(item.visa.toFixed(2)),
    crypto: Number(item.crypto.toFixed(2))
  }));
};

const buildMonthlyRevenue = (rows) => {
  const now = startOfLocalDay(new Date());
  const firstDay = new Date(now);
  firstDay.setDate(now.getDate() - 27);
  const dayMs = 24 * 60 * 60 * 1000;

  const weeks = Array.from({ length: 4 }, (_, index) => ({
    week: `Week ${index + 1}`,
    card: 0,
    visa: 0,
    crypto: 0
  }));

  rows.forEach((row) => {
    if (row.createdAtDate < firstDay) return;
    const diffDays = Math.floor((startOfLocalDay(row.createdAtDate) - firstDay) / dayMs);
    const weekIndex = Math.max(0, Math.min(3, Math.floor(diffDays / 7)));
    weeks[weekIndex][row.bucket] += row.amountUzs;
  });

  return weeks.map((item) => ({
    ...item,
    card: Number(item.card.toFixed(2)),
    visa: Number(item.visa.toFixed(2)),
    crypto: Number(item.crypto.toFixed(2))
  }));
};

const mapTxStatus = (status) => {
  if (status === 'success') return 'success';
  if (status === 'processing') return 'processing';
  if (status === 'failed') return 'error';
  return 'pending';
};

const TABLE_PAGE_SIZE = 10;
const DEFAULT_TABLE_FILTERS = {
  search: '',
  status: '',
  sourceCurrency: '',
  from: '',
  to: ''
};

const dateFormatter = new Intl.DateTimeFormat('en-CA');
const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});

const mapTransactionForTable = (tx) => {
  const bucketMeta = PAYMENT_BUCKETS[bucketByCurrency(String(tx?.sourceCurrency || 'USD').toUpperCase())];
  const createdAtDate = new Date(tx?.createdAt);

  return {
    id: `TXN-${String(tx?.id || '').slice(0, 8).toUpperCase()}`,
    date: Number.isNaN(createdAtDate.getTime()) ? '-' : dateFormatter.format(createdAtDate),
    time: Number.isNaN(createdAtDate.getTime()) ? '-' : timeFormatter.format(createdAtDate),
    customer: tx?.recipientIdentifier || 'Unknown recipient',
    amount: Number(tx?.amount || 0),
    currency: String(tx?.sourceCurrency || 'USD').toUpperCase(),
    type: bucketMeta?.typeLabel || 'Payment',
    typeIcon: bucketMeta?.icon || 'Activity',
    status: mapTxStatus(tx?.status),
    paymentMethod: `${String(tx?.sourceCurrency || 'USD').toUpperCase()} Wallet`
  };
};

const MerchantDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [tableFilters, setTableFilters] = useState(DEFAULT_TABLE_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [tableTransactions, setTableTransactions] = useState([]);
  const [tableMeta, setTableMeta] = useState({
    total: 0,
    limit: TABLE_PAGE_SIZE,
    offset: 0,
    hasMore: false
  });
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [overviewResponse, transactionsResponse] = await Promise.all([
          apiClient.get('/wallet/overview', { params: { limit: 50 } }),
          apiClient.get('/transactions', { params: { limit: 100 } })
        ]);

        if (!isMounted) return;
        setOverview(overviewResponse?.data?.data || null);
        setTransactions(Array.isArray(transactionsResponse?.data?.data) ? transactionsResponse.data.data : []);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError?.response?.data?.error || 'Failed to load merchant analytics');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(tableFilters.search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [tableFilters.search]);

  useEffect(() => {
    let isMounted = true;

    const loadTransactionsTable = async () => {
      setTableLoading(true);
      setTableError('');

      try {
        const params = {
          limit: TABLE_PAGE_SIZE,
          offset: (tablePage - 1) * TABLE_PAGE_SIZE
        };

        if (tableFilters.status) {
          params.status = tableFilters.status;
        }
        if (tableFilters.sourceCurrency) {
          params.sourceCurrency = tableFilters.sourceCurrency;
        }
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }
        if (tableFilters.from) {
          params.from = tableFilters.from;
        }
        if (tableFilters.to) {
          params.to = tableFilters.to;
        }

        const response = await apiClient.get('/transactions', { params });
        const rows = Array.isArray(response?.data?.data) ? response.data.data : [];
        const meta = response?.data?.meta || {};

        if (!isMounted) return;

        setTableTransactions(rows.map(mapTransactionForTable));
        setTableMeta({
          total: Number(meta.total || 0),
          limit: Number(meta.limit || TABLE_PAGE_SIZE),
          offset: Number(meta.offset || 0),
          hasMore: Boolean(meta.hasMore)
        });
      } catch (loadError) {
        if (isMounted) {
          setTableError(loadError?.response?.data?.error || 'Failed to load transactions');
        }
      } finally {
        if (isMounted) {
          setTableLoading(false);
        }
      }
    };

    loadTransactionsTable();

    return () => {
      isMounted = false;
    };
  }, [
    tablePage,
    tableFilters.status,
    tableFilters.sourceCurrency,
    tableFilters.from,
    tableFilters.to,
    debouncedSearch
  ]);

  const analytics = useMemo(() => {
    const parsed = transactions
      .map((item) => {
        const createdAtDate = new Date(item?.createdAt);
        if (Number.isNaN(createdAtDate.getTime())) return null;
        const sourceCurrency = String(item?.sourceCurrency || 'USD').toUpperCase();
        const amount = Number(item?.amount || 0);
        const bucket = bucketByCurrency(sourceCurrency);

        return {
          ...item,
          createdAtDate,
          sourceCurrency,
          amount,
          bucket,
          amountUsd: toUsd(amount, sourceCurrency),
          amountUzs: toUzs(amount, sourceCurrency)
        };
      })
      .filter(Boolean);

    const now = new Date();
    const today = startOfLocalDay(now);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const last7DaysStart = new Date(today);
    last7DaysStart.setDate(today.getDate() - 6);

    const previous7DaysStart = new Date(last7DaysStart);
    previous7DaysStart.setDate(last7DaysStart.getDate() - 7);

    const earningsTodayUsd = parsed
      .filter((tx) => dateKey(tx.createdAtDate) === dateKey(today))
      .reduce((sum, tx) => sum + tx.amountUsd, 0);

    const earningsYesterdayUsd = parsed
      .filter((tx) => dateKey(tx.createdAtDate) === dateKey(yesterday))
      .reduce((sum, tx) => sum + tx.amountUsd, 0);

    const txLast7 = parsed.filter((tx) => tx.createdAtDate >= last7DaysStart).length;
    const txPrevious7 = parsed.filter(
      (tx) => tx.createdAtDate >= previous7DaysStart && tx.createdAtDate < last7DaysStart
    ).length;

    const totalBalanceUsd = Number(overview?.summary?.totalBalanceUsd || 0);

    const metrics = [
      {
        title: "Today's Earnings",
        value: Number(earningsTodayUsd.toFixed(2)),
        currency: 'USD',
        change: percentageChange(earningsTodayUsd, earningsYesterdayUsd),
        trend: earningsTodayUsd >= earningsYesterdayUsd ? 'up' : 'down',
        icon: 'TrendingUp',
        iconBg: 'bg-success/10',
        iconColor: 'var(--color-success)'
      },
      {
        title: 'Total Balance',
        value: Number(totalBalanceUsd.toFixed(2)),
        currency: 'USD',
        icon: 'Wallet',
        iconBg: 'bg-primary/10',
        iconColor: 'var(--color-primary)'
      },
      {
        title: 'Payment Volume',
        value: parsed.length,
        currency: 'COUNT',
        change: percentageChange(txLast7, txPrevious7),
        trend: txLast7 >= txPrevious7 ? 'up' : 'down',
        icon: 'Activity',
        iconBg: 'bg-accent/10',
        iconColor: 'var(--color-accent)'
      }
    ];

    const grouped = parsed.reduce(
      (acc, row) => {
        acc[row.bucket].amountUsd += row.amountUsd;
        acc[row.bucket].amountUzs += row.amountUzs;
        acc[row.bucket].count += 1;
        return acc;
      },
      {
        card: { amountUsd: 0, amountUzs: 0, count: 0 },
        visa: { amountUsd: 0, amountUzs: 0, count: 0 },
        crypto: { amountUsd: 0, amountUzs: 0, count: 0 }
      }
    );

    const totalUsd = Object.values(grouped).reduce((sum, item) => sum + item.amountUsd, 0);

    const paymentBreakdown = Object.entries(PAYMENT_BUCKETS).map(([key, meta]) => {
      const source = grouped[key];
      return {
        title: meta.title,
        amount: Number(source.amountUsd.toFixed(2)),
        amountUzs: Number(source.amountUzs.toFixed(2)),
        currency: 'USD',
        percentage: totalUsd > 0 ? Number(((source.amountUsd / totalUsd) * 100).toFixed(1)) : 0,
        icon: meta.icon,
        iconBg: meta.iconBg,
        iconColor: meta.iconColor,
        transactionCount: source.count
      };
    });

    const distributionData = paymentBreakdown.map((item) => ({
      name: item.title,
      value: Number(item.amountUzs.toFixed(2)),
      color:
        item.title === 'Card Payments'
          ? 'var(--color-primary)'
          : item.title === 'International Visa'
            ? 'var(--color-accent)'
            : 'var(--color-warning)'
    }));

    return {
      metrics,
      paymentBreakdown,
      weeklyRevenueData: buildWeeklyRevenue(parsed),
      monthlyRevenueData: buildMonthlyRevenue(parsed),
      distributionData
    };
  }, [overview, transactions]);

  const handleTableFilterChange = (field, value) => {
    setTableFilters((prev) => ({
      ...prev,
      [field]: value
    }));
    setTablePage(1);
  };

  const handleResetTableFilters = () => {
    setTableFilters(DEFAULT_TABLE_FILTERS);
    setTablePage(1);
  };

  const tableTotalPages = Math.max(1, Math.ceil((tableMeta.total || 0) / TABLE_PAGE_SIZE));

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="merchant" />
      <main className="pt-24 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Merchant Dashboard
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Monitor your business performance and manage payments
            </p>
          </div>

          {isLoading && (
            <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground">
              Loading merchant analytics...
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {analytics.metrics?.map((metric) => (
              <MetricCard key={metric.title} {...metric} />
            ))}
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              Payment Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {analytics.paymentBreakdown?.map((payment) => (
                <PaymentBreakdownCard key={payment.title} {...payment} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <Suspense fallback={<ChartSkeleton />}>
              <RevenueChart weeklyData={analytics.weeklyRevenueData} monthlyData={analytics.monthlyRevenueData} />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <PaymentDistributionChart data={analytics.distributionData} />
            </Suspense>
          </div>

          <RecentTransactionsTable
            transactions={tableTransactions}
            isLoading={tableLoading}
            error={tableError}
            filters={tableFilters}
            onFilterChange={handleTableFilterChange}
            onResetFilters={handleResetTableFilters}
            currentPage={tablePage}
            pageSize={TABLE_PAGE_SIZE}
            totalCount={tableMeta.total}
            totalPages={tableTotalPages}
            onPageChange={setTablePage}
          />

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
