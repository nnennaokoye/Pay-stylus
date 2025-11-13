import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap, Menu, X } from "lucide-react";
import { WalletConnect } from "./WalletConnect";
import { useWallet } from "../hooks/useWallet";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { address, isConnected } = useWallet();

  const navigation = [
    { name: "Marketplace", href: "/marketplace" },
    { name: "My Subscriptions", href: "/subscriptions" },
    { name: "Wallet", href: "/wallet" },
    { name: "Provider Dashboard", href: "/provider" },
    { name: "Test Page", href: "/test" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-cyan-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-700 to-teal-600 bg-clip-text text-transparent">
                PayStylus
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive(item.href)
                      ? "text-cyan-600 border-b-2 border-cyan-600"
                      : "text-gray-600 hover:text-cyan-600"
                  } px-3 py-2 text-sm font-semibold transition-colors`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {/* Mobile Menu Toggle */}
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-cyan-600 hover:bg-cyan-50"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle navigation"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Wallet Connection */}
              {isConnected && (
                <span className="hidden sm:inline text-sm text-gray-600">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              )}
              <WalletConnect />
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-cyan-100 py-4">
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${
                      isActive(item.href)
                        ? "text-cyan-600 bg-cyan-50"
                        : "text-gray-600 hover:text-cyan-600 hover:bg-cyan-50"
                    } block px-3 py-2 rounded-lg text-sm font-semibold transition-colors`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};
