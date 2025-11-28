import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { usePayStylusContract } from "../hooks/useContract";
import { useWallet } from "../hooks/useWallet";

export const ProviderOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { registerProvider, createPlan } =
    usePayStylusContract();
  const { isConnected, address } = useWallet();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    planName: "",
    planDescription: "",
    price: "",
    interval: "monthly" as "monthly" | "yearly",
  });

  const intervalSeconds =
    formData.interval === "monthly" ? 30 * 24 * 60 * 60 : 365 * 24 * 60 * 60;

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Provider name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.planName.trim()) newErrors.planName = "Plan name is required";
    if (!formData.planDescription.trim())
      newErrors.planDescription = "Plan description is required";
    if (!formData.price.trim()) newErrors.price = "Price is required";
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Price must be a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      setErrors({ general: "Please connect your wallet first" });
      return;
    }

    if (!validateForm()) return;

    try {
      console.log(" Starting provider registration process...");
      setErrors({});

      // Step 1: Register provider on blockchain FIRST
      console.log(" Step 1: Registering provider on blockchain...");
      const registerTx = await registerProvider(formData.name);
      console.log(" Provider registered on blockchain:", registerTx.hash);

      // Step 2: Create plan on blockchain
      console.log(" Step 2: Creating plan on blockchain...");
      const planTx = await createPlan(formData.price, intervalSeconds, "");
      console.log(" Plan created on blockchain:", planTx.transactionHash);

      console.log(" Provider registration complete!");
      navigate("/provider");
    } catch (error: any) {
      console.error(" Provider registration failed:", error);

      let errorMessage = "Failed to create provider account. Please try again.";
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message?.includes("user rejected")) {
        errorMessage =
          "Transaction was rejected. Please try again and approve the transaction.";
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for transaction.";
      }

      setErrors({ general: errorMessage });
    }
  };

  const intervalOptions = [
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Wallet Connection Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please connect your wallet to register as a provider.
              </p>
              <Button onClick={() => navigate("/")} variant="outline">
                Go Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-gray-900">
              Register as Provider
            </h1>
            <p className="text-gray-600 mt-2">
              Create your provider account and set up your first subscription
              plan.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Provider Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  error={errors.name}
                  placeholder="Your Company Name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={errors.email}
                  placeholder="contact@company.com"
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Create Your First Plan
                </h3>

                <div className="space-y-4">
                  <Input
                    label="Plan Name"
                    value={formData.planName}
                    onChange={(e) =>
                      handleInputChange("planName", e.target.value)
                    }
                    error={errors.planName}
                    placeholder="Premium Access"
                  />

                  <Input
                    label="Plan Description"
                    value={formData.planDescription}
                    onChange={(e) =>
                      handleInputChange("planDescription", e.target.value)
                    }
                    error={errors.planDescription}
                    placeholder="Describe what subscribers will get..."
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Price (ETH)"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      error={errors.price}
                      placeholder="0.05"
                      step="0.001"
                    />
                    <Select
                      label="Billing Interval"
                      value={formData.interval}
                      onChange={(e) =>
                        handleInputChange("interval", e.target.value)
                      }
                      options={intervalOptions}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Connected Wallet:</strong> {address?.slice(0, 6)}...
                  {address?.slice(-4)}
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full">
                Create Provider Account & Plan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
