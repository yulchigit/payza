import React from 'react';
import Icon from '../../../components/AppIcon';

const formatPrice = (market) => {
  const price = Number(market?.lastPrice || 0);
  if (market?.quoteCurrency === 'UZS') {
    return `${price.toLocaleString('en-US', { maximumFractionDigits: 2 })} UZS`;
  }
  return `${price.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${market?.quoteCurrency}`;
};

const FeaturedMarketsPanel = ({ markets = [] }) => {
  return (
    <div className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="Activity" size={20} className="text-primary" />
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground">Featured Markets</h3>
          <p className="text-sm text-muted-foreground">CoinGecko and CBU reference prices</p>
        </div>
      </div>

      <div className="space-y-3">
        {markets.map((market) => {
          const change = Number(market?.priceChangePercent || 0);
          const isPositive = change >= 0;

          return (
            <div key={market?.symbol} className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{market?.symbol}</p>
                  <p className="text-xs text-muted-foreground">{market?.source}</p>
                </div>
                <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  <Icon name={isPositive ? 'TrendingUp' : 'TrendingDown'} size={12} />
                  <span>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xl font-bold text-foreground">{formatPrice(market)}</p>
                  <p className="text-xs text-muted-foreground">
                    Open {Number(market?.openPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 4 })}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>High {Number(market?.highPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 4 })}</p>
                  <p>Low {Number(market?.lowPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 4 })}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedMarketsPanel;
