import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const ConversionSettings = ({ 
  slippageTolerance, 
  setSlippageTolerance,
  minAmount,
  maxAmount,
  cryptoType,
  fiatCurrency
}) => {
  const slippagePresets = [0.1, 0.5, 1.0, 2.0];

  return (
    <div className="bg-card rounded-xl border border-border p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="Settings" size={20} className="text-primary" />
        <h3 className="text-lg md:text-xl font-semibold text-foreground">Conversion Settings</h3>
      </div>
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">
            Slippage Tolerance
          </label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {slippagePresets?.map((preset) => (
              <button
                key={preset}
                onClick={() => setSlippageTolerance(preset)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-250 ${
                  slippageTolerance === preset
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>
          <Input
            type="number"
            value={slippageTolerance}
            onChange={(e) => setSlippageTolerance(parseFloat(e?.target?.value))}
            placeholder="Custom %"
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Maximum price difference you're willing to accept during conversion
          </p>
        </div>

        <div className="border-t border-border pt-6">
          <h4 className="text-sm font-medium text-foreground mb-4">Conversion Limits</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="ArrowDown" size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Minimum</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {minAmount} {cryptoType}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="ArrowUp" size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Maximum</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {maxAmount} {cryptoType}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-accent/10 rounded-lg p-4 flex items-start gap-3">
          <Icon name="Shield" size={18} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Slippage Protection</p>
            <p className="text-xs text-muted-foreground">
              Your conversion will be cancelled if the rate changes beyond your tolerance level, protecting you from unfavorable rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionSettings;