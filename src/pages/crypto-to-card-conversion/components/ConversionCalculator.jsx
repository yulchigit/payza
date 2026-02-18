import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ConversionCalculator = ({ 
  cryptoType, 
  setCryptoType, 
  cryptoAmount, 
  setCryptoAmount,
  fiatCurrency,
  setFiatCurrency,
  fiatAmount,
  cryptoBalances,
  exchangeRates,
  onSwap
}) => {
  const cryptoOptions = [
    { value: 'USDT', label: 'USDT (Tether)', description: `Balance: ${cryptoBalances?.USDT} USDT` },
    { value: 'BTC', label: 'BTC (Bitcoin)', description: `Balance: ${cryptoBalances?.BTC} BTC` }
  ];

  const fiatOptions = [
    { value: 'UZS', label: 'UZS (Uzbek Som)' },
    { value: 'USD', label: 'USD (US Dollar)' }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">Conversion Calculator</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="TrendingUp" size={16} />
          <span>Live Rates</span>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 md:p-6">
          <label className="text-sm font-medium text-muted-foreground mb-3 block">From (Crypto)</label>
          <Select
            options={cryptoOptions}
            value={cryptoType}
            onChange={setCryptoType}
            placeholder="Select cryptocurrency"
            className="mb-4"
          />
          <Input
            type="number"
            value={cryptoAmount}
            onChange={(e) => setCryptoAmount(e?.target?.value)}
            placeholder="0.00"
            className="text-2xl md:text-3xl font-semibold"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-muted-foreground">Available Balance</span>
            <span className="text-sm font-medium text-foreground">
              {cryptoBalances?.[cryptoType]} {cryptoType}
            </span>
          </div>
        </div>

        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={onSwap}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-250 hover:scale-110 active:scale-95"
            aria-label="Swap currencies"
          >
            <Icon name="ArrowDownUp" size={20} />
          </button>
        </div>

        <div className="bg-accent/10 rounded-lg p-4 md:p-6">
          <label className="text-sm font-medium text-muted-foreground mb-3 block">To (Fiat Currency)</label>
          <Select
            options={fiatOptions}
            value={fiatCurrency}
            onChange={setFiatCurrency}
            placeholder="Select currency"
            className="mb-4"
          />
          <Input
            type="number"
            value={fiatAmount}
            onChange={() => {}}
            placeholder="0.00"
            disabled
            className="text-2xl md:text-3xl font-semibold"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-muted-foreground">Exchange Rate</span>
            <span className="text-sm font-medium text-accent">
              1 {cryptoType} = {exchangeRates?.[cryptoType]?.[fiatCurrency]?.toLocaleString()} {fiatCurrency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionCalculator;