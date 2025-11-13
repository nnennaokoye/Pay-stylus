import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// Arbitrum Sepolia network config
const ARBITRUM_SEPOLIA = {
  id: 421614,
  name: "Arbitrum Sepolia",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_ARBITRUM_SEPOLIA_RPC_URL || "https://arb-sepolia.g.alchemy.com/v2/demo"],
    },
    public: {
      http: [import.meta.env.VITE_ARBITRUM_SEPOLIA_RPC_URL || "https://arb-sepolia.g.alchemy.com/v2/demo"],
    },
  },
  blockExplorers: {
    default: { name: "Arbiscan", url: "https://sepolia.arbiscan.io" },
  },
  testnet: true,
} as any;

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id";
const appUrl = typeof window !== "undefined" ? window.location.origin : "https://paystylus.app";

// Build Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [ARBITRUM_SEPOLIA],
  projectId,
});

// Export wagmi config if needed elsewhere
export const wagmiConfig = wagmiAdapter.wagmiConfig;

// Initialize AppKit
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [ARBITRUM_SEPOLIA],
  projectId,
  features: {
    email: true,
    socials: ["google", "x", "github", "discord", "apple", "facebook", "farcaster"],
    emailShowWallets: true,
  },
  allWallets: "SHOW",
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#4F46E5",
    "--w3m-color-mix": "#4F46E5",
    "--w3m-color-mix-strength": 40,
    "--w3m-border-radius-master": "12px",
    "--w3m-font-family": "Inter, system-ui, sans-serif",
  },
  metadata: {
    name: "PayStylus",
    description: "Trustless Web3 subscription payments on Arbitrum",
    url: appUrl,
    icons: [`${appUrl}/vite.svg`],
  },
});
