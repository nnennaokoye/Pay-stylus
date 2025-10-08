# 🚀 Provider Analytics GraphQL Queries

These queries are designed to work with your deployed subgraph and provide comprehensive provider analytics.

## 📊 Core Provider Queries

### 1. Provider Dashboard Overview
```graphql
query ProviderOverview($providerAddress: String!) {
  provider(id: $providerAddress) {
    id
    name
    address
    registeredAt
    totalPlans
    totalSubscriptions
    totalRevenue
    totalEarnings
    isActive
    lastActivityAt
    monthlyRevenue
    weeklyRevenue
    avgRevenuePerSubscription
  }
}
```

### 2. Provider's Plans Performance
```graphql
query ProviderPlans($providerAddress: String!) {
  provider(id: $providerAddress) {
    plans(orderBy: totalRevenue, orderDirection: desc) {
      id
      planId
      price
      interval
      createdAt
      totalSubscriptions
      activeSubscriptions
      totalRevenue
      
      subscriptions(first: 5, orderBy: createdAt, orderDirection: desc) {
        subscriptionId
        subscriber
        isActive
        createdAt
        totalPaid
      }
    }
  }
}
```

### 3. Recent Provider Earnings
```graphql
query ProviderEarnings($providerAddress: String!, $limit: Int = 20) {
  providerEarnings(
    where: { provider: $providerAddress }
    orderBy: timestamp
    orderDirection: desc
    first: $limit
  ) {
    id
    amount
    timestamp
    earningType
    cumulativeEarnings
    transactionHash
    
    plan {
      planId
      price
    }
  }
}
```

### 4. Active Subscriptions for Provider
```graphql
query ProviderActiveSubscriptions($providerAddress: String!) {
  userSubscriptions(
    where: { 
      plan_: { provider: $providerAddress }
      isActive: true 
    }
    orderBy: createdAt
    orderDirection: desc
  ) {
    id
    subscriptionId
    subscriber
    isActive
    totalPaid
    paymentCount
    createdAt
    lastPaymentAt
    
    plan {
      planId
      price
      interval
    }
  }
}
```

### 5. Payment History for Provider
```graphql
query ProviderPayments($providerAddress: String!, $limit: Int = 50) {
  payments(
    where: { 
      subscription_: { 
        plan_: { provider: $providerAddress } 
      } 
    }
    orderBy: timestamp
    orderDirection: desc
    first: $limit
  ) {
    id
    amount
    timestamp
    isRecurring
    paymentIndex
    transactionHash
    
    subscription {
      subscriptionId
      subscriber
      
      plan {
        planId
        price
      }
    }
  }
}
```

## 🎯 Plan-Specific Queries

### 6. Plan Performance Analysis
```graphql
query PlanAnalytics($planId: String!) {
  plan(id: $planId) {
    id
    planId
    price
    interval
    createdAt
    totalSubscriptions
    activeSubscriptions
    totalRevenue
    
    provider {
      name
      address
    }
    
    subscriptions(first: 100) {
      subscriptionId
      subscriber
      isActive
      totalPaid
      paymentCount
      createdAt
    }
  }
}
```

### 7. Subscription Details
```graphql
query SubscriptionDetails($subscriptionId: String!) {
  userSubscription(id: $subscriptionId) {
    id
    subscriptionId
    subscriber
    isActive
    totalPaid
    paymentCount
    createdAt
    lastPaymentAt
    nextPaymentDue
    status
    
    plan {
      planId
      price
      interval
      
      provider {
        name
        address
      }
    }
    
    payments(orderBy: timestamp, orderDirection: desc) {
      amount
      timestamp
      isRecurring
      paymentIndex
      transactionHash
    }
  }
}
```

## 📈 Platform Analytics

### 8. Top Performing Providers
```graphql
query TopProviders($limit: Int = 10) {
  providers(
    orderBy: totalRevenue
    orderDirection: desc
    first: $limit
    where: { totalSubscriptions_gt: 0 }
  ) {
    id
    name
    totalPlans
    totalSubscriptions
    totalRevenue
    monthlyRevenue
    isActive
    lastActivityAt
  }
}
```

### 9. Recent Platform Activity
```graphql
query RecentActivity($limit: Int = 20) {
  userSubscriptions(
    orderBy: createdAt
    orderDirection: desc
    first: $limit
  ) {
    subscriptionId
    subscriber
    createdAt
    
    plan {
      planId
      price
      
      provider {
        name
      }
    }
  }
}
```

### 10. All Available Plans (Marketplace)
```graphql
query AllPlans($limit: Int = 50) {
  plans(
    orderBy: createdAt
    orderDirection: desc
    first: $limit
  ) {
    id
    planId
    price
    interval
    createdAt
    totalSubscriptions
    activeSubscriptions
    totalRevenue
    
    provider {
      name
      address
    }
  }
}
```

## 🔧 JavaScript Integration Examples

### Basic Query Function
```javascript
const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/120327/subscription-escrow-subgraph/v0.0.3';

const querySubgraph = async (query, variables = {}) => {
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error(data.errors[0].message);
    }

    return data.data;
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
};

// Example usage
const fetchProviderData = async (providerAddress) => {
  const query = `
    query ProviderOverview($providerAddress: String!) {
      provider(id: $providerAddress) {
        name
        totalRevenue
        totalSubscriptions
        totalPlans
      }
    }
  `;

  return await querySubgraph(query, { providerAddress });
};
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useProviderData = (providerAddress) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchProviderData(providerAddress);
        setData(result.provider);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (providerAddress) {
      fetchData();
    }
  }, [providerAddress]);

  return { data, loading, error };
};
```

### Real-time Data Refresh
```javascript
// Polling for real-time updates
const useRealtimeProviderData = (providerAddress, refreshInterval = 30000) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchProviderData(providerAddress);
        setData(result.provider);
      } catch (error) {
        console.error('Failed to fetch provider data:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [providerAddress, refreshInterval]);

  return data;
};
```

## 🚀 Quick Test Queries

### Test if Provider Exists
```graphql
query CheckProvider($address: String!) {
  provider(id: $address) {
    id
    name
    totalPlans
  }
}
```

### Get All Providers
```graphql
query AllProviders {
  providers(first: 10) {
    id
    name
    totalPlans
    totalSubscriptions
    totalRevenue
  }
}
```

### Get Recent Payments
```graphql
query RecentPayments {
  payments(orderBy: timestamp, orderDirection: desc, first: 10) {
    amount
    timestamp
    transactionHash
    subscription {
      subscriptionId
      plan {
        provider {
          name
        }
      }
    }
  }
}
```

## 📝 Usage Notes

1. **Replace provider addresses** with actual registered provider addresses
2. **Use lowercase addresses** for GraphQL queries (Ethereum addresses)
3. **Monitor query performance** - limit results appropriately
4. **Handle errors gracefully** in your frontend
5. **Cache results** when appropriate to reduce API calls

Your subgraph endpoint: `https://api.studio.thegraph.com/query/120327/subscription-escrow-subgraph/v0.0.3`
