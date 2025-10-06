import React, { useState, useEffect } from "react";
import { useStreamPayContract } from "../hooks/useContract";
import { useWallet } from "../hooks/useWallet";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export const TestPage: React.FC = () => {
  const {
    subscribe,
    registerProvider,
    createPlan,
    getAllPlans,
    getUserBalance,
    isProviderRegistered,
    isLoading,
  } = useStreamPayContract();

  const { isConnected, address } = useWallet();
  const [plans, setPlans] = useState<any[]>([]);
  const [balance, setBalance] = useState<string>("0");
  const [providerName, setProviderName] = useState<string>("");
  const [isProvider, setIsProvider] = useState<boolean>(false);
  const [subscriptionIds, setSubscriptionIds] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (isConnected) {
      loadData();
      loadSubscriptionIds();
    }
  }, [isConnected]);

  const loadData = async () => {
    try {
      const [planIds, userBalance, providerStatus] = await Promise.all([
        getAllPlans(),
        getUserBalance(),
        isProviderRegistered(),
      ]);

      setPlans(planIds.map((id: any) => ({ id: id.toString() })));
      setBalance(userBalance);
      setIsProvider(providerStatus);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const loadSubscriptionIds = () => {
    const storedIds: { [key: string]: string } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("subscription_")) {
        const value = localStorage.getItem(key);
        if (value) {
          storedIds[key] = value;
        }
      }
    }
    setSubscriptionIds(storedIds);
  };

  const handleRegisterProvider = async () => {
    if (!providerName.trim()) return;
    try {
      await registerProvider(providerName);
      setIsProvider(true);
      setProviderName("");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleCreatePlan = async () => {
    try {
      await createPlan("0.01", 60, "test-plan-hash"); // 60 second interval for testing
      await loadData();
    } catch (error) {
      console.error("Plan creation failed:", error);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const result = await subscribe(planId, "0.01");
      if (result.subscriptionId) {
        localStorage.setItem(`subscription_${planId}`, result.subscriptionId);
        loadSubscriptionIds();
      }
      await loadData();
    } catch (error) {
      console.error("Subscription failed:", error);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Card>
          <CardContent>
            <p className="text-center text-gray-600">
              Please connect your wallet to continue
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">StreamPay Test Page</h1>
          <p className="text-gray-600">Test all contract functions</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Address: {address}</div>
            <div>Balance: {balance} ETH</div>
            <div>Provider: {isProvider ? "Yes" : "No"}</div>
            <div>Plans Available: {plans.length}</div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Registration */}
      {!isProvider && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Register as Provider</h2>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Provider name"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleRegisterProvider}
                disabled={isLoading || !providerName.trim()}
              >
                Register
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Creation */}
      {isProvider && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Create Test Plan</h2>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreatePlan} disabled={isLoading}>
              Create 0.01 ETH Plan (60s interval)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Available Plans</h2>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <p className="text-gray-500">No plans available</p>
          ) : (
            <div className="space-y-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <span>Plan #{plan.id}</span>
                  <Button
                    size="sm"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading}
                  >
                    Subscribe (0.01 ETH)
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription IDs */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Your Subscription IDs</h2>
          <Button size="sm" onClick={loadSubscriptionIds}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {Object.keys(subscriptionIds).length === 0 ? (
            <p className="text-gray-500">No subscription IDs found</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(subscriptionIds).map(([key, value]) => (
                <div
                  key={key}
                  className="p-2 bg-blue-50 rounded font-mono text-sm"
                >
                  <div className="font-semibold text-blue-800">{key}</div>
                  <div className="text-blue-600">ID: {value}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
