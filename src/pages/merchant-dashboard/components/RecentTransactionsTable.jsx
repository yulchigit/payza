import React from "react";
import Icon from "../../../components/AppIcon";
import StatusIndicatorSystem from "../../../components/ui/StatusIndicatorSystem";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const CRYPTO_CURRENCIES = new Set(["USDT", "BTC", "ETH"]);
const STATUSES = new Set(["success", "warning", "error", "pending", "active", "inactive", "processing"]);

const DEFAULT_FILTERS = {
  search: "",
  status: "",
  sourceCurrency: "",
  from: "",
  to: ""
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "success", label: "Success" },
  { value: "processing", label: "Processing" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" }
];

const CURRENCY_OPTIONS = [
  { value: "", label: "All currencies" },
  { value: "UZS", label: "UZS" },
  { value: "USD", label: "USD" },
  { value: "USDT", label: "USDT" },
  { value: "BTC", label: "BTC" },
  { value: "ETH", label: "ETH" }
];

const formatAmount = (amount, currency) => {
  const numericAmount = Number(amount || 0);
  if (currency === "UZS") {
    return `${new Intl.NumberFormat("en-US")?.format(numericAmount)} UZS`;
  }
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
  }

  if (CRYPTO_CURRENCIES.has(currency)) {
    const precision = currency === "USDT" ? 2 : 8;
    return `${numericAmount.toFixed(precision)} ${currency}`;
  }

  return `${new Intl.NumberFormat("en-US")?.format(numericAmount)} ${currency}`;
};

const RecentTransactionsTable = ({
  transactions = [],
  isLoading = false,
  error = "",
  filters = DEFAULT_FILTERS,
  onFilterChange,
  onResetFilters,
  currentPage = 1,
  pageSize = 10,
  totalCount = 0,
  totalPages = 1,
  onPageChange
}) => {
  const safeFilters = { ...DEFAULT_FILTERS, ...filters };
  const hasRows = transactions.length > 0;
  const startIndex = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = totalCount > 0 ? Math.min((currentPage - 1) * pageSize + transactions.length, totalCount) : 0;

  const handleFieldChange = (field) => (event) => {
    const rawValue = event?.target?.value || "";
    const value = field === "search" ? rawValue.slice(0, 120) : rawValue;
    onFilterChange?.(field, value);
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-6 md:p-8 border-b border-border space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg md:text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Recent Transactions
          </h3>
          <Button variant="outline" size="sm" iconName="Download" iconPosition="left" disabled>
            Export
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          <Input
            label="Search"
            placeholder="Recipient"
            value={safeFilters.search}
            onChange={handleFieldChange("search")}
          />

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Status</span>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={safeFilters.status}
              onChange={handleFieldChange("status")}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Currency</span>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={safeFilters.sourceCurrency}
              onChange={handleFieldChange("sourceCurrency")}
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Input label="From" type="date" value={safeFilters.from} onChange={handleFieldChange("from")} />
          <Input label="To" type="date" value={safeFilters.to} onChange={handleFieldChange("to")} />
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" iconName="RotateCcw" onClick={onResetFilters}>
            Reset filters
          </Button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-4 border-b border-border text-sm text-destructive bg-destructive/10">
          {error}
        </div>
      )}

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
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-sm text-muted-foreground">
                  Loading transactions...
                </td>
              </tr>
            )}

            {!isLoading &&
              hasRows &&
              transactions.map((transaction) => (
                <tr key={transaction?.id} className="hover:bg-muted/50 transition-colors duration-250">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-foreground" style={{ fontFamily: "var(--font-data)" }}>
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
                    <span className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-data)" }}>
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
                    <StatusIndicatorSystem status={STATUSES.has(transaction?.status) ? transaction?.status : "pending"} />
                  </td>
                </tr>
              ))}

            {!isLoading && !hasRows && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-sm text-muted-foreground">
                  No transactions matched your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden divide-y divide-border">
        {isLoading && <div className="p-4 text-sm text-muted-foreground">Loading transactions...</div>}

        {!isLoading &&
          hasRows &&
          transactions.map((transaction) => (
            <div key={transaction?.id} className="p-4 hover:bg-muted/50 transition-colors duration-250">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1" style={{ fontFamily: "var(--font-data)" }}>
                    {transaction?.id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction?.date} at {transaction?.time}
                  </p>
                </div>
                <StatusIndicatorSystem
                  status={STATUSES.has(transaction?.status) ? transaction?.status : "pending"}
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
                  <span className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-data)" }}>
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
              </div>
            </div>
          ))}

        {!isLoading && !hasRows && <div className="p-4 text-sm text-muted-foreground">No transactions found.</div>}
      </div>

      <div className="p-4 md:p-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {totalCount > 0
            ? `Showing ${startIndex} to ${endIndex} of ${totalCount} transactions`
            : "Showing 0 transactions"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="ChevronLeft"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
          />
          <span className="text-sm text-muted-foreground px-2">
            Page {currentPage} / {Math.max(1, totalPages)}
          </span>
          <Button
            variant="outline"
            size="sm"
            iconName="ChevronRight"
            disabled={currentPage >= Math.max(1, totalPages) || isLoading}
            onClick={() => onPageChange?.(Math.min(Math.max(1, totalPages), currentPage + 1))}
          />
        </div>
      </div>
    </div>
  );
};

export default RecentTransactionsTable;
