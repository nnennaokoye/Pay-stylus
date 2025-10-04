import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';

// Simplified wallet connection hook
// In production, this would use Wagmi/RainbowKit
export const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet was previously connected
  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setIsConnected(true);
      setAddress(savedAddress);
    }
  }, []);

const connectWallet = async () => {
  setIsConnecting(true);
  try {
    if (!window.ethereum) throw new Error("No wallet found");

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const walletAddress = await signer.getAddress();

    setAddress(walletAddress);
    setIsConnected(true);
    localStorage.setItem("walletAddress", walletAddress);

    toast.success("Wallet connected successfully!");
  } catch (error) {
    console.error(error);
    toast.error("Failed to connect wallet");
  } finally {
    setIsConnecting(false);
  }
};


  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem('walletAddress');
    toast.success('Wallet disconnected');
  };

  return {
    isConnected,
    address,
    isConnecting,
    connectWallet,
    disconnectWallet,
  };
};