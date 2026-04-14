import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SUPPORTED_CURRENCIES = [
  { value: 'UZS', label: 'UZS (Uzbek Som)' },
  { value: 'USDT', label: 'USDT (Tether)' },
  { value: 'BTC', label: 'BTC (Bitcoin)' }
];

const formatBalance = (currency, balance) => {
  if (currency === 'BTC') {
    return `${Number(balance || 0).toFixed(8)} BTC`;
  }

  if (currency === 'UZS') {
    return `${Number(balance || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} UZS`;
  }

  return `${Number(balance || 0).toFixed(2)} ${currency}`;
};

const ConversionCalculator = ({
  fromCurrency,
  setFromCurrency,
  fromAmount,
  setFromAmount,
  toCurrency,
  setToCurrency,
  toAmount,
  walletBalances,
  conversionRate,
  onSwapDirection
}) => {
  const buildOption = (item) => ({
    ...item,
    description: `Balance: ${formatBalance(item.value, walletBalances?.[item.value])}`
  });

  return (
    <div className="bg-card rounded-xl border border-border p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">Demo Exchange Calculator</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="Radio" size={16} />
          <span>Live Rates</span>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 md:p-6">
          <label className="text-sm font-medium text-muted-foreground mb-3 block">From</label>
          <Select
            options={SUPPORTED_CURRENCIES.filter((item) => item.value !== toCurrency).map(buildOption)}
            value={fromCurrency}
            onChange={setFromCurrency}
            placeholder="Select source currency"
            className="mb-4"
          />
          <Input
            type="number"
            value={fromAmount}
            onChange={(e) => setFromAmount(e?.target?.value)}
            placeholder="0.00"
            className="text-2xl md:text-3xl font-semibold"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-muted-foreground">Available Balance</span>
            <span className="text-sm font-medium text-foreground">
              {formatBalance(fromCurrency, walletBalances?.[fromCurrency])}
            </span>
          </div>
        </div>

        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={onSwapDirection}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-250 hover:scale-110 active:scale-95"
            aria-label="Swap currencies"
          >
            <Icon name="ArrowDownUp" size={20} />
          </button>
        </div>

        <div className="bg-accent/10 rounded-lg p-4 md:p-6">
          <label className="text-sm font-medium text-muted-foreground mb-3 block">To</label>
          <Select
            options={SUPPORTED_CURRENCIES.filter((item) => item.value !== fromCurrency).map(buildOption)}
            value={toCurrency}
            onChange={setToCurrency}
            placeholder="Select destination currency"
            className="mb-4"
          />
          <Input
            type="number"
            value={toAmount}
            onChange={() => {}}
            placeholder="0.00"
            disabled
            className="text-2xl md:text-3xl font-semibold"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-muted-foreground">Estimated Rate</span>
            <span className="text-sm font-medium text-accent">
              {conversionRate ? `1 ${fromCurrency} = ${conversionRate} ${toCurrency}` : 'Waiting for quote'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionCalculator;
