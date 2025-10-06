import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

// Simple component to display and test subscription IDs
export const SubscriptionTracker: React.FC = () => {
  const [subscriptionIds, setSubscriptionIds] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Check localStorage for new subscription IDs
      const storedIds: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("subscription_")) {
          const value = localStorage.getItem(key);
          if (value) {
            storedIds.push(`${key}: ${value}`);
          }
        }
      }
      setSubscriptionIds(storedIds);
    }, 60000); // Update every 60 seconds

    return () => clearInterval(interval);
  }, [isRunning]);

  const clearSubscriptionIds = () => {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("subscription_")
    );
    keys.forEach((key) => localStorage.removeItem(key));
    setSubscriptionIds([]);
  };

  const addTestSubscription = () => {
    const testId = `test_${Date.now()}`;
    const planId = Math.floor(Math.random() * 3) + 1;
    localStorage.setItem(`subscription_plan_${planId}`, testId);
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <h3 className="text-lg font-semibold">Subscription ID Tracker</h3>
        <p className="text-sm text-gray-600">
          Testing subscription ID capture and display
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              variant={isRunning ? "destructive" : "default"}
              size="sm"
            >
              {isRunning ? "Stop Tracking" : "Start Tracking"}
            </Button>
            <Button onClick={addTestSubscription} variant="outline" size="sm">
              Add Test ID
            </Button>
            <Button onClick={clearSubscriptionIds} variant="outline" size="sm">
              Clear All
            </Button>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-sm mb-2">
              Stored Subscription IDs:
            </h4>
            {subscriptionIds.length === 0 ? (
              <p className="text-gray-500 text-sm">No subscription IDs found</p>
            ) : (
              <div className="space-y-1">
                {subscriptionIds.map((id, index) => (
                  <div
                    key={index}
                    className="text-xs font-mono bg-white p-1 rounded"
                  >
                    {id}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500">
            <p>• This tracker shows subscription IDs stored in localStorage</p>
            <p>• Real IDs will appear here after successful subscriptions</p>
            <p>• The tracker updates every 60 seconds when running</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionTracker;
