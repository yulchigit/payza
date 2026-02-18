import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const ActionButtons = ({ onDownloadReceipt }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3 md:space-y-4 mb-6 md:mb-7 lg:mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <Button
          variant="default"
          size="lg"
          fullWidth
          iconName="Send"
          iconPosition="left"
          onClick={() => navigate('/send-payment')}
        >
          Send Another Payment
        </Button>

        <Button
          variant="outline"
          size="lg"
          fullWidth
          iconName="Home"
          iconPosition="left"
          onClick={() => navigate('/user-wallet-dashboard')}
        >
          Return to Dashboard
        </Button>
      </div>

      <Button
        variant="ghost"
        size="lg"
        fullWidth
        iconName="Download"
        iconPosition="left"
        onClick={onDownloadReceipt}
      >
        Download Receipt
      </Button>
    </div>
  );
};

export default ActionButtons;