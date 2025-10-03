import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { ProviderOnboarding } from "./pages/ProviderOnboarding";
import { ProviderDashboard } from "./pages/ProviderDashboard";
import { Marketplace } from "./pages/Marketplace";
import { Wallet } from "./pages/Wallet";
import { Subscriptions } from "./pages/Subscriptions";
import SubscriptionTracker from "./components/SubscriptionTracker";
import { TestPage } from "./pages/TestPage";
import {
  PushUniversalWalletProvider,
  PushUniversalAccountButton,
  PushUI,
} from "@pushchain/ui-kit";

function App() {
  const walletConfig = {
    network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
    login: {
      email: false,
      google: false,
      wallet: {
        enabled: true,
      },
      appPreview: false,
    },
  };

  return (
    <PushUniversalWalletProvider config={walletConfig}>
      <Router>
        <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/provider/onboarding" element={<ProviderOnboarding />} />
          <Route path="/provider" element={<ProviderDashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/tracker" element={<SubscriptionTracker />} />
          <Route path="/test" element={<TestPage />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </Layout>
    </Router>
    </PushUniversalWalletProvider>
  );
}

export default App;
