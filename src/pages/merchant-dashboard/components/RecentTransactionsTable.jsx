import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import StatusIndicatorSystem from '../../../components/ui/StatusIndicatorSystem';
import Button from '../../../components/ui/Button';

const FALLBACK_TRANSACTIONS = [
  {
    id: 'TXN-2026-001',
    date: '2026-01-06',
    time: '14:32',
    customer: 'Alisher Karimov',
    amount: 450000,
    currency: 'UZS',
    type: 'Card Payment',
    typeIcon: 'CreditCard',
    status: 'success',
    paymentMethod: 'Uzcard **** 4521'
  }
];

const CRYPTO_CURRENCIES = new Set(['USDT', 'BTC', 'ETH']);
const STATUSES = new Set(['success', 'warning', 'error', 'pending', 'active', 'inactive', 'processing']);

const formatAmount = (amount, currency) => {
  const numericAmount = Number(amount || 0);
  if (currency === 'UZS') {
    return `${new Intl.NumberFormat('en-US')?.format(numericAmount)} UZS`;
  }
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
  }

  if (CRYPTO_CURRENCIES.has(currency)) {
    const precision = currency === 'USDT' ? 2 : 8;
    return `${numericAmount.toFixed(precision)} ${currency}`;
  }

  return `${new Intl.NumberFormat('en-US')?.format(numericAmount)} ${currency}`;
};

const RecentTransactionsTable = ({ transactions = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const safeTransactions = useMemo(
    () => (transactions.length > 0 ? transactions : FALLBACK_TRANSACTIONS),
    [transactions]
  );

  const totalPages = Math.max(1, Math.ceil(safeTransactions?.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = safeTransactions?.slice(startIndex, endIndex);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-6 md:p-8 border-b border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg md:text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            Recent Transactions
          </h3>
          <Button variant="outline" size="sm" iconName="Download" iconPosition="left" disabled>
            Export
          </Button>
        </div>
      </div>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentTransactions?.map((transaction) => (
              <tr key={transaction?.id} className="hover:bg-muted/50 transition-colors duration-250">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-foreground" style={{ fontFamily: 'var(--font-data)' }}>
                    {transaction?.id}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{transaction?.date}</div>
                  <div className="text-xs text-muted-foreground">{transaction?.time}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-foreground">{transaction?.customer}</div>
                  <div className="text-xs text-muted-foreground">{transaction?.paymentMethod}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-data)' }}>
                    {formatAmount(transaction?.amount, transaction?.currency)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Icon name={transaction?.typeIcon} size={16} color="var(--color-muted-foreground)" />
                    <span className="text-sm text-foreground">{transaction?.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusIndicatorSystem
                    status={STATUSES.has(transaction?.status) ? transaction?.status : 'pending'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden divide-y divide-border">
        {currentTransactions?.map((transaction) => (
          <div key={transaction?.id} className="p-4 hover:bg-muted/50 transition-colors duration-250">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-foreground mb-1" style={{ fontFamily: 'var(--font-data)' }}>
                  {transaction?.id}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction?.date} at {transaction?.time}
                </p>
              </div>
              <StatusIndicatorSystem
                status={STATUSES.has(transaction?.status) ? transaction?.status : 'pending'}
                size="small"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Customer</span>
                <span className="text-sm font-medium text-foreground">{transaction?.customer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Amount</span>
                <span className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-data)' }}>
                  {formatAmount(transaction?.amount, transaction?.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Type</span>
                <div className="flex items-center gap-2">
                  <Icon name={transaction?.typeIcon} size={14} color="var(--color-muted-foreground)" />
                  <span className="text-sm text-foreground">{transaction?.type}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Method</span>
                <span className="text-sm text-foreground">{transaction?.paymentMethod}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 md:p-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, safeTransactions?.length)} of {safeTransactions?.length}{' '}
          transactions
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="ChevronLeft"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          />
          {Array.from({ length: totalPages }, (_, i) => i + 1)?.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            iconName="ChevronRight"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          />
        </div>
      </div>
    </div>
  );
};

export default RecentTransactionsTable;
