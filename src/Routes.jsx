import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

const NotFound = lazy(() => import("pages/NotFound"));
const SendPayment = lazy(() => import("pages/send-payment"));
const UserWalletDashboard = lazy(() => import("pages/user-wallet-dashboard"));
const LinkCardsAndCrypto = lazy(() => import("pages/link-cards-and-crypto"));
const CryptoToCardConversion = lazy(() => import("pages/crypto-to-card-conversion"));
const PaymentConfirmation = lazy(() => import("pages/payment-confirmation"));
const MerchantDashboard = lazy(() => import("pages/merchant-dashboard"));

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <RouterRoutes>
            <Route path="/" element={<UserWalletDashboard />} />
            <Route path="/send-payment" element={<SendPayment />} />
            <Route path="/user-wallet-dashboard" element={<UserWalletDashboard />} />
            <Route path="/link-cards-and-crypto" element={<LinkCardsAndCrypto />} />
            <Route path="/crypto-to-card-conversion" element={<CryptoToCardConversion />} />
            <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
            <Route path="/merchant-dashboard" element={<MerchantDashboard />} />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
