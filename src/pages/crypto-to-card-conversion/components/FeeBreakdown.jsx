import React from 'react';
import Icon from '../../../components/AppIcon';

const FeeBreakdown = ({ cryptoType, cryptoAmount, fiatCurrency, fiatAmount }) => {
  const networkFee = cryptoType === 'BTC' ? 0.0001 : 0.5;
  const networkFeeUSD = cryptoType === 'BTC' ? networkFee * 45000 : networkFee;
  const platformFeePercent = 0.5;
  const platformFee = parseFloat(cryptoAmount || 0) * (platformFeePercent / 100);
  const platformFeeUSD = platformFee * (cryptoType === 'BTC' ? 45000 : 1);
  const totalFees = networkFeeUSD + platformFeeUSD;
  const netProceeds = parseFloat(fiatAmount || 0) - (totalFees * (fiatCurrency === 'UZS' ? 12650 : 1));

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
              <Icon name="Network" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Network Fee</span>
            </div>
            <p className="text-xs text-muted-foreground">Blockchain transaction cost</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{networkFee} {cryptoType}</p>
            <p className="text-xs text-muted-foreground">≈ ${networkFeeUSD?.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Percent" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Platform Fee</span>
            </div>
            <p className="text-xs text-muted-foreground">{platformFeePercent}% of conversion amount</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{platformFee?.toFixed(4)} {cryptoType}</p>
            <p className="text-xs text-muted-foreground">≈ ${platformFeeUSD?.toFixed(2)}</p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Fees</span>
            <span className="text-sm font-semibold text-foreground">≈ ${totalFees?.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-foreground">Net Proceeds</span>
            <span className="text-lg font-bold text-accent">
              {netProceeds?.toLocaleString()} {fiatCurrency}
            </span>
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-4 flex items-start gap-3">
          <Icon name="Info" size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Fee Transparency</p>
            <p className="text-xs text-muted-foreground">
              All fees are clearly displayed before confirmation. Network fees may vary based on blockchain congestion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeBreakdown;