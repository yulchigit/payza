import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import StatusIndicatorSystem from '../../../components/ui/StatusIndicatorSystem';

const PaymentSourceSelector = ({ selectedSource, onSourceSelect, error }) => {
  const paymentSources = [
  {
    id: 'uzcard-1',
    type: 'card',
    name: 'Uzcard',
    number: '**** 4532',
    balance: 2450000,
    currency: 'UZS',
    icon: "https://img.rocket.new/generatedImages/rocket_gen_img_1071d6dc0-1766732074521.png",
    iconAlt: 'Blue and white credit card with chip showing modern banking design',
    fee: '0%',
    processingTime: 'Instant',
    status: 'active'
  },
  {
    id: 'humo-1',
    type: 'card',
    name: 'Humo',
    number: '**** 7821',
    balance: 1850000,
    currency: 'UZS',
    icon: "https://images.unsplash.com/photo-1640545232493-9a9b5c88ede4",
    iconAlt: 'Green credit card with gold chip on dark surface representing secure payment',
    fee: '0%',
    processingTime: 'Instant',
    status: 'active'
  },
  {
    id: 'visa-1',
    type: 'card',
    name: 'Visa',
    number: '**** 9234',
    balance: 1250,
    currency: 'USD',
    icon: "https://img.rocket.new/generatedImages/rocket_gen_img_1c4fcaeb5-1767226452374.png",
    iconAlt: 'Silver Visa credit card with holographic security features on white background',
    fee: '2.5%',
    processingTime: '1-2 business days',
    status: 'active'
  },
  {
    id: 'usdt-1',
    type: 'crypto',
    name: 'USDT Wallet',
    address: '0x742d...3f4a',
    balance: 3420.50,
    currency: 'USDT',
    icon: "https://images.unsplash.com/photo-1626163015484-81fc7e3b90d8",
    iconAlt: 'Green Tether USDT cryptocurrency coin with T symbol on digital blockchain background',
    fee: '1%',
    processingTime: '5-10 minutes',
    status: 'active'
  },
  {
    id: 'btc-1',
    type: 'crypto',
    name: 'Bitcoin Wallet',
    address: '1A1z...P1eP',
    balance: 0.0845,
    currency: 'BTC',
    icon: "https://img.rocket.new/generatedImages/rocket_gen_img_1b4fd9e83-1765179231133.png",
    iconAlt: 'Golden Bitcoin cryptocurrency coin with B symbol on dark metallic surface',
    fee: '0.5%',
    processingTime: '10-30 minutes',
    status: 'active'
  }];


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
      <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
        <Icon name="AlertCircle" size={16} className="text-warning flex-shrink-0 mt-0.5" />
        <p className="text-xs text-warning">
          International transfers and crypto transactions may incur additional fees and longer processing times.
        </p>
      </div>
    </div>);

};

export default PaymentSourceSelector;