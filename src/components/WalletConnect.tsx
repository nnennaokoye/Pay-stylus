import React, { useEffect, useState } from "react";
import { useAppKit } from "@reown/appkit/react";
import { Button } from "./ui/Button";
import { Wallet, LogOut } from "lucide-react";
import { useWallet } from "../hooks/useWallet";

export const WalletConnect: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const appKit = useAppKit();
  const { isConnected, address, disconnectWallet } = useWallet();

  useEffect(() => setMounted(true), []);

  const openModal = async () => {
    await appKit?.open?.();
  };

  const chainId = (appKit as any)?.state?.network?.chainId as number | undefined;
  const networkName = chainId === 421614 ? "Arbitrum Sepolia" : chainId ? `Chain ${chainId}` : "Unknown";

  if (!mounted) return <div className="h-9" />;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          {networkName}
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnectWallet()}
          className="border-primary/20 hover:bg-primary/10"
        >
          <LogOut className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={openModal}
      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transform hover:scale-105 transition-all duration-200"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  );
};
