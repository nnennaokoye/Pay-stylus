export interface Plan {
  id: string;
  providerId: string;
  providerName: string;
  name: string;
  description: string;
  price: string; // In ETH
  interval: 'monthly' | 'yearly';
  isActive: boolean;
  subscriberCount: number;
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  providerName: string;
  price: string;
  interval: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  nextPaymentDate: string;
  subscribedAt: string;
}

export interface EscrowBalance {
  total: string;
  withdrawable: string;
  pending: string;
}

export interface PaymentHistory {
  id: string;
  planName: string;
  amount: string;
  date: string;
  status: 'success' | 'failed' | 'pending';
  txHash?: string;
}