import React from 'react';
import Icon from '../../../components/AppIcon';
import StatusIndicatorSystem from '../../../components/ui/StatusIndicatorSystem';

const TransactionTimeline = ({ steps }) => {
  return (
    <div className="bg-card rounded-xl md:rounded-2xl border border-border p-6 md:p-7 lg:p-8 mb-6 md:mb-7 lg:mb-8">
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground mb-4 md:mb-5 lg:mb-6">
        Transaction Status
      </h2>
      <div className="space-y-4 md:space-y-5 lg:space-y-6">
        {steps?.map((step, index) => (
          <div key={step?.id} className="flex gap-3 md:gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-250 ${
                  step?.completed
                    ? 'bg-success/10'
                    : step?.active
                    ? 'bg-primary/10' :'bg-muted'
                }`}
              >
                <Icon
                  name={step?.completed ? 'Check' : step?.icon}
                  size={20}
                  color={
                    step?.completed
                      ? 'var(--color-success)'
                      : step?.active
                      ? 'var(--color-primary)'
                      : 'var(--color-muted-foreground)'
                  }
                />
              </div>
              {index < steps?.length - 1 && (
                <div
                  className={`w-0.5 h-12 md:h-14 lg:h-16 mt-2 transition-250 ${
                    step?.completed ? 'bg-success' : 'bg-border'
                  }`}
                />
              )}
            </div>

            <div className="flex-1 pb-4 md:pb-5">
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <h3 className="text-sm md:text-base lg:text-lg font-medium text-foreground">
                  {step?.title}
                </h3>
                <StatusIndicatorSystem
                  status={step?.completed ? 'success' : step?.active ? 'processing' : 'pending'}
                  label={step?.completed ? 'Completed' : step?.active ? 'In Progress' : 'Pending'}
                  size="small"
                />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">
                {step?.description}
              </p>
              <p className="text-xs text-muted-foreground data-text">{step?.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionTimeline;