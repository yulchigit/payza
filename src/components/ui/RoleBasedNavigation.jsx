import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const RoleBasedNavigation = ({ userRole = 'user' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userNavItems = [
  { label: 'Dashboard', path: '/user-wallet-dashboard', icon: 'LayoutDashboard' },
  { label: 'Send Payment', path: '/send-payment', icon: 'Send' },
  { label: 'Link Accounts', path: '/link-cards-and-crypto', icon: 'Link' },
  { label: 'Convert Crypto', path: '/crypto-to-card-conversion', icon: 'ArrowLeftRight' }];


  const merchantNavItems = [
  { label: 'Merchant Dashboard', path: '/merchant-dashboard', icon: 'Store' }];


  const navItems = userRole === 'merchant' ? merchantNavItems : userNavItems;

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location?.pathname === path;

  return (
    <>
      <header className="nav-header">
        <div className="nav-header-logo">
          <div className="nav-header-brand">
            <Icon name="Wallet" size={24} color="#FFFFFF" />
          </div>
          <span className="nav-header-brand-text">PayZa</span>
        </div>

        <nav className="nav-header-menu">
          {navItems?.map((item) =>
          <button
            key={item?.path}
            onClick={() => handleNavigation(item?.path)}
            className={`nav-header-item ${isActive(item?.path) ? 'active' : ''}`}>

              <Icon name={item?.icon} size={18} />
              <span>{item?.label}</span>
            </button>
          )}
        </nav>

        <div className="nav-header-actions">
          <Button
            variant="ghost"
            size="icon"
            iconName="Bell"
            iconSize={20}
            onClick={() => {}} />

          <Button
            variant="ghost"
            size="icon"
            iconName="User"
            iconSize={20}
            onClick={() => {}} />

        </div>
      </header>
      <button
        className="nav-mobile-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle mobile menu">

        <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={24} />
      </button>
      {mobileMenuOpen &&
      <div className="nav-mobile-overlay">
          <div className="nav-mobile-header">
            <div className="nav-header-logo">
              <div className="nav-header-brand">
                <Icon name="Wallet" size={24} color="#FFFFFF" />
              </div>
              <span className="nav-header-brand-text">FinPay</span>
            </div>
          </div>

          <nav className="nav-mobile-menu">
            {navItems?.map((item) =>
          <button
            key={item?.path}
            onClick={() => handleNavigation(item?.path)}
            className={`nav-mobile-item ${isActive(item?.path) ? 'active' : ''}`}>

                <Icon name={item?.icon} size={24} />
                <span>{item?.label}</span>
              </button>
          )}

            <div className="border-t border-border mt-4 pt-4">
              <button className="nav-mobile-item">
                <Icon name="Bell" size={24} />
                <span>Notifications</span>
              </button>
              <button className="nav-mobile-item">
                <Icon name="User" size={24} />
                <span>Profile</span>
              </button>
            </div>
          </nav>
        </div>
      }
    </>);

};

export default RoleBasedNavigation;