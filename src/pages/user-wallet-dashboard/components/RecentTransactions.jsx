import React from 'react';
import Icon from '../../../components/AppIcon';
import StatusIndicatorSystem from '../../../components/ui/StatusIndicatorSystem';

const RecentTransactions = ({ transactions }) => {
  const formatCurrency = (amount, currency) => {
    const normalizedCurrency = String(currency || '').toUpperCase();
    const validCurrencyCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'INR', 'SGD'];

    if (normalizedCurrency === 'UZS') {
      return `${Number(amount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} UZS`;
    }

    if (normalizedCurrency === 'BTC') {
      return `${Number(amount || 0).toFixed(8)} BTC`;
    }

    if (validCurrencyCodes.includes(normalizedCurrency)) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: normalizedCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    }

    return `${Number(amount || 0).toFixed(4)} ${normalizedCurrency}`;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getTransactionIcon = (type) => {
    const icons = {
      send: 'ArrowUpRight',
      receive: 'ArrowDownLeft',
      convert: 'ArrowLeftRight',
      withdrawal: 'Banknote'
    };
    return icons?.[type] || 'Activity';
  };

  const getTransactionColor = (type) => {
    const colors = {
      send: 'text-destructive',
      receive: 'text-success',
      convert: 'text-warning',
      withdrawal: 'text-primary'
    };
    return colors?.[type] || 'text-foreground';
  };

  const getAmountPrefix = (type) => {
    if (type === 'send' || type === 'withdrawal') {
      return '-';
    }

    if (type === 'receive') {
      return '+';
    }

    return '';
  };

  return (
    <div className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-foreground">Recent Transactions</h3>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors duration-250">
          View All
        </button>
      </div>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions?.map((transaction) => (
              <tr key={transaction?.id} className="border-b border-border hover:bg-muted/50 transition-colors duration-250">
                <td className="py-4 px-4">
                  <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getTransactionColor(transaction?.type)}`}>
                    <Icon name={getTransactionIcon(transaction?.type)} size={16} />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm font-medium text-foreground">{transaction?.description}</p>
                  <p className="text-xs text-muted-foreground">{transaction?.method}</p>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-foreground">{formatDate(transaction?.date)}</p>
                </td>
                <td className="py-4 px-4 text-right">
                  <p className={`text-sm font-semibold ${transaction?.type === 'send' || transaction?.type === 'withdrawal' ? 'text-destructive' : transaction?.type === 'receive' ? 'text-success' : 'text-warning'}`}>
                    {getAmountPrefix(transaction?.type)}{formatCurrency(transaction?.amount, transaction?.currency)}
                  </p>
                </td>
                <td className="py-4 px-4 text-center">
                  <StatusIndicatorSystem status={transaction?.status} label={transaction?.status} showIcon={true} size="default" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden space-y-4">
        {transactions?.map((transaction) => (
          <div key={transaction?.id} className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-card flex items-center justify-center ${getTransactionColor(transaction?.type)}`}>
                  <Icon name={getTransactionIcon(transaction?.type)} size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{transaction?.description}</p>
                  <p className="text-xs text-muted-foreground">{transaction?.method}</p>
                </div>
              </div>
              <StatusIndicatorSystem status={transaction?.status} label="" showIcon={true} size="small" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{formatDate(transaction?.date)}</p>
              <p className={`text-base font-bold ${transaction?.type === 'send' || transaction?.type === 'withdrawal' ? 'text-destructive' : transaction?.type === 'receive' ? 'text-success' : 'text-warning'}`}>
                {getAmountPrefix(transaction?.type)}{formatCurrency(transaction?.amount, transaction?.currency)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
