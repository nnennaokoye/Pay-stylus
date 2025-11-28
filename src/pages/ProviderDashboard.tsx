import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Users, TrendingUp, Calendar } from "lucide-react";
import { StatsCard } from "../components/StatsCard";
import { PlanCard } from "../components/PlanCard";
import { EarningsChart } from "../components/EarningsChart";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { usePayStylusContract } from "../hooks/useContract";
import { useWallet } from "../hooks/useWallet";
import { Plan, RecentSubscriber, EarningsData } from "../types";

export const ProviderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { withdrawEarnings, isLoading, getAllPlansWithDetails, getProviderRecentSubscribers, getProviderEarningsData } =
    usePayStylusContract();
  const { address } = useWallet();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [recentSubscribers, setRecentSubscribers] = useState<RecentSubscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);
  const [earningsData, setEarningsData] = useState<EarningsData[]>([]);
  const [loadingEarnings, setLoadingEarnings] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;
      
      try {
        setLoadingPlans(true);
        setLoadingSubscribers(true);
        setLoadingEarnings(true);
        console.log("🔄 Fetching dashboard data from contract...");

        const [contractPlans, subscribers, earnings] = await Promise.all([
          getAllPlansWithDetails(),
          getProviderRecentSubscribers(address, 10),
          getProviderEarningsData(address),
        ]);

        const providerPlans = contractPlans.filter(
          (plan) => plan.providerId.toLowerCase() === address.toLowerCase()
        );

        console.log(" Loaded provider plans from contract:", providerPlans.length);
        console.log(" Loaded recent subscribers from contract:", subscribers.length);
        console.log(" Loaded earnings data from contract:", earnings.length);
        
        setPlans(providerPlans);
        setRecentSubscribers(subscribers);
        setEarningsData(earnings);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setPlans([]);
        setRecentSubscribers([]);
        setEarningsData([]);
      } finally {
        setLoadingPlans(false);
        setLoadingSubscribers(false);
        setLoadingEarnings(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Deactivate plan not supported in current contract hook; hiding deactivate UI

  const handleWithdraw = async () => {
    try {
      await withdrawEarnings("1.8");
    } catch (error) {
      console.error("Failed to withdraw earnings:", error);
    }
  };

  const totalEarnings = plans.reduce((sum, plan) => {
    return sum + parseFloat(plan.price) * plan.subscriberCount;
  }, 0);

  const totalSubscribers = plans.reduce(
    (sum, plan) => sum + plan.subscriberCount,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Provider Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription plans and track earnings
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Escrowed"
            value={`${totalEarnings.toFixed(2)} ETH`}
            icon={DollarSign}
            trend={{ value: "+12.5%", isPositive: true }}
          />
          <StatsCard
            title="Withdrawable"
            value="1.8 ETH"
            subtitle="Available now"
            icon={TrendingUp}
          />
          <StatsCard
            title="Total Subscribers"
            value={totalSubscribers.toString()}
            icon={Users}
            trend={{ value: "+8", isPositive: true }}
          />
          <StatsCard
            title="Active Plans"
            value={plans.filter((p) => p.isActive).length.toString()}
            icon={Calendar}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Earnings Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Earnings Overview
                  </h2>
                  <Button
                    onClick={handleWithdraw}
                    disabled={isLoading}
                    size="sm"
                  >
                    Withdraw Available
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <EarningsChart data={earningsData} loading={loadingEarnings} />
              </CardContent>
            </Card>

            {/* Recent Subscribers Table */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Subscribers
                </h2>
              </CardHeader>
              <CardContent>
                {loadingSubscribers ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 h-16 rounded" />
                    ))}
                  </div>
                ) : recentSubscribers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No subscribers yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                            Address
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                            Plan
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentSubscribers.map((subscriber, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                              {subscriber.user.slice(0, 6)}...{subscriber.user.slice(-4)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                              {subscriber.planName}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">
                              {new Date(subscriber.timestamp).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                              {subscriber.amount} ETH
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Plans */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Plans
            </h2>
            {loadingPlans ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-200 h-48 rounded-xl"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isProvider
                    isLoading={isLoading}
                  />
                ))}
                {plans.length === 0 && (
                  <Card>
                    <CardContent>
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">
                          No plans created yet
                        </p>
                        <Button
                          onClick={() => navigate("/provider/onboarding")}
                          variant="outline"
                        >
                          Create Your First Plan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
