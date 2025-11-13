import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Wallet, CheckCircle, Sparkles, TrendingUp, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { WalletConnect } from '../components/WalletConnect';
import { useWallet } from '../hooks/useWallet';

export const Landing: React.FC = () => {
  const { address, isConnected } = useWallet();

  const features = [
    {
      icon: Lock,
      title: 'Secure & Trustless',
      description: 'Smart contracts handle everything automatically. No middlemen, no trust required.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant on-chain settlements powered by Arbitrum. Get paid in real-time.'
    },
    {
      icon: Wallet,
      title: 'Full Control',
      description: 'Your money, your rules. Complete transparency with every transaction on-chain.'
    }
  ];

  const benefits = [
    '⚡ Zero chargebacks - payments are final and secure',
    '💰 Ultra-low fees compared to Stripe or PayPal',
    '🔧 Fully programmable subscription logic',
    '📊 Real-time revenue tracking and analytics',
    '🌍 Truly global - no geographic restrictions',
    '🔒 Censorship-resistant and permissionless'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 bg-gradient-to-br from-cyan-50 via-teal-50 to-purple-50 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-cyan-200 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-medium text-cyan-900">Powered by Arbitrum Stylus</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            The Future of
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-teal-500 to-purple-600">
              Subscription Payments
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-4xl mx-auto leading-relaxed font-light">
            PayStylus revolutionizes recurring payments with blockchain technology. 
            <br className="hidden md:block" />
            <span className="font-medium text-cyan-700">Zero middlemen. Zero hassle. 100% decentralized.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/provider/onboarding">
              <Button size="lg" className="min-w-[220px] h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                Start Earning Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="outline" size="lg" className="min-w-[220px] h-14 text-lg font-semibold border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50">
                Explore Marketplace
              </Button>
            </Link>
          </div>
          
          <div className='flex justify-center'>
            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-cyan-200 shadow-lg flex items-center gap-3">
              {isConnected && (
                <span className="text-sm text-gray-700">{address?.slice(0,6)}...{address?.slice(-4)}</span>
              )}
              <WalletConnect />
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-cyan-700 mb-1">$0</div>
              <div className="text-sm text-gray-600">Setup Fees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-cyan-700 mb-1">&lt;1%</div>
              <div className="text-sm text-gray-600">Transaction Cost</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-cyan-700 mb-1">∞</div>
              <div className="text-sm text-gray-600">Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Creators Choose PayStylus
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on cutting-edge blockchain infrastructure to give you the payment platform you deserve.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 to-purple-100 rounded-2xl transform group-hover:scale-105 transition-transform duration-300 opacity-50"></div>
                <div className="relative bg-white p-8 rounded-2xl shadow-lg border border-cyan-100 group-hover:shadow-2xl transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl mb-4 shadow-md">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Everything You Need,
                <span className="text-cyan-600"> Nothing You Don't</span>
              </h2>
              <ul className="space-y-5">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-4 group">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg text-gray-700 pt-1">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white p-10 rounded-3xl shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-8 h-8 text-cyan-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Ready to Launch?</h3>
                </div>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Join thousands of creators already earning with PayStylus. 
                  Set up your subscription service in minutes, not days.
                </p>
                <div className="space-y-4">
                  <Link to="/provider/onboarding">
                    <Button className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-lg">Launch Your Service</Button>
                  </Link>
                  <Link to="/marketplace">
                    <Button variant="outline" className="w-full h-14 text-lg font-semibold border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50">Browse Services</Button>
                  </Link>
                </div>
                <p className="text-sm text-gray-500 mt-6 text-center">No credit card required • Free to start</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-cyan-950 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">PayStylus</span>
            </div>
            <p className="text-cyan-200 text-lg font-light mb-2">
              Decentralized Subscriptions, Simplified
            </p>
            <p className="text-gray-400 text-sm">
              Built with ❤️ on Arbitrum Stylus
            </p>
          </div>
          <div className="border-t border-cyan-900/50 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 PayStylus. Empowering creators with blockchain technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
