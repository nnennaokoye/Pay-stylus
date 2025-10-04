import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  CONTRACT_CONFIG,
  CONTRACT_FUNCTIONS,
  CONTRACT_ERRORS,
} from "../contracts/contractconfig";
import { useWallet } from "./useWallet";

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useStreamPayContract = () => {
  const { isConnected, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize provider and contract
  const getContract = async () => {
    if (!isConnected) throw new Error(CONTRACT_ERRORS.Unauthorized);

    console.log("🔗 Initializing blockchain connection...");

    // Ensure MetaMask is connected to the right network
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const network = await provider.getNetwork();
    console.log(
      "📡 Connected to network:",
      network.name,
      "Chain ID:",
      network.chainId.toString()
    );

    if (network.chainId !== BigInt(CONTRACT_CONFIG.NETWORK_ID)) {
      console.log("🔄 Wrong network detected, attempting to switch...");
      try {
        // Try to switch to Arbitrum Sepolia
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${CONTRACT_CONFIG.NETWORK_ID.toString(16)}` }], // Convert to hex
        });
        console.log("✅ Network switched successfully");
        // Retry getting the network
        const newNetwork = await provider.getNetwork();
        console.log(
          "📡 Now connected to:",
          newNetwork.name,
          "Chain ID:",
          newNetwork.chainId.toString()
        );
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          // Network not added to MetaMask, let's add it
          console.log("🔧 Network not found, adding Arbitrum Sepolia...");
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${CONTRACT_CONFIG.NETWORK_ID.toString(16)}`,
                  chainName: "Arbitrum Sepolia",
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: [CONTRACT_CONFIG.NETWORK_RPC_URL],
                  blockExplorerUrls: ["https://sepolia.arbiscan.io"],
                },
              ],
            });
            console.log("✅ Arbitrum Sepolia network added and switched");
          } catch (addError) {
            console.error("❌ Failed to add network:", addError);
            throw new Error(
              "Please manually add Arbitrum Sepolia network to MetaMask"
            );
          }
        } else {
          console.error("❌ Failed to switch network:", switchError);
          throw new Error(
            `Please switch to Arbitrum Sepolia (Chain ID: ${CONTRACT_CONFIG.NETWORK_ID}) in MetaMask`
          );
        }
      }
    }

    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log("👤 Signer address:", signerAddress);

    // Verify the contract exists
    const code = await provider.getCode(CONTRACT_CONFIG.CONTRACT_ADDRESS);
    if (code === "0x") {
      throw new Error("Contract not found at the specified address");
    }
    console.log("✅ Contract verified at:", CONTRACT_CONFIG.CONTRACT_ADDRESS);

    return new ethers.Contract(
      CONTRACT_CONFIG.CONTRACT_ADDRESS,
      CONTRACT_CONFIG.CONTRACT_ABI,
      signer
    );
  };

  // Register a provider on-chain
  const registerProvider = async (name: string) => {
    setIsLoading(true);
    try {
      console.log("🔗 Getting contract for provider registration...");
      const contract = await getContract();

      console.log("📋 Contract details:");
      console.log("  - Address:", contract.target);
      console.log("  - Function:", CONTRACT_FUNCTIONS.ProviderRegister);
      console.log("  - Provider name:", name);

      console.log("📤 Sending registration transaction...");
      const tx = await contract[CONTRACT_FUNCTIONS.ProviderRegister](name, {
        gasLimit: 300000, // Add explicit gas limit
      });

      console.log("✅ Transaction sent:", tx.hash);
      console.log("⏳ Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log("🎉 Provider registration confirmed!");
      console.log("📋 Receipt:", receipt);

      // VERIFY the transaction actually exists on blockchain
      console.log("🔍 Verifying transaction on blockchain...");
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const verifyTx = await provider.getTransaction(tx.hash);
      if (!verifyTx) {
        throw new Error(
          "Transaction not found on blockchain! This means it was only simulated locally."
        );
      }
      console.log(
        "✅ Transaction verified on blockchain:",
        verifyTx.blockNumber
      );

      toast.success("Provider registered successfully!");
      return tx;
    } catch (error: any) {
      console.error("❌ Provider registration failed:", error);
      console.error("Error details:", {
        message: error.message,
        reason: error.reason,
        code: error.code,
        data: error.data,
      });

      let errorMessage = "Failed to register provider";
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Transaction rejected by user";
      }

      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a plan on-chain
  const createPlan = async (
    price: string,
    interval: number,
    metadataHash: string
  ) => {
    setIsLoading(true);
    try {
      console.log("🔗 Getting contract for plan creation...");
      const contract = await getContract();
      const priceWei = ethers.parseEther(price); // Convert ETH to Wei

      console.log("📋 Plan creation details:");
      console.log("  - Price (ETH):", price);
      console.log("  - Price (Wei):", priceWei.toString());
      console.log("  - Interval (seconds):", interval);
      console.log("  - Metadata hash:", metadataHash);
      console.log("  - Function:", CONTRACT_FUNCTIONS.CreatePlan);

      console.log("📤 Sending plan creation transaction...");
      const tx = await contract[CONTRACT_FUNCTIONS.CreatePlan](
        priceWei,
        interval,
        metadataHash,
        {
          gasLimit: 300000, // Add explicit gas limit
        }
      );

      console.log("✅ Transaction sent:", tx.hash);
      console.log("⏳ Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log("🎉 Plan creation confirmed!");
      console.log("📋 Receipt:", receipt);

      // VERIFY the transaction actually exists on blockchain
      console.log("🔍 Verifying transaction on blockchain...");
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const verifyTx = await provider.getTransaction(tx.hash);
      if (!verifyTx) {
        throw new Error(
          "Transaction not found on blockchain! This means it was only simulated locally."
        );
      }
      console.log(
        "✅ Transaction verified on blockchain:",
        verifyTx.blockNumber
      );

      toast.success("Plan created successfully!");
      return receipt;
    } catch (error: any) {
      console.error("❌ Plan creation failed:", error);
      console.error("Error details:", {
        message: error.message,
        reason: error.reason,
        code: error.code,
        data: error.data,
      });

      let errorMessage = "Failed to create plan";
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Transaction rejected by user";
      }

      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to a plan
  const subscribe = async (planId: string, price: string) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      console.log("🎯 Starting subscription process...");
      console.log("Plan ID:", planId, "Price:", price);
      console.log("Contract address:", CONTRACT_CONFIG.CONTRACT_ADDRESS);
      console.log("Wallet address:", address);

      // Check if we have enough balance first
      const walletBalance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      console.log("Wallet balance:", ethers.formatEther(walletBalance), "ETH");

      // The subscribe function returns the subscription ID directly
      console.log("📝 Calling contract.subscribe...");
      console.log("Function name:", CONTRACT_FUNCTIONS.Subscribe);
      console.log("Parameters:", { planId, value: ethers.parseEther(price) });

      const tx = await contract[CONTRACT_FUNCTIONS.Subscribe](planId, {
        value: ethers.parseEther(price),
        gasLimit: 500000, // Add explicit gas limit
      });

      console.log("✅ Transaction sent:", tx.hash);
      console.log("⏳ Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt);

      // Try to get subscription ID from events (if available)
      let subscriptionId = null;
      try {
        console.log("Parsing transaction logs for subscription ID...");
        console.log("Number of logs:", receipt.logs.length);

        for (let i = 0; i < receipt.logs.length; i++) {
          const log = receipt.logs[i];
          console.log(`Log ${i}:`, log);

          try {
            const parsed = contract.interface.parseLog(log);
            console.log(`Parsed log ${i}:`, parsed);

            if (parsed && parsed.name === "SubscriptionCreated") {
              subscriptionId = parsed.args.subscriptionId?.toString();
              console.log("✅ Found subscription ID:", subscriptionId);
              break;
            }
          } catch (e) {
            console.log(`Could not parse log ${i}:`, e);
          }
        }
      } catch (e) {
        console.warn("Could not parse events:", e);
      }

      // If we couldn't get it from events, use a fallback
      if (!subscriptionId) {
        console.log(
          "⚠️ Could not get subscription ID from events, using fallback"
        );
        // For now, let's just use a simple increment - in a real app you'd query the contract
        subscriptionId = "unknown_" + Date.now().toString().slice(-6);
      }

      console.log("Subscription ID:", subscriptionId);
      toast.success(
        `Subscribed successfully! Subscription ID: ${subscriptionId}`
      );

      return { tx, subscriptionId, receipt };
    } catch (error: any) {
      console.error("❌ Subscription failed:", error);
      console.error("Error details:", {
        message: error.message,
        reason: error.reason,
        code: error.code,
        data: error.data,
      });

      let errorMessage = "Failed to subscribe";
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds";
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Transaction rejected by user";
      }

      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw earnings
  const withdrawEarnings = async (amount: string) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      const amountWei = ethers.parseEther(amount);
      const tx = await contract[CONTRACT_FUNCTIONS.WithdrawBalance](amountWei);
      await tx.wait();
      toast.success("Withdraw successful!");
      return tx;
    } catch (error: any) {
      console.error(error);
      toast.error(error?.reason || "Failed to withdraw");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get user balance
  const getUserBalance = async () => {
    try {
      const contract = await getContract();
      const balance = await contract[CONTRACT_FUNCTIONS.UserBalance](address);
      return ethers.formatEther(balance);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to fetch balance");
      throw error;
    }
  };

  // Process subscription payments (only for admin/provider)
  const processPayments = async (subscriptionId: string) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract[CONTRACT_FUNCTIONS.ProcessPayments](
        subscriptionId
      );
      await tx.wait();
      toast.success("Payment processed successfully!");
      return tx;
    } catch (error: any) {
      console.error(error);
      toast.error(error?.reason || "Failed to process payment");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const Deposite = async (amount: string) => {
    setIsLoading(true);
    try {
      const contract = await getContract();

      // Send ETH value along with the tx
      const tx = await contract[CONTRACT_FUNCTIONS.Deposite]({
        value: ethers.parseEther(amount),
      });

      await tx.wait();
      toast.success("Deposit successful!");
      return tx;
    } catch (error: any) {
      console.error(error);
      toast.error(error?.reason || "Failed to deposit");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all plans
  const getAllPlans = async () => {
    try {
      const contract = await getContract();
      const plans = await contract[CONTRACT_FUNCTIONS.AllPlans]();
      return plans;
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to fetch plans");
      throw error;
    }
  };

  // Check if current address is a registered provider
  const isProviderRegistered = async (providerAddress?: string) => {
    try {
      const contract = await getContract();
      const addressToCheck = providerAddress || address;
      if (!addressToCheck) return false;

      const isRegistered = await contract.isProviderRegistered(addressToCheck);
      return isRegistered;
    } catch (error: any) {
      console.error(error);
      return false;
    }
  };

  // Get plan details by ID (you might need to add view functions to your contract)
  const getPlanDetails = async (planId: string) => {
    try {
      const contract = await getContract();
      // These would need to be added to your contract as view functions
      // For now, we'll return mock data but you should add these to the contract:
      // function getPlanProvider(uint256 planId) external view returns (address)
      // function getPlanPrice(uint256 planId) external view returns (uint256)
      // function getPlanInterval(uint256 planId) external view returns (uint256)

      console.log("Getting plan details for:", planId);
      return null; // Will need contract updates
    } catch (error: any) {
      console.error(error);
      return null;
    }
  };

  return {
    registerProvider,
    createPlan,
    subscribe,
    withdrawEarnings,
    getUserBalance,
    processPayments,
    getAllPlans,
    Deposite,
    isProviderRegistered,
    getPlanDetails,
    isLoading,
  };
};
