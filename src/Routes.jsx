import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/auth/ProtectedRoute";
import GuestRoute from "components/auth/GuestRoute";

const NotFound = lazy(() => import("pages/NotFound"));
const SendPayment = lazy(() => import("pages/send-payment"));
const UserWalletDashboard = lazy(() => import("pages/user-wallet-dashboard"));
const LinkCardsAndCrypto = lazy(() => import("pages/link-cards-and-crypto"));
const CryptoToCardConversion = lazy(() => import("pages/crypto-to-card-conversion"));
const PaymentConfirmation = lazy(() => import("pages/payment-confirmation"));
const MerchantDashboard = lazy(() => import("pages/merchant-dashboard"));
const AuthLogin = lazy(() => import("pages/auth-login"));
const AuthRegister = lazy(() => import("pages/auth-register"));

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <RouterRoutes>
            <Route path="/" element={<ProtectedRoute><UserWalletDashboard /></ProtectedRoute>} />
            <Route path="/auth/login" element={<GuestRoute><AuthLogin /></GuestRoute>} />
            <Route path="/auth/register" element={<GuestRoute><AuthRegister /></GuestRoute>} />
            <Route path="/send-payment" element={<ProtectedRoute><SendPayment /></ProtectedRoute>} />
            <Route path="/user-wallet-dashboard" element={<ProtectedRoute><UserWalletDashboard /></ProtectedRoute>} />
            <Route path="/link-cards-and-crypto" element={<ProtectedRoute><LinkCardsAndCrypto /></ProtectedRoute>} />
            <Route path="/crypto-to-card-conversion" element={<ProtectedRoute><CryptoToCardConversion /></ProtectedRoute>} />
            <Route path="/payment-confirmation" element={<ProtectedRoute><PaymentConfirmation /></ProtectedRoute>} />
            <Route path="/merchant-dashboard" element={<ProtectedRoute><MerchantDashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
