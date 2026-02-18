import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TransactionSummary = ({ transaction }) => {
  return (
    <div className="bg-card rounded-xl md:rounded-2xl border border-border p-6 md:p-7 lg:p-8 mb-6 md:mb-7 lg:mb-8">
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground mb-4 md:mb-5 lg:mb-6">
        Transaction Details
      </h2>
      <div className="space-y-4 md:space-y-5 lg:space-y-6">
        <div className="flex items-center gap-3 md:gap-4 pb-4 md:pb-5 border-b border-border">
          <Image
            src={transaction?.recipient?.avatar}
            alt={transaction?.recipient?.avatarAlt}
            className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm md:text-base lg:text-lg font-medium text-foreground truncate">
              {transaction?.recipient?.name}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {transaction?.recipient?.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Amount Sent</p>
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground data-text">
              {transaction?.amount}
            </p>
          </div>

          <div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Payment Method</p>
            <div className="flex items-center gap-2">
              <Icon name={transaction?.paymentMethod?.icon} size={20} color="var(--color-primary)" />
              <p className="text-sm md:text-base lg:text-lg font-medium text-foreground">
                {transaction?.paymentMethod?.name}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Transaction Fee</p>
            <p className="text-sm md:text-base lg:text-lg font-medium text-foreground data-text">
              {transaction?.fee}
            </p>
          </div>

          <div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Processing Time</p>
            <p className="text-sm md:text-base lg:text-lg font-medium text-foreground">
              {transaction?.processingTime}
            </p>
          </div>

          {transaction?.exchangeRate && (
            <div className="md:col-span-2">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Exchange Rate</p>
              <p className="text-sm md:text-base lg:text-lg font-medium text-foreground data-text">
                {transaction?.exchangeRate}
              </p>
            </div>
          )}

          <div className="md:col-span-2">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Expected Arrival</p>
            <p className="text-sm md:text-base lg:text-lg font-medium text-foreground">
              {transaction?.expectedArrival}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;