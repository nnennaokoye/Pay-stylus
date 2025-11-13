import React, { useState, useEffect } from "react";
import { Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { usePayStylusContract } from "../hooks/useContract";
import { mockApi } from "../services/mockApi";
import { Subscription, PaymentHistory } from "../types";
import { useWallet } from "../hooks/useWallet";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

export const Subscriptions: React.FC = () => {
  const { isLoading } =
    usePayStylusContract();
  const { isConnected } = useWallet();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [userSubscriptionIds, setUserSubscriptionIds] = useState<{
    [planId: string]: string;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected) return;

      try {
        // Load all localStorage subscription keys
        const subscriptionKeys = Object.keys(localStorage).filter(
          (key) => key.startsWith("subscription_") && !key.includes("plan_")
        );

        console.log(
          "🔍 Found subscription keys in localStorage:",
          subscriptionKeys
        );

        // Create real subscriptions from localStorage + plans data
        const [mockSubs, history, allPlans] = await Promise.all([
          mockApi.getSubscriptions(),
          mockApi.getPaymentHistory(),
          mockApi.getPlans(), // Get all available plans
        ]);

        // Build real subscriptions from localStorage
        const realSubscriptions: Subscription[] = [];
        const storedIds: { [planId: string]: string } = {};

        subscriptionKeys.forEach((key) => {
          const planId = key.replace("subscription_", "");
          const subscriptionId = localStorage.getItem(key);

          if (subscriptionId && planId) {
            // Find the plan details from available plans
            let plan = allPlans.find((p) => p.id === planId);

            // If no matching plan found, create a fallback subscription entry
            if (!plan) {
              // Check if this might be a test/custom subscription
              console.log(
                `⚠️ Plan ID ${planId} not found in available plans, creating fallback`
              );
              plan = {
                id: planId,
                providerId: "unknown",
                providerName: "Custom Provider",
                name: `Custom Plan ${planId.slice(-6)}`, // Show last 6 chars
                description: "Custom subscription plan",
                price: "0.05", // Default price
                interval: "monthly",
                isActive: true,
                subscriberCount: 1,
                createdAt: new Date().toISOString(),
              };
            }

            realSubscriptions.push({
              id: subscriptionId,
              planId: planId,
              planName: plan.name,
              providerName: plan.providerName,
              price: plan.price,
              interval: plan.interval,
              status: "active", // Assume active for now
              nextPaymentDate: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(), // 30 days from now
              subscribedAt: new Date().toISOString(), // Current time as fallback
            });
            storedIds[planId] = subscriptionId;
          }
        });

        console.log("✅ Real subscriptions found:", realSubscriptions);
        console.log("📊 Stored subscription IDs:", storedIds);

        // Use real subscriptions if any, otherwise fall back to mock data
        if (realSubscriptions.length > 0) {
          setSubscriptions(realSubscriptions);
          console.log(
            "🎉 Displaying real subscriptions:",
            realSubscriptions.length
          );
        } else {
          setSubscriptions(mockSubs);
          console.log("📋 No real subscriptions found, showing mock data");

          // Load subscription IDs for mock data too
          mockSubs.forEach((sub) => {
            const storedId = localStorage.getItem(`subscription_${sub.planId}`);
            if (storedId) {
              storedIds[sub.planId] = storedId;
            }
          });
        }

        setPaymentHistory(history);
        setUserSubscriptionIds(storedIds);
      } catch (error) {
        console.error("Failed to fetch subscription data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [isConnected]);

  const handleCancelSubscription = async (planId: string) => {
    try {
      // Mock implementation - simulate cancellation
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.planId === planId ? { ...sub, status: "cancelled" } : sub
        )
      );
      // Here you would call the actual contract function if available
      // For now, this is handled via localStorage
      localStorage.removeItem(`subscription_${planId}`);
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "expired":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent>
            <div className="text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Wallet Connection Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please connect your wallet to view your subscriptions.
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Subscriptions
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your active subscriptions and payment history
              </p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center space-x-2"
            >
              🔄 Refresh
            </Button>
          </div>

          {/* Debug info - remove this later */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <div className="font-medium text-blue-900 mb-2">🔍 Debug Info:</div>
            <div className="space-y-1 text-blue-800 font-mono text-xs">
              <div>✅ Subscriptions loaded: {subscriptions.length}</div>
              <div>
                🆔 Subscription IDs found:{" "}
                {Object.keys(userSubscriptionIds).length}
              </div>
              <div>📦 localStorage subscription keys:</div>
              <div className="ml-4">
                {Object.keys(localStorage)
                  .filter((k) => k.includes("subscription"))
                  .map((key) => (
                    <div key={key}>
                      • {key}: {localStorage.getItem(key)}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {loadingData ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 h-32 rounded-xl"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Subscriptions */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Active Subscriptions
              </h2>
              {subscriptions.length === 0 ? (
                <Card>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">
                        No active subscriptions
                      </p>
                      <Button
                        onClick={() => (window.location.href = "/marketplace")}
                        variant="outline"
                      >
                        Browse Marketplace
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <Card key={subscription.id}>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {subscription.planName}
                              </h3>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                  subscription.status
                                )}`}
                              >
                                {subscription.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {subscription.providerName}
                            </p>
                            <div className="space-y-1">
                              {userSubscriptionIds[subscription.planId] && (
                                <p className="text-xs text-blue-600 font-mono">
                                  🆔 Subscription ID:{" "}
                                  {userSubscriptionIds[subscription.planId]}
                                </p>
                              )}
                              {subscription.id &&
                                subscription.id !== subscription.planId && (
                                  <p className="text-xs text-green-600 font-mono">
                                    ✅ Blockchain ID: {subscription.id}
                                  </p>
                                )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                {subscription.price} ETH /{" "}
                                {subscription.interval}
                              </span>
                              <span>•</span>
                              <span>
                                Next payment:{" "}
                                {new Date(
                                  subscription.nextPaymentDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {subscription.status === "active" && (
                              <Button
                                // variant="danger"
                                size="sm"
                                onClick={() =>
                                  handleCancelSubscription(subscription.planId)
                                }
                                // isLoading={isLoading}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Payment History */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Payment History
              </h2>
              <Card>
                <CardContent>
                  {paymentHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No payment history yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paymentHistory.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {payment.status === "success" ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {payment.planName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(payment.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {payment.amount} ETH
                            </p>
                            <p
                              className={`text-sm capitalize ${getPaymentStatusColor(
                                payment.status
                              )}`}
                            >
                              {payment.status}
                            </p>
                            {payment.txHash && (
                              <p className="text-xs text-gray-400 font-mono">
                                {payment.txHash}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        )}

        {/* Deposit Modal */}
        <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit ETH to Escrow</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.1"
                step="0.001"
              />

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  Deposited ETH will be used automatically for your subscription
                  payments. You can withdraw unused funds at any time.
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
                  // onClick={handleDeposit}
                  disabled={
                    isLoading || !depositAmount || isNaN(Number(depositAmount))
                  }
                  className="flex-1"
                >
                  {isLoading ? "Depositing..." : "Deposit"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
