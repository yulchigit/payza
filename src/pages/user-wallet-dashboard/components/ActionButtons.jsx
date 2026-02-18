import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const ActionButtons = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'pay',
      label: 'Pay',
      icon: 'Send',
      variant: 'default',
      path: '/send-payment'
    },
    {
      id: 'receive',
      label: 'Receive',
      icon: 'Download',
      variant: 'outline',
      path: '/user-wallet-dashboard'
    },
    {
      id: 'convert',
      label: 'Convert',
      icon: 'ArrowLeftRight',
      variant: 'success',
      path: '/crypto-to-card-conversion'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {actions?.map((action) => (
        <Button
          key={action?.id}
          variant={action?.variant}
          size="lg"
          iconName={action?.icon}
          iconPosition="left"
          fullWidth
          onClick={() => navigate(action?.path)}
        >
          {action?.label}
        </Button>
      ))}
    </div>
  );
};

export default ActionButtons;