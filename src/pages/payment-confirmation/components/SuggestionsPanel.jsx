import React from 'react';
import Icon from '../../../components/AppIcon';


const SuggestionsPanel = ({ suggestions, onSuggestionClick }) => {
  return (
    <div className="bg-card rounded-xl md:rounded-2xl border border-border p-6 md:p-7 lg:p-8">
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground mb-4 md:mb-5 lg:mb-6">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
        {suggestions?.map((suggestion) => (
          <button
            key={suggestion?.id}
            onClick={() => onSuggestionClick(suggestion?.action)}
            className="flex items-start gap-3 md:gap-4 p-4 md:p-5 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-250 text-left"
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${suggestion?.iconBg}`}>
              <Icon name={suggestion?.icon} size={20} color={suggestion?.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base lg:text-lg font-medium text-foreground mb-1">
                {suggestion?.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {suggestion?.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionsPanel;