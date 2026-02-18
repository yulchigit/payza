import React from 'react';
import Icon from '../AppIcon';

const StatusIndicatorSystem = ({ 
  status = 'pending', 
  label = '', 
  showIcon = true,
  size = 'default'
}) => {
  const statusConfig = {
    success: {
      icon: 'CheckCircle2',
      className: 'status-indicator success'
    },
    warning: {
      icon: 'AlertCircle',
      className: 'status-indicator warning'
    },
    error: {
      icon: 'XCircle',
      className: 'status-indicator error'
    },
    pending: {
      icon: 'Clock',
      className: 'status-indicator pending'
    },
    active: {
      icon: 'CheckCircle2',
      className: 'status-indicator success'
    },
    inactive: {
      icon: 'Circle',
      className: 'status-indicator pending'
    },
    processing: {
      icon: 'Loader2',
      className: 'status-indicator warning'
    }
  };

  const config = statusConfig?.[status] || statusConfig?.pending;
  const iconSize = size === 'small' ? 12 : 14;

  return (
    <span className={config?.className}>
      {showIcon && <Icon name={config?.icon} size={iconSize} />}
      <span>{label || status?.charAt(0)?.toUpperCase() + status?.slice(1)}</span>
    </span>
  );
};

export default StatusIndicatorSystem;