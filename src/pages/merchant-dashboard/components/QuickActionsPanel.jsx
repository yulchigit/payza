import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionsPanel = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'withdraw',
      title: 'Withdraw Funds',
      description: 'Transfer to bank or crypto wallet',
      icon: 'Wallet',
      iconBg: 'bg-primary/10',
      iconColor: 'var(--color-primary)',
      onClick: () => {}
    },
    {
      id: 'payment-link',
      title: 'Generate Payment Link',
      description: 'Create shareable payment request',
      icon: 'Link',
      iconBg: 'bg-accent/10',
      iconColor: 'var(--color-accent)',
      onClick: () => {}
    },
    {
      id: 'settings',
      title: 'Payment Settings',
      description: 'Configure payment methods',
      icon: 'Settings',
      iconBg: 'bg-warning/10',
      iconColor: 'var(--color-warning)',
      onClick: () => {}
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {actions?.map((action) => (
        <div key={action?.id} className="bg-card rounded-xl p-6 border border-border transition-all duration-250 hover:shadow-md">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action?.iconBg} mb-4`}>
            <Icon name={action?.icon} size={24} color={action?.iconColor} />
          </div>
          <h4 className="text-base md:text-lg font-semibold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {action?.title}
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            {action?.description}
          </p>
          <Button variant="outline" fullWidth onClick={action?.onClick}>
            Get Started
          </Button>
        </div>
      ))}
    </div>
  );
};

export default QuickActionsPanel;