'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import './Header.css';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  // Public navigation items
  const publicNavItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/search', label: 'Talents', icon: '💎' },
    { href: '/establishments', label: 'Establishments', icon: '🏢' },
  ];

  // Authenticated navigation items
  const authNavItems = user ? [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
    { href: '/dashboard/boosts', label: 'Boost', icon: '🚀', highlight: true },
  ] : [];

  return (
    <>
      {/* Desktop Header */}
      <header className="app-header desktop-header">
        <div className="header-container">
          {/* Logo */}
          <Link href="/" className="header-logo">
            <span className="logo-text">Velvet</span>
          </Link>

          {/* Navigation */}
          <nav className="header-nav">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="header-auth">
            {user ? (
              <>
                <Link
                  href="/dashboard/boosts"
                  className="boost-button"
                >
                  <span className="boost-icon">🚀</span>
                  Boost Profile
                </Link>
                <div className="user-menu">
                  <Link href="/dashboard" className="user-link">
                    {user.email}
                  </Link>
                  <button onClick={handleLogout} className="logout-button">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="login-link">
                  Login
                </Link>
                <Link href="/auth/register" className="signup-button">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        {/* Public items */}
        {publicNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive(item.href) ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        ))}

        {/* Auth items */}
        {user ? (
          <>
            <Link
              href="/dashboard/boosts"
              className={`mobile-nav-item highlight ${isActive('/dashboard/boosts') ? 'active' : ''}`}
            >
              <span className="mobile-nav-icon">🚀</span>
              <span className="mobile-nav-label">Boost</span>
            </Link>
            <Link
              href="/dashboard"
              className={`mobile-nav-item ${isActive('/dashboard') || pathname?.startsWith('/dashboard') ? 'active' : ''}`}
            >
              <span className="mobile-nav-icon">👤</span>
              <span className="mobile-nav-label">Account</span>
            </Link>
          </>
        ) : (
          <Link
            href="/auth/login"
            className={`mobile-nav-item ${isActive('/auth/login') ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">🔑</span>
            <span className="mobile-nav-label">Login</span>
          </Link>
        )}
      </nav>
    </>
  );
}
