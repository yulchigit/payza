import React from 'react';
import Icon from '../../../components/AppIcon';

const SuccessHeader = ({ transactionId }) => {
  return (
    <div className="flex flex-col items-center text-center mb-8 md:mb-10 lg:mb-12">
      <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-success/10 flex items-center justify-center mb-4 md:mb-5 lg:mb-6">
        <Icon name="CheckCircle2" size={48} color="var(--color-success)" className="md:w-14 md:h-14 lg:w-16 lg:h-16" />
      </div>
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 md:mb-3">
        Payment Sent Successfully
      </h1>
      <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-md">
        Your payment has been processed and is on its way to the recipient
      </p>
      <div className="mt-4 md:mt-5 lg:mt-6 flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
        <span className="text-xs md:text-sm text-muted-foreground">Transaction ID:</span>
        <span className="text-xs md:text-sm font-mono text-foreground">{transactionId}</span>
        <button
          onClick={() => navigator.clipboard?.writeText(transactionId)}
          className="ml-2 p-1 hover:bg-background rounded transition-250"
          aria-label="Copy transaction ID"
        >
          <Icon name="Copy" size={16} color="var(--color-muted-foreground)" />
        </button>
      </div>
    </div>
  );
};

export default SuccessHeader;