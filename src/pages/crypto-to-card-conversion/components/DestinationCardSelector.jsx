import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const DestinationCardSelector = ({ selectedCard, setSelectedCard, linkedCards }) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="CreditCard" size={20} className="text-primary" />
        <h3 className="text-lg md:text-xl font-semibold text-foreground">Destination Card</h3>
      </div>
      <div className="space-y-3">
        {linkedCards?.map((card) => (
          <button
            key={card?.id}
            onClick={() => setSelectedCard(card?.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-250 text-left ${
              selectedCard === card?.id
                ? 'border-primary bg-primary/5' :'border-border bg-muted/30 hover:border-muted-foreground'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                <Image
                  src={card?.logo}
                  alt={card?.logoAlt}
                  className="w-8 h-8 md:w-10 md:h-10 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm md:text-base font-semibold text-foreground">{card?.type}</span>
                  {card?.isDefault && (
                    <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mb-2">•••• {card?.lastFour}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Icon name="Clock" size={12} />
                    <span>{card?.processingTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="DollarSign" size={12} />
                    <span>Limit: {card?.dailyLimit}</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                {selectedCard === card?.id ? (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Icon name="Check" size={16} color="#FFFFFF" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-border" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 p-4 bg-warning/10 rounded-lg flex items-start gap-3">
        <Icon name="AlertCircle" size={18} className="text-warning flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Processing Time Notice</p>
          <p className="text-xs text-muted-foreground">
            Conversion times may vary based on network congestion and card provider processing schedules.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DestinationCardSelector;