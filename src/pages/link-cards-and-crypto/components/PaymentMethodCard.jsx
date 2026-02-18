import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import StatusIndicatorSystem from '../../../components/ui/StatusIndicatorSystem';

const PaymentMethodCard = ({ method, onConnect, onManage }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'connected':
        return { variant: 'success', label: 'Connected' };
      case 'pending':
        return { variant: 'warning', label: 'Pending' };
      case 'disconnected':
        return { variant: 'error', label: 'Disconnected' };
      default:
        return { variant: 'pending', label: 'Not Connected' };
    }
  };

  const statusConfig = getStatusConfig(method?.status);

  return (
    <div className="bg-card rounded-xl border border-border p-6 transition-all duration-250 hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${method?.iconBg}`}>
            <Icon name={method?.icon} size={24} color={method?.iconColor} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{method?.name}</h3>
            <p className="text-sm text-muted-foreground">{method?.type}</p>
          </div>
        </div>
        <StatusIndicatorSystem 
          status={statusConfig?.variant} 
          label={statusConfig?.label}
          showIcon={true}
        />
      </div>
      {method?.details && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          {method?.details?.map((detail, index) => (
            <div key={index} className="flex justify-between items-center text-sm mb-2 last:mb-0">
              <span className="text-muted-foreground">{detail?.label}:</span>
              <span className="text-foreground font-medium data-text">{detail?.value}</span>
            </div>
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground mb-4">{method?.description}</p>
      {method?.status === 'connected' ? (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            fullWidth 
            onClick={() => onManage(method)}
            iconName="Settings"
            iconPosition="left"
          >
            Manage
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onConnect(method, 'disconnect')}
          >
            <Icon name="Unlink" size={18} />
          </Button>
        </div>
      ) : (
        <Button 
          variant={method?.status === 'pending' ? 'secondary' : 'default'}
          fullWidth 
          onClick={() => onConnect(method, 'connect')}
          iconName={method?.status === 'pending' ? 'Clock' : 'Link'}
          iconPosition="left"
          disabled={method?.status === 'pending'}
        >
          {method?.status === 'pending' ? 'Verification Pending' : 'Connect Now'}
        </Button>
      )}
    </div>
  );
};

export default PaymentMethodCard;