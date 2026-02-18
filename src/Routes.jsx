import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import SendPayment from 'pages/send-payment';
import UserWalletDashboard from 'pages/user-wallet-dashboard';
import LinkCardsAndCrypto from 'pages/link-cards-and-crypto';
import CryptoToCardConversion from 'pages/crypto-to-card-conversion';
import PaymentConfirmation from 'pages/payment-confirmation';
import MerchantDashboard from 'pages/merchant-dashboard';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<UserWalletDashboard />} />
        <Route path="/send-payment" element={<SendPayment />} />
        <Route path="/user-wallet-dashboard" element={<UserWalletDashboard />} />
        <Route path="/link-cards-and-crypto" element={<LinkCardsAndCrypto />} />
        <Route path="/crypto-to-card-conversion" element={<CryptoToCardConversion />} />
        <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
        <Route path="/merchant-dashboard" element={<MerchantDashboard />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
