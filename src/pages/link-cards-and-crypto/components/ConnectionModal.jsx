import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ConnectionModal = ({ isOpen, onClose, method, onSubmit, actionType }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    walletAddress: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);

    try {
      await onSubmit(method, formData);
    } finally {
      setLoading(false);
      setFormData({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        walletAddress: ''
      });
    }
  };

  const isTraditionalCard = method?.category === 'traditional';
  const isDisconnect = actionType === 'disconnect';

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method?.iconBg}`}>
              <Icon name={method?.icon} size={20} color={method?.iconColor} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {isDisconnect ? 'Disconnect' : 'Connect'} {method?.name}
              </h2>
              <p className="text-sm text-muted-foreground">{method?.type}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {isDisconnect ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                <Icon name="AlertTriangle" size={32} color="var(--color-error)" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Confirm Disconnection
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to disconnect {method?.name}? You won't be able to use this payment method until you reconnect it.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button variant="destructive" fullWidth loading={loading} type="submit">
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <>
              {isTraditionalCard ? (
                <>
                  <Input
                    label="Card Number"
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData?.cardNumber}
                    onChange={handleChange}
                    required
                    className="mb-4"
                    description="Enter your 16-digit card number"
                  />
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input
                      label="Expiry Date"
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData?.expiryDate}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="CVV"
                      type="password"
                      name="cvv"
                      placeholder="***"
                      value={formData?.cvv}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <Input
                    label="Wallet Address"
                    type="text"
                    name="walletAddress"
                    placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                    value={formData?.walletAddress}
                    onChange={handleChange}
                    required
                    className="mb-4"
                    description="Your cryptocurrency wallet address"
                  />
                </>
              )}

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Icon name="Shield" size={20} color="var(--color-accent)" />
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      Secure Connection
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      We never ask for your wallet private key. Sensitive card data is not persisted on the client.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button variant="default" fullWidth loading={loading} type="submit">
                  Connect {method?.name}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ConnectionModal;
