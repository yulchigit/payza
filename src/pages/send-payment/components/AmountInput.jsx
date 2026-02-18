import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AmountInput = ({ amount, currency, onAmountChange, onCurrencyChange, error }) => {
  const [convertedAmounts, setConvertedAmounts] = useState({});

  const currencyOptions = [
    { value: 'UZS', label: 'UZS - Uzbek Som' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'USDT', label: 'USDT - Tether' },
    { value: 'BTC', label: 'BTC - Bitcoin' }
  ];

  const exchangeRates = {
    UZS: 1,
    USD: 12750,
    USDT: 12750,
    BTC: 542625000
  };

  useEffect(() => {
    if (amount && !isNaN(amount)) {
      const baseAmount = parseFloat(amount) * exchangeRates?.[currency];
      const converted = {};
      
      Object.keys(exchangeRates)?.forEach(curr => {
        if (curr !== currency) {
          converted[curr] = (baseAmount / exchangeRates?.[curr])?.toFixed(curr === 'BTC' ? 8 : 2);
        }
      });
      
      setConvertedAmounts(converted);
    } else {
      setConvertedAmounts({});
    }
  }, [amount, currency]);

  const formatCurrency = (value, curr) => {
    if (curr === 'BTC') {
      return `${value} BTC`;
    } else if (curr === 'USDT') {
      return `${value} USDT`;
    } else if (curr === 'USD') {
      return `$${value}`;
    } else {
      return `${value} UZS`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => onAmountChange(e?.target?.value)}
            error={error}
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <Select
            label="Currency"
            options={currencyOptions}
            value={currency}
            onChange={onCurrencyChange}
            required
          />
        </div>
      </div>
      {amount && Object.keys(convertedAmounts)?.length > 0 && (
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ArrowLeftRight" size={16} className="text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">Conversion Rates</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(convertedAmounts)?.map(([curr, value]) => (
              <div key={curr} className="flex items-center justify-between p-3 bg-card rounded-lg">
                <span className="text-xs text-muted-foreground">{curr}</span>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(value, curr)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-start gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg">
        <Icon name="Info" size={16} className="text-accent flex-shrink-0 mt-0.5" />
        <p className="text-xs text-accent">
          Exchange rates are updated in real-time. Final rate will be locked at confirmation.
        </p>
      </div>
    </div>
  );
};

export default AmountInput;