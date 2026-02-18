import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import ConversionCalculator from './components/ConversionCalculator';
import ExchangeRateCard from './components/ExchangeRateCard';
import FeeBreakdown from './components/FeeBreakdown';
import DestinationCardSelector from './components/DestinationCardSelector';
import ConversionSettings from './components/ConversionSettings';
import TransactionSummary from './components/TransactionSummary';
import MarketDataWidget from './components/MarketDataWidget';
import ConversionSuccessModal from './components/ConversionSuccessModal';

const CryptoToCardConversion = () => {
  const navigate = useNavigate();
  const [cryptoType, setCryptoType] = useState('USDT');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [fiatAmount, setFiatAmount] = useState('0.00');
  const [selectedCard, setSelectedCard] = useState(null);
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const cryptoBalances = {
    USDT: '5,000.00',
    BTC: '0.15'
  };

  const exchangeRates = {
    USDT: {
      USD: 1.00,
      UZS: 12650
    },
    BTC: {
      USD: 45000,
      UZS: 569250000
    }
  };

  const linkedCards = [
  {
    id: 1,
    type: 'Uzcard',
    lastFour: '4532',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_118081b5e-1767009652734.png",
    logoAlt: 'Uzcard logo with blue and white gradient design on payment card',
    processingTime: '1-2 hours',
    dailyLimit: '$5,000',
    isDefault: true
  },
  {
    id: 2,
    type: 'Humo',
    lastFour: '8765',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_166c649ad-1765636846487.png",
    logoAlt: 'Humo card logo with green and gold design on payment card',
    processingTime: '2-3 hours',
    dailyLimit: '$3,000',
    isDefault: false
  },
  {
    id: 3,
    type: 'Visa',
    lastFour: '1234',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_15d405f5c-1764672639868.png",
    logoAlt: 'Visa logo with blue and white branding on international payment card',
    processingTime: '3-5 hours',
    dailyLimit: '$10,000',
    isDefault: false
  }];


  useEffect(() => {
    if (linkedCards?.length > 0 && !selectedCard) {
      const defaultCard = linkedCards?.find((card) => card?.isDefault);
      setSelectedCard(defaultCard ? defaultCard?.id : linkedCards?.[0]?.id);
    }
  }, [linkedCards, selectedCard]);

  useEffect(() => {
    if (cryptoAmount && !isNaN(parseFloat(cryptoAmount))) {
      const amount = parseFloat(cryptoAmount);
      const rate = exchangeRates?.[cryptoType]?.[fiatCurrency];
      const converted = amount * rate;
      setFiatAmount(converted?.toFixed(2));
    } else {
      setFiatAmount('0.00');
    }
  }, [cryptoAmount, cryptoType, fiatCurrency, exchangeRates]);

  const handleSwap = () => {
    // Swap functionality placeholder
    console.log('Swap currencies');
  };

  const handleConfirmConversion = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccessModal(true);
    }, 2000);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/user-wallet-dashboard');
  };

  const selectedCardDetails = linkedCards?.find((card) => card?.id === selectedCard);

  const conversionDetails = {
    cryptoAmount,
    cryptoType,
    fiatAmount: parseFloat(fiatAmount),
    fiatCurrency,
    cardLastFour: selectedCardDetails?.lastFour || '',
    processingTime: selectedCardDetails?.processingTime || ''
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="user" />
      
      <main className="pt-24 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Crypto to Card Conversion
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Convert your cryptocurrency to traditional currency and transfer to your linked cards
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 space-y-6">
              <ConversionCalculator
                cryptoType={cryptoType}
                setCryptoType={setCryptoType}
                cryptoAmount={cryptoAmount}
                setCryptoAmount={setCryptoAmount}
                fiatCurrency={fiatCurrency}
                setFiatCurrency={setFiatCurrency}
                fiatAmount={fiatAmount}
                cryptoBalances={cryptoBalances}
                exchangeRates={exchangeRates}
                onSwap={handleSwap} />


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExchangeRateCard
                  cryptoType={cryptoType}
                  fiatCurrency={fiatCurrency}
                  exchangeRates={exchangeRates} />

                <FeeBreakdown
                  cryptoType={cryptoType}
                  cryptoAmount={cryptoAmount}
                  fiatCurrency={fiatCurrency}
                  fiatAmount={fiatAmount} />

              </div>

              <DestinationCardSelector
                selectedCard={selectedCard}
                setSelectedCard={setSelectedCard}
                linkedCards={linkedCards} />


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ConversionSettings
                  slippageTolerance={slippageTolerance}
                  setSlippageTolerance={setSlippageTolerance}
                  minAmount={cryptoType === 'BTC' ? '0.001' : '10'}
                  maxAmount={cryptoType === 'BTC' ? '10' : '50000'}
                  cryptoType={cryptoType}
                  fiatCurrency={fiatCurrency} />

                <MarketDataWidget
                  cryptoType={cryptoType}
                  fiatCurrency={fiatCurrency} />

              </div>
            </div>

            <div className="lg:col-span-1">
              <TransactionSummary
                cryptoType={cryptoType}
                cryptoAmount={cryptoAmount}
                fiatCurrency={fiatCurrency}
                fiatAmount={fiatAmount}
                selectedCard={selectedCard}
                linkedCards={linkedCards}
                onConfirm={handleConfirmConversion}
                isProcessing={isProcessing} />

            </div>
          </div>
        </div>
      </main>

      <ConversionSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        conversionDetails={conversionDetails} />

    </div>);

};

export default CryptoToCardConversion;