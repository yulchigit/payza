import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import StatusIndicatorSystem from '../../../components/ui/StatusIndicatorSystem';

const PaymentSourceSelector = ({ selectedSource, onSourceSelect, error, paymentSources = [] }) => {
  const formatBalance = (balance, currency) => {
    if (currency === 'BTC') {
      return `${balance?.toFixed(8)} BTC`;
    } else if (currency === 'USDT') {
      return `${balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
    } else if (currency === 'USD') {
      return `$${balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `${balance?.toLocaleString('en-US')} UZS`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Payment Source <span className="text-error">*</span>
        </label>
        {error &&
        <p className="text-xs text-error">{error}</p>
        }
      </div>
      <div className="grid grid-cols-1 gap-3">
        {paymentSources?.map((source) =>
        <button
          key={source?.id}
          onClick={() => onSourceSelect(source)}
          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
          selectedSource?.id === source?.id ?
          'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'}`
          }>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <Image
                src={source?.icon}
                alt={source?.iconAlt}
                className="w-full h-full object-cover" />

              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-foreground">
                    {source?.name}
                  </h4>
                  <StatusIndicatorSystem status={source?.status} showIcon={false} size="small" />
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {source?.type === 'card' ? source?.number : source?.address}
                </p>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {formatBalance(source?.balance, source?.currency)}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="Percent" size={12} />
                      {source?.fee}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={12} />
                      {source?.processingTime}
                    </span>
                  </div>
                </div>
              </div>

              {selectedSource?.id === source?.id &&
            <Icon name="CheckCircle2" size={20} className="text-primary flex-shrink-0" />
            }
            </div>
          </button>
        )}
      </div>
      {paymentSources?.length === 0 && (
        <div className="border border-border rounded-lg p-4 text-sm text-muted-foreground bg-card">
          No active wallets found. Add funds or create wallets first.
        </div>
      )}
      <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
        <Icon name="AlertCircle" size={16} className="text-warning flex-shrink-0 mt-0.5" />
        <p className="text-xs text-warning">
          International transfers and crypto transactions may incur additional fees and longer processing times.
        </p>
      </div>
    </div>);

};

export default PaymentSourceSelector;
