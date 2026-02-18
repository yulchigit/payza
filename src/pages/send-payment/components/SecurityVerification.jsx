import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const SecurityVerification = ({ isOpen, onClose, onVerify }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('pin');

  const handleVerify = () => {
    if (verificationMethod === 'pin') {
      if (pin?.length !== 4) {
        setError('PIN must be 4 digits');
        return;
      }
      if (pin !== '1234') {
        setError('Incorrect PIN. Demo PIN: 1234');
        return;
      }
    }
    
    onVerify();
  };

  const handleBiometric = () => {
    setTimeout(() => {
      onVerify();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Verify Transaction</h3>
          <Button
            variant="ghost"
            size="icon"
            iconName="X"
            onClick={onClose}
          />
        </div>

        <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
          <button
            onClick={() => setVerificationMethod('pin')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              verificationMethod === 'pin' ?'border-primary bg-primary/5' :'border-border bg-card hover:border-primary/50'
            }`}
          >
            <Icon name="Lock" size={24} className="mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium text-foreground">PIN</p>
          </button>
          
          <button
            onClick={() => setVerificationMethod('biometric')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              verificationMethod === 'biometric' ?'border-primary bg-primary/5' :'border-border bg-card hover:border-primary/50'
            }`}
          >
            <Icon name="Fingerprint" size={24} className="mx-auto mb-2 text-accent" />
            <p className="text-sm font-medium text-foreground">Biometric</p>
          </button>
        </div>

        {verificationMethod === 'pin' ? (
          <div className="space-y-4">
            <Input
              label="Enter 4-digit PIN"
              type="password"
              placeholder="••••"
              value={pin}
              onChange={(e) => {
                setPin(e?.target?.value?.replace(/\D/g, '')?.slice(0, 4));
                setError('');
              }}
              error={error}
              maxLength={4}
              required
            />
            
            <div className="flex items-start gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <Icon name="Info" size={16} className="text-accent flex-shrink-0 mt-0.5" />
              <p className="text-xs text-accent">
                Demo PIN: 1234
              </p>
            </div>

            <Button
              variant="default"
              fullWidth
              onClick={handleVerify}
              disabled={pin?.length !== 4}
            >
              Verify &amp; Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Icon name="Fingerprint" size={48} className="text-accent" />
              </div>
              <p className="text-sm text-muted-foreground text-center mb-2">
                Place your finger on the sensor
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Touch ID or Face ID
              </p>
            </div>

            <Button
              variant="default"
              fullWidth
              onClick={handleBiometric}
              iconName="Fingerprint"
              iconPosition="left"
            >
              Authenticate
            </Button>
          </div>
        )}

        <Button
          variant="ghost"
          fullWidth
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default SecurityVerification;