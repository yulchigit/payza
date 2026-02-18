import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PaymentMethodCard from './components/PaymentMethodCard';
import ConnectionModal from './components/ConnectionModal';
import SecurityScoreCard from './components/SecurityScoreCard';
import SuccessNotification from './components/SuccessNotification';

const LinkCardsAndCrypto = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ isVisible: false, message: '', type: 'success' });
  const [modalState, setModalState] = useState({ isOpen: false, method: null, actionType: 'connect' });

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'uzcard-1',
      name: 'Uzcard',
      type: 'Debit Card',
      category: 'traditional',
      icon: 'CreditCard',
      iconBg: 'bg-primary/10',
      iconColor: 'var(--color-primary)',
      status: 'connected',
      description: 'National payment system of Uzbekistan for secure local transactions',
      details: [
        { label: 'Card Number', value: '**** **** **** 4532' },
        { label: 'Expiry', value: '12/2027' }
      ]
    },
    {
      id: 'humo-1',
      name: 'Humo',
      type: 'Debit Card',
      category: 'traditional',
      icon: 'CreditCard',
      iconBg: 'bg-accent/10',
      iconColor: 'var(--color-accent)',
      status: 'pending',
      description: 'Alternative national payment card system with wide acceptance across Uzbekistan',
      details: null
    },
    {
      id: 'visa-1',
      name: 'Visa',
      type: 'Credit Card',
      category: 'traditional',
      icon: 'CreditCard',
      iconBg: 'bg-warning/10',
      iconColor: 'var(--color-warning)',
      status: 'disconnected',
      description: 'International payment network for global transactions and online purchases',
      details: null
    },
    {
      id: 'usdt-1',
      name: 'USDT Wallet',
      type: 'Tether (TRC-20)',
      category: 'crypto',
      icon: 'Wallet',
      iconBg: 'bg-success/10',
      iconColor: 'var(--color-success)',
      status: 'connected',
      description: 'Stablecoin pegged to USD for stable value cryptocurrency transactions',
      details: [
        { label: 'Address', value: '0x742d...5f0bEb' },
        { label: 'Balance', value: '1,250.00 USDT' }
      ]
    },
    {
      id: 'btc-1',
      name: 'Bitcoin Wallet',
      type: 'BTC (Native SegWit)',
      category: 'crypto',
      icon: 'Bitcoin',
      iconBg: 'bg-warning/10',
      iconColor: 'var(--color-warning)',
      status: 'disconnected',
      description: 'Original cryptocurrency for decentralized peer-to-peer digital payments',
      details: null
    }
  ]);

  const connectedCount = paymentMethods?.filter(m => m?.status === 'connected')?.length;
  const totalCount = paymentMethods?.length;
  const securityScore = Math.round((connectedCount / totalCount) * 100);

  const handleConnect = (method, actionType) => {
    setModalState({ isOpen: true, method, actionType });
  };

  const handleManage = (method) => {
    setNotification({
      isVisible: true,
      message: `Opening management settings for ${method?.name}`,
      type: 'success'
    });
  };

  const handleModalSubmit = (method, formData) => {
    setPaymentMethods(prev => prev?.map(m => {
      if (m?.id === method?.id) {
        if (modalState?.actionType === 'disconnect') {
          return { ...m, status: 'disconnected', details: null };
        } else {
          const newDetails = m?.category === 'traditional' 
            ? [
                { label: 'Card Number', value: `**** **** **** ${formData?.cardNumber?.slice(-4)}` },
                { label: 'Expiry', value: formData?.expiryDate }
              ]
            : [
                { label: 'Address', value: `${formData?.walletAddress?.slice(0, 6)}...${formData?.walletAddress?.slice(-6)}` },
                { label: 'Balance', value: m?.name?.includes('USDT') ? '0.00 USDT' : '0.00 BTC' }
              ];
          return { ...m, status: 'connected', details: newDetails };
        }
      }
      return m;
    }));

    setNotification({
      isVisible: true,
      message: modalState?.actionType === 'disconnect' 
        ? `${method?.name} has been disconnected successfully`
        : `${method?.name} has been connected successfully`,
      type: 'success'
    });

    setModalState({ isOpen: false, method: null, actionType: 'connect' });
  };

  const traditionalMethods = paymentMethods?.filter(m => m?.category === 'traditional');
  const cryptoMethods = paymentMethods?.filter(m => m?.category === 'crypto');

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="user" />
      <main className="pt-24 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/user-wallet-dashboard')}
              iconName="ArrowLeft"
              iconPosition="left"
              className="mb-4"
            >
              Back to Dashboard
            </Button>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Link Payment Methods
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Connect your traditional cards and cryptocurrency wallets to enable seamless payments across all platforms
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name="CreditCard" size={24} color="var(--color-primary)" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                  Traditional Payment Cards
                </h2>
              </div>
              <div className="space-y-4">
                {traditionalMethods?.map(method => (
                  <PaymentMethodCard
                    key={method?.id}
                    method={method}
                    onConnect={handleConnect}
                    onManage={handleManage}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Icon name="Wallet" size={24} color="var(--color-accent)" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                  Cryptocurrency Wallets
                </h2>
              </div>
              <div className="space-y-4">
                {cryptoMethods?.map(method => (
                  <PaymentMethodCard
                    key={method?.id}
                    method={method}
                    onConnect={handleConnect}
                    onManage={handleManage}
                  />
                ))}
              </div>
            </div>
          </div>

          <SecurityScoreCard
            connectedCount={connectedCount}
            totalCount={totalCount}
            securityScore={securityScore}
          />
        </div>
      </main>
      <ConnectionModal
        isOpen={modalState?.isOpen}
        onClose={() => setModalState({ isOpen: false, method: null, actionType: 'connect' })}
        method={modalState?.method}
        onSubmit={handleModalSubmit}
        actionType={modalState?.actionType}
      />
      <SuccessNotification
        isVisible={notification?.isVisible}
        onClose={() => setNotification({ ...notification, isVisible: false })}
        message={notification?.message}
        type={notification?.type}
      />
    </div>
  );
};

export default LinkCardsAndCrypto;