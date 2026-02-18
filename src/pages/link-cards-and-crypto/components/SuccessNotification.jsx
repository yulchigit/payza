import React, { useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SuccessNotification = ({ isVisible, onClose, message, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const config = {
    success: {
      icon: 'CheckCircle2',
      iconColor: 'var(--color-success)',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20'
    },
    error: {
      icon: 'XCircle',
      iconColor: 'var(--color-error)',
      bgColor: 'bg-error/10',
      borderColor: 'border-error/20'
    },
    warning: {
      icon: 'AlertCircle',
      iconColor: 'var(--color-warning)',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20'
    }
  };

  const currentConfig = config?.[type] || config?.success;

  return (
    <div className="fixed top-20 right-4 z-[300] animate-in slide-in-from-right duration-250">
      <div className={`${currentConfig?.bgColor} ${currentConfig?.borderColor} border rounded-xl p-4 shadow-lg max-w-sm`}>
        <div className="flex items-start gap-3">
          <Icon name={currentConfig?.icon} size={24} color={currentConfig?.iconColor} />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1">
              {type === 'success' ? 'Success!' : type === 'error' ? 'Error' : 'Warning'}
            </p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessNotification;