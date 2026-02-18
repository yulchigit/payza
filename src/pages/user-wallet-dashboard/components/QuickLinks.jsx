import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const QuickLinks = () => {
  const navigate = useNavigate();

  const links = [
    {
      id: 'link-accounts',
      label: 'Link Cards & Crypto',
      description: 'Connect payment methods',
      icon: 'Link',
      iconBg: 'bg-primary/10',
      iconColor: 'var(--color-primary)',
      path: '/link-cards-and-crypto'
    },
    {
      id: 'withdraw',
      label: 'Withdraw Funds',
      description: 'Transfer to bank or wallet',
      icon: 'Banknote',
      iconBg: 'bg-accent/10',
      iconColor: 'var(--color-accent)',
      path: '/user-wallet-dashboard'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {links?.map((link) => (
        <button
          key={link?.id}
          onClick={() => navigate(link?.path)}
          className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-250 text-left"
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-lg ${link?.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon name={link?.icon} size={24} color={link?.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base md:text-lg font-semibold text-foreground mb-1">{link?.label}</h4>
              <p className="text-sm text-muted-foreground">{link?.description}</p>
            </div>
            <Icon name="ChevronRight" size={20} className="text-muted-foreground flex-shrink-0" />
          </div>
        </button>
      ))}
    </div>
  );
};

export default QuickLinks;