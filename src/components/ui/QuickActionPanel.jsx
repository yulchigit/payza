import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const QuickActionPanel = ({ userRole = 'user' }) => {
  const navigate = useNavigate();

  const userActions = [
    {
      id: 'send',
      title: 'Send Payment',
      description: 'Transfer funds to anyone instantly',
      icon: 'Send',
      iconBg: 'bg-primary/10',
      iconColor: 'var(--color-primary)',
      path: '/send-payment'
    },
    {
      id: 'receive',
      title: 'Receive Money',
      description: 'Generate QR code or share payment link',
      icon: 'Download',
      iconBg: 'bg-accent/10',
      iconColor: 'var(--color-accent)',
      path: '/user-wallet-dashboard'
    },
    {
      id: 'convert',
      title: 'Convert Crypto',
      description: 'Exchange crypto to card balance',
      icon: 'ArrowLeftRight',
      iconBg: 'bg-warning/10',
      iconColor: 'var(--color-warning)',
      path: '/crypto-to-card-conversion'
    }
  ];

  const merchantActions = [
    {
      id: 'transactions',
      title: 'View Transactions',
      description: 'Monitor all payment activity',
      icon: 'Receipt',
      iconBg: 'bg-primary/10',
      iconColor: 'var(--color-primary)',
      path: '/merchant-dashboard'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Track revenue and performance',
      icon: 'TrendingUp',
      iconBg: 'bg-accent/10',
      iconColor: 'var(--color-accent)',
      path: '/merchant-dashboard'
    },
    {
      id: 'settings',
      title: 'Payment Settings',
      description: 'Configure payment methods',
      icon: 'Settings',
      iconBg: 'bg-muted',
      iconColor: 'var(--color-muted-foreground)',
      path: '/merchant-dashboard'
    }
  ];

  const actions = userRole === 'merchant' ? merchantActions : userActions;

  const handleActionClick = (path) => {
    navigate(path);
  };

  return (
    <div className="quick-action-panel">
      {actions?.map((action) => (
        <div key={action?.id} className="quick-action-card">
          <div className={`quick-action-icon ${action?.iconBg}`}>
            <Icon name={action?.icon} size={24} color={action?.iconColor} />
          </div>
          <h3 className="quick-action-title">{action?.title}</h3>
          <p className="quick-action-description">{action?.description}</p>
          <Button
            variant="outline"
            fullWidth
            onClick={() => handleActionClick(action?.path)}
          >
            Get Started
          </Button>
        </div>
      ))}
    </div>
  );
};

export default QuickActionPanel;