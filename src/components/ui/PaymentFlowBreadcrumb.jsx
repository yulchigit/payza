import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const PaymentFlowBreadcrumb = ({ currentStep = 'send' }) => {
  const navigate = useNavigate();

  const steps = [
    { id: 'send', label: 'Send Payment', path: '/send-payment' },
    { id: 'confirm', label: 'Confirmation', path: '/payment-confirmation' }
  ];

  const currentStepIndex = steps?.findIndex(step => step?.id === currentStep);

  const handleStepClick = (step, index) => {
    if (index < currentStepIndex) {
      navigate(step?.path);
    }
  };

  return (
    <div className="breadcrumb-container">
      {steps?.map((step, index) => (
        <React.Fragment key={step?.id}>
          <button
            onClick={() => handleStepClick(step, index)}
            className={`breadcrumb-item ${index === currentStepIndex ? 'active' : ''}`}
            disabled={index > currentStepIndex}
            style={{
              cursor: index < currentStepIndex ? 'pointer' : index === currentStepIndex ? 'default' : 'not-allowed',
              opacity: index > currentStepIndex ? 0.5 : 1
            }}
          >
            <span>{step?.label}</span>
          </button>
          {index < steps?.length - 1 && (
            <Icon name="ChevronRight" size={16} className="breadcrumb-separator" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default PaymentFlowBreadcrumb;