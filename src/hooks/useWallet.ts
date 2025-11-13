import { useCallback, useMemo, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

export const useWallet = () => {
  const appKit = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      await appKit?.open?.();
    } catch (error) {
      console.error("Failed to open wallet modal", error);
      toast.error("Failed to connect wallet");
    }
  }, [appKit]);

  const disconnectWallet = useCallback(async () => {
    try {
      // AppKit doesn't have a direct disconnect method, users can manually disconnect from the modal
      await appKit?.close?.();
      toast.success("Wallet disconnected");
    } catch (error) {
      console.error("Failed to disconnect wallet", error);
      toast.error("Failed to disconnect wallet");
    }
  }, [appKit]);

  return useMemo(
    () => ({
      isConnected: mounted && isConnected,
      address: address || null,
      isConnecting: false,
      connectWallet,
      disconnectWallet,
    }),
    [mounted, isConnected, address, connectWallet, disconnectWallet]
  );
};