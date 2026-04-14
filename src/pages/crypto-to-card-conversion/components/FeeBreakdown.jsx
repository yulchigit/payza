import React from 'react';
import Icon from '../../../components/AppIcon';

const formatAmount = (value, currency) => {
  const amount = Number(value || 0);
  if (currency === 'BTC') {
    return `${amount.toFixed(8)} BTC`;
  }
  if (currency === 'UZS') {
    return `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} UZS`;
  }
  return `${amount.toFixed(4)} ${currency}`;
};

const FeeBreakdown = ({ quote }) => {
  const sourceCurrency = quote?.fromCurrency || 'UZS';
  const targetCurrency = quote?.toCurrency || 'USDT';
  const feePercent = Number(quote?.feeBps || 0) / 100;
  const spreadPercent = Number(quote?.spreadBps || 0) / 100;

  return (
    <div className="bg-card rounded-xl border border-border p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="Receipt" size={20} className="text-primary" />
        <h3 className="text-lg md:text-xl font-semibold text-foreground">Fee Breakdown</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Percent" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Platform Fee</span>
            </div>
            <p className="text-xs text-muted-foreground">{feePercent.toFixed(2)}% of the source amount</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{formatAmount(quote?.feeAmountSource, sourceCurrency)}</p>
            <p className="text-xs text-muted-foreground">charged before settlement</p>
          </div>
        </div>

        <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="CandlestickChart" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Market Spread</span>
            </div>
            <p className="text-xs text-muted-foreground">{spreadPercent.toFixed(2)}% protective spread on the quote</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{formatAmount(quote?.spreadImpactTarget, targetCurrency)}</p>
            <p className="text-xs text-muted-foreground">embedded into the rate</p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Reference Output</span>
            <span className="text-sm font-semibold text-foreground">{formatAmount(quote?.referenceOutput, targetCurrency)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-foreground">Net Receive</span>
            <span className="text-lg font-bold text-accent">{formatAmount(quote?.netOutput, targetCurrency)}</span>
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-4 flex items-start gap-3">
          <Icon name="Info" size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Investor Demo Transparency</p>
            <p className="text-xs text-muted-foreground">
              Pricing is based on Binance public market data and CBU FX references, then adjusted with the demo fee and spread configured for PayZa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeBreakdown;
