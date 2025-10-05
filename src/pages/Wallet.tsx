import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { StatsCard } from '../components/StatsCard';
import { useStreamPayContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { EscrowBalance } from '../types';

export const Wallet: React.FC = () => {
  const { Deposite, getUserBalance } = useStreamPayContract();
  const { isConnected, address } = useWallet();
  const [balance, setBalance] = useState<EscrowBalance | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!isConnected) return;
      
      try {
        const escrowBalance = await getUserBalance();
        setBalance({
          total: escrowBalance,
          withdrawable: '0',
          pending: '0'
        });
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [isConnected, getUserBalance]);

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount))) return;
    
    try {
      await Deposite(depositAmount);
      setDepositAmount('');
      setIsDepositModalOpen(false);
      
      // Refresh balance
      const newBalance = await getUserBalance();
      setBalance({
        total: newBalance,
        withdrawable: '0',
        pending: '0'
      });
    } catch (error) {
      console.error('Failed to deposit:', error);
    }
  };

  const recentTransactions = [
    { type: 'deposit', amount: '+0.5 ETH', date: '2024-02-28', hash: '0x1234...abcd' },
    { type: 'withdrawal', amount: '-0.2 ETH', date: '2024-02-27', hash: '0x5678...efgh' },
    { type: 'deposit', amount: '+0.3 ETH', date: '2024-02-26', hash: '0x9abc...def0' },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent>
            <div className="text-center">
              <WalletIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Wallet Connection Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please connect your wallet to view your escrow balance and manage deposits.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Wallet & Escrow</h1>
          <p className="text-gray-600 mt-2">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Balance Overview */}
        {loadingBalance ? (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-xl" />
            ))}
          </div>
        ) : balance && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Escrow"
              value={`${balance.total} ETH`}
              icon={WalletIcon}
            />
            <StatsCard
              title="Withdrawable"
              value={`${balance.withdrawable} ETH`}
              subtitle="Ready to withdraw"
              icon={ArrowUpRight}
            />
            <StatsCard
              title="Pending"
              value={`${balance.pending} ETH`}
              subtitle="Locked for subscriptions"
              icon={ArrowDownLeft}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button
                onClick={() => setIsDepositModalOpen(true)}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Deposit ETH</span>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={!balance || Number(balance.withdrawable) === 0}
              >
                Withdraw Available
              </Button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          tx.type === 'deposit' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {tx.type === 'deposit' ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                          <p className="text-sm text-gray-500">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          tx.type === 'deposit' ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {tx.amount}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">{tx.hash}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Deposit Modal */}
        <Modal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          title="Deposit ETH"
        >
          <div className="space-y-4">
            <Input
              label="Amount (ETH)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.1"
              step="0.001"
            />
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Deposited ETH will be held in escrow and used automatically for your active subscriptions.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsDepositModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeposit}
                className="flex-1"
                disabled={!depositAmount || isNaN(Number(depositAmount))}
              >
                Deposit
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};