import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <div className="min-h-screen bg-background" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/user-wallet-dashboard" replace />;
  }

  return children;
};

export default GuestRoute;
