import React from 'react';
import Icon from '../../../components/AppIcon';

const NotificationBanner = ({ message, type = 'info' }) => {
  const typeConfig = {
    info: {
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      icon: 'Info',
      iconColor: 'var(--color-primary)'
    },
    success: {
      bg: 'bg-success/10',
      border: 'border-success/20',
      icon: 'CheckCircle2',
      iconColor: 'var(--color-success)'
    },
    warning: {
      bg: 'bg-warning/10',
      border: 'border-warning/20',
      icon: 'AlertCircle',
      iconColor: 'var(--color-warning)'
    }
  };

  const config = typeConfig?.[type] || typeConfig?.info;

  return (
    <div className={`${config?.bg} ${config?.border} border rounded-lg md:rounded-xl p-4 md:p-5 mb-6 md:mb-7 lg:mb-8`}>
      <div className="flex gap-3 md:gap-4">
        <Icon name={config?.icon} size={20} color={config?.iconColor} className="flex-shrink-0 mt-0.5" />
        <p className="text-sm md:text-base text-foreground flex-1">{message}</p>
      </div>
    </div>
  );
};

export default NotificationBanner;