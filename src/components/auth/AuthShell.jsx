import React from "react";
import Icon from "components/AppIcon";

const AuthShell = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Icon name="Wallet" size={24} color="#FFFFFF" />
          </div>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthShell;
