import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import StatusIndicatorSystem from '../../../components/ui/StatusIndicatorSystem';
import Button from '../../../components/ui/Button';

const RecentTransactionsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const transactions = [
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
      paymentMethod: 'Uzcard •••• 4521'
    },
    {
      id: 'TXN-2026-002',
      date: '2026-01-06',
      time: '13:15',
      customer: 'Dilshod Rahimov',
      amount: 1250000,
      currency: 'UZS',
      type: 'Visa Payment',
      typeIcon: 'Globe',
      status: 'success',
      paymentMethod: 'Visa •••• 8932'
    },
    {
      id: 'TXN-2026-003',
      date: '2026-01-06',
      time: '12:48',
      customer: 'Nodira Azimova',
      amount: 320,
      currency: 'USDT',
      type: 'Crypto Payment',
      typeIcon: 'Bitcoin',
      status: 'success',
      paymentMethod: 'USDT Wallet'
    },
    {
      id: 'TXN-2026-004',
      date: '2026-01-06',
      time: '11:22',
      customer: 'Rustam Tursunov',
      amount: 780000,
      currency: 'UZS',
      type: 'Card Payment',
      typeIcon: 'CreditCard',
      status: 'processing',
      paymentMethod: 'Humo •••• 7654'
    },
    {
      id: 'TXN-2026-005',
      date: '2026-01-06',
      time: '10:55',
      customer: 'Malika Sharipova',
      amount: 2100000,
      currency: 'UZS',
      type: 'Visa Payment',
      typeIcon: 'Globe',
      status: 'success',
      paymentMethod: 'Visa •••• 3421'
    },
    {
      id: 'TXN-2026-006',
      date: '2026-01-06',
      time: '09:30',
      customer: 'Jamshid Umarov',
      amount: 150,
      currency: 'USDT',
      type: 'Crypto Payment',
      typeIcon: 'Bitcoin',
      status: 'success',
      paymentMethod: 'USDT Wallet'
    },
    {
      id: 'TXN-2026-007',
      date: '2026-01-05',
      time: '18:45',
      customer: 'Sevara Abdullayeva',
      amount: 920000,
      currency: 'UZS',
      type: 'Card Payment',
      typeIcon: 'CreditCard',
      status: 'success',
      paymentMethod: 'Uzcard •••• 9876'
    },
    {
      id: 'TXN-2026-008',
      date: '2026-01-05',
      time: '17:20',
      customer: 'Bobur Yusupov',
      amount: 1850000,
      currency: 'UZS',
      type: 'Visa Payment',
      typeIcon: 'Globe',
      status: 'error',
      paymentMethod: 'Visa •••• 5432'
    }
  ];

  const totalPages = Math.ceil(transactions?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions?.slice(startIndex, endIndex);

  const formatAmount = (amount, currency) => {
    if (currency === 'UZS') {
      return `${new Intl.NumberFormat('en-US')?.format(amount)} UZS`;
    }
    return `${amount} ${currency}`;
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-6 md:p-8 border-b border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg md:text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            Recent Transactions
          </h3>
          <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
            Export
          </Button>
        </div>
      </div>
      {/* Desktop Table View */}
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
                  <StatusIndicatorSystem status={transaction?.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
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
              <StatusIndicatorSystem status={transaction?.status} size="small" />
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
      {/* Pagination */}
      <div className="p-4 md:p-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, transactions?.length)} of {transactions?.length} transactions
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="ChevronLeft"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          />
        </div>
      </div>
    </div>
  );
};

export default RecentTransactionsTable;