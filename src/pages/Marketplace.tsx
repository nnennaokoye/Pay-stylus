import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { PlanCard } from "../components/PlanCard";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useStreamPayContract } from "../hooks/useContract";
import { mockApi } from "../services/mockApi";
import { Plan } from "../types";
import { useWallet } from "../hooks/useWallet";

export const Marketplace: React.FC = () => {
  const { subscribe, isLoading } = useStreamPayContract();
  const { isConnected } = useWallet();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const allPlans = await mockApi.getPlans();
        const activePlans = allPlans.filter((plan) => plan.isActive);
        setPlans(activePlans);
        setFilteredPlans(activePlans);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    const filtered = plans.filter(
      (plan) =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlans(filtered);
  }, [searchTerm, plans]);

  const handleSubscribe = async (planId: string) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const plan = plans.find((p) => p.id === planId);
      if (plan) {
        const result = await subscribe(planId, plan.price);
        console.log("Subscription result:", result);
        // You can store the subscription ID in state or localStorage if needed
        if (result.subscriptionId) {
          localStorage.setItem(`subscription_${planId}`, result.subscriptionId);
        }
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
          <p className="text-gray-600">
            Discover and subscribe to amazing Web3 services
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>

        {!isConnected && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Connect your wallet to subscribe to plans
            </p>
          </div>
        )}

        {/* Plans Grid */}
        {loadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 h-64 rounded-xl"
              />
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">
              {searchTerm
                ? "No plans found matching your search"
                : "No plans available"}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSubscribe={handleSubscribe}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
