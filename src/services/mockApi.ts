import { Plan, Provider, Subscription, PaymentHistory } from '../types';

// Mock data
const mockPlans: Plan[] = [
  {
    id: '1',
    providerId: '1',
    providerName: 'TechFlow',
    name: 'Premium Dev Tools',
    description: 'Access to premium development tools and resources',
    price: '0.05',
    interval: 'monthly',
    isActive: true,
    subscriberCount: 128,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    providerId: '2',
    providerName: 'DataStream',
    name: 'Analytics Pro',
    description: 'Advanced analytics and business intelligence platform',
    price: '0.1',
    interval: 'monthly',
    isActive: true,
    subscriberCount: 89,
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    providerId: '1',
    providerName: 'TechFlow',
    name: 'Annual Enterprise',
    description: 'Full enterprise suite with priority support',
    price: '0.5',
    interval: 'yearly',
    isActive: true,
    subscriberCount: 45,
    createdAt: '2024-02-01T09:15:00Z',
  },
];

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    planId: '1',
    planName: 'Premium Dev Tools',
    providerName: 'TechFlow',
    price: '0.05',
    interval: 'monthly',
    status: 'active',
    nextPaymentDate: '2024-03-15T10:00:00Z',
    subscribedAt: '2024-02-15T10:00:00Z',
  },
  {
    id: '2',
    planId: '2',
    planName: 'Analytics Pro',
    providerName: 'DataStream',
    price: '0.1',
    interval: 'monthly',
    status: 'active',
    nextPaymentDate: '2024-03-20T14:30:00Z',
    subscribedAt: '2024-02-20T14:30:00Z',
  },
];

const mockPaymentHistory: PaymentHistory[] = [
  {
    id: '1',
    planName: 'Premium Dev Tools',
    amount: '0.05',
    date: '2024-02-15T10:00:00Z',
    status: 'success',
    txHash: '0x1234...abcd',
  },
  {
    id: '2',
    planName: 'Analytics Pro',
    amount: '0.1',
    date: '2024-02-20T14:30:00Z',
    status: 'success',
    txHash: '0x5678...efgh',
  },
];

export const mockApi = {
  // Plans
  getPlans: async (): Promise<Plan[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPlans;
  },

  getPlansByProvider: async (providerId: string): Promise<Plan[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPlans.filter(plan => plan.providerId === providerId);
  },

  createPlan: async (planData: Omit<Plan, 'id' | 'subscriberCount' | 'createdAt'>): Promise<Plan> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newPlan: Plan = {
      ...planData,
      id: Date.now().toString(),
      subscriberCount: 0,
      createdAt: new Date().toISOString(),
    };
    mockPlans.push(newPlan);
    return newPlan;
  },

  // Subscriptions
  getSubscriptions: async (): Promise<Subscription[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockSubscriptions;
  },

  // Payment History
  getPaymentHistory: async (): Promise<PaymentHistory[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPaymentHistory;
  },

  // Providers
  getProviders: async (): Promise<Provider[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [
      {
        id: '1',
        name: 'TechFlow',
        email: 'contact@techflow.dev',
        walletAddress: '0x1234...abcd',
        createdAt: '2024-01-10T08:00:00Z',
      },
      {
        id: '2',
        name: 'DataStream',
        email: 'hello@datastream.io',
        walletAddress: '0x5678...efgh',
        createdAt: '2024-01-12T12:00:00Z',
      },
    ];
  },

  createProvider: async (providerData: Omit<Provider, 'id' | 'createdAt'>): Promise<Provider> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      ...providerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
  },
};