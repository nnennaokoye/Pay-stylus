import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  CONTRACT_CONFIG,
  CONTRACT_FUNCTIONS,
  CONTRACT_ERRORS,
} from "../contracts/contractconfig";
import { Plan, RecentSubscriber, EarningsData, Transaction } from "../types";
import { useWallet } from "./useWallet";
import { appKit } from "../lib/reown";

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: Record<string, unknown>;
  }
}

export const usePayStylusContract = () => {
  const { isConnected, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const getEip1193Provider = async () => {
    if (typeof appKit?.getWalletProvider === "function") {
      const provider = await appKit.getWalletProvider();
      if (provider) {
        return provider as any;
      }
    }

    if (typeof window !== "undefined" && window.ethereum) {
      return window.ethereum;
    }

    throw new Error("No wallet found");
  };

  const getProvider = async () => {
    const eip1193 = await getEip1193Provider();
    return new ethers.BrowserProvider(eip1193 as any);
  };

  // Read-only provider for event queries
  const getReadProvider = () => {
    // Use a single configured RPC to avoid DNS failures
    return new ethers.JsonRpcProvider(
      CONTRACT_CONFIG.NETWORK_RPC_URL,
      CONTRACT_CONFIG.NETWORK_ID
    );
  };

  // Helper to compute safe block range for event queries
  const getRecentBlockRange = async (provider: ethers.AbstractProvider) => {
    const latest = await provider.getBlockNumber(); 
    const span = 9; // strict window to satisfy free-tier (<= 10 blocks)
    const fromBlock = latest > span ? (latest - span) : 0;
    const toBlock = latest;
    return { fromBlock, toBlock };
  };

  // Query logs in small chunks to satisfy strict RPC range limits (e.g., 10 blocks on free tiers)
  const queryFilterChunked = async (
    contract: ethers.Contract,
    filter: any,
    fromBlock: number,
    toBlock: number,
    step: number = 10
  ) => {
    const results: any[] = [];
    let start = fromBlock;
    while (start <= toBlock) {
      const end = Math.min(start + step - 1, toBlock);
      try {
        const chunk = await contract.queryFilter(filter, start, end);
        if (chunk && chunk.length) results.push(...chunk);
      } catch (e) {
        console.error(`queryFilter chunk failed [${start}, ${end}]`, e);
        // Best-effort: break to avoid tight retry loops in UI
        break;
      }
      start = end + 1;
    }
    return results;
  };

  // Initialize provider and contract
  const getContract = async () => {
    if (!isConnected || !address) throw new Error(CONTRACT_ERRORS.Unauthorized);
    console.log(" Initializing blockchain connection...");

    const eip1193 = await getEip1193Provider();
    const provider = new ethers.BrowserProvider(eip1193 as any);
    const network = await provider.getNetwork();
    console.log(
      " Connected to network:",
      network.name,
      "Chain ID:",
      network.chainId.toString()
    );

    if (network.chainId !== BigInt(CONTRACT_CONFIG.NETWORK_ID)) {
      console.log(" Wrong network detected, attempting to switch...");
      try {
        await (eip1193 as any).request?.({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${CONTRACT_CONFIG.NETWORK_ID.toString(16)}` }],
        });
        console.log(" Network switched successfully");
        const newNetwork = await provider.getNetwork();
        console.log(
          " Now connected to:",
          newNetwork.name,
          "Chain ID:",
          newNetwork.chainId.toString()
        );
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          console.log(" Network not found, adding Arbitrum Sepolia...");
          try {
            await (eip1193 as any).request?.({
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
            console.log(" Arbitrum Sepolia network added and switched");
          } catch (addError) {
            console.error(" Failed to add network:", addError);
            throw new Error(
              "Please manually add Arbitrum Sepolia network to your wallet"
            );
          }
        } else {
          console.error("Failed to switch network:", switchError);
          throw new Error(
            `Please switch to Arbitrum Sepolia (Chain ID: ${CONTRACT_CONFIG.NETWORK_ID}) in your wallet`
          );
        }
      }
    }

    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log(" Signer address:", signerAddress);

    // Use read-only RPC for contract code verification to avoid wallet RPC rate limits
    const readProvider = getReadProvider();
    const code = await readProvider.getCode(CONTRACT_CONFIG.CONTRACT_ADDRESS);
    if (code === "0x") {
      throw new Error("Contract not found at the specified address");
    }
    console.log("Contract verified at:", CONTRACT_CONFIG.CONTRACT_ADDRESS);

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
      console.log("Getting contract for provider registration...");
      const contract = await getContract();

      console.log("Contract details:");
      console.log("  - Address:", contract.target);
      console.log("  - Function:", CONTRACT_FUNCTIONS.ProviderRegister);
      console.log("  - Provider name:", name);

      console.log("Sending registration transaction...");
      const tx = await contract[CONTRACT_FUNCTIONS.ProviderRegister](name, {
        gasLimit: 300000, // Add explicit gas limit
      });

      console.log("Transaction sent:", tx.hash);
      console.log("Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log("Provider registration confirmed!");
      console.log("Receipt:", receipt);

      // VERIFY the transaction actually exists on blockchain
      console.log("Verifying transaction on blockchain...");
      const verifyProvider = await getProvider();
      const verifyTx = await verifyProvider.getTransaction(tx.hash);
      if (!verifyTx) {
        throw new Error(
          "Transaction not found on blockchain! This means it was only simulated locally."
        );
      }
      console.log(
        "Transaction verified on blockchain:",
        verifyTx.blockNumber
      );

      toast.success("Provider registered successfully!");
      return tx;
    } catch (error: any) {
      console.error("Provider registration failed:", error);
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
      console.log("Getting contract for plan creation...");
      const contract = await getContract();
      const priceWei = ethers.parseEther(price); // Convert ETH to Wei

      console.log("Plan creation details:");
      console.log("  - Price (ETH):", price);
      console.log("  - Price (Wei):", priceWei.toString());
      console.log("  - Interval (seconds):", interval);
      console.log("  - Metadata hash:", metadataHash);
      console.log("  - Function:", CONTRACT_FUNCTIONS.CreatePlan);

      console.log("Sending plan creation transaction...");
      const tx = await contract[CONTRACT_FUNCTIONS.CreatePlan](
        priceWei,
        interval,
        metadataHash,
        {
          gasLimit: 300000, // Add explicit gas limit
        }
      );

      console.log("Transaction sent:", tx.hash);
      console.log("Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log("Plan creation confirmed!");
      console.log("Receipt:", receipt);

      // VERIFY the transaction actually exists on blockchain
      console.log("Verifying transaction on blockchain...");
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const verifyTx = await provider.getTransaction(tx.hash);
      if (!verifyTx) {
        throw new Error(
          "Transaction not found on blockchain! This means it was only simulated locally."
        );
      }
      console.log(
        "Transaction verified on blockchain:",
        verifyTx.blockNumber
      );

      toast.success("Plan created successfully!");
      return receipt;
    } catch (error: any) {
      console.error("Plan creation failed:", error);
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
      console.log("Starting subscription process...");
      console.log("Plan ID:", planId, "Price:", price);
      console.log("Contract address:", CONTRACT_CONFIG.CONTRACT_ADDRESS);
      console.log("Wallet address:", address);

      // Check if we have enough balance first
      const provider = await getProvider();
      if (address) {
        const bal = await provider.getBalance(address);
        console.log("Wallet balance:", ethers.formatEther(bal), "ETH");
      }

      // The subscribe function returns the subscription ID directly
      console.log("Calling contract.subscribe...");
      console.log("Function name:", CONTRACT_FUNCTIONS.Subscribe);
      console.log("Parameters:", { planId, value: ethers.parseEther(price) });

      const tx = await contract[CONTRACT_FUNCTIONS.Subscribe](planId, {
        value: ethers.parseEther(price),
        gasLimit: 500000, // Add explicit gas limit
      });

      console.log("Transaction sent:", tx.hash);
      console.log(" Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log(" Transaction confirmed:", receipt);

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
              console.log(" Found subscription ID:", subscriptionId);
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
      console.error(" Subscription failed:", error);
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

  // Get plan details by querying PlanCreated events
  const getPlanDetails = async (planId: string) => {
    try {
      const provider = getReadProvider();
      const contract = new ethers.Contract(
        CONTRACT_CONFIG.CONTRACT_ADDRESS,
        CONTRACT_CONFIG.CONTRACT_ABI,
        provider
      );

      // Query PlanCreated events for this plan ID
      const filter = contract.filters.PlanCreated(planId);
      const { fromBlock, toBlock } = await getRecentBlockRange(provider);
      const events = await queryFilterChunked(contract, filter, fromBlock, toBlock);

      if (events.length === 0) {
        return null;
      }

      const event = events[0];
      const parsedEvent = contract.interface.parseLog({
        topics: event.topics as string[],
        data: event.data,
      });

      if (parsedEvent && parsedEvent.args) {
        return {
          planId: parsedEvent.args.planId.toString(),
          provider: parsedEvent.args.provider,
          price: ethers.formatEther(parsedEvent.args.price),
          interval: parsedEvent.args.interval.toString(),
        };
      }

      return null;
    } catch (error: any) {
      console.error("Error fetching plan details:", error);
      return null;
    }
  };

  // Fetch all plans with their details from contract events
  const getAllPlansWithDetails = async () => {
    try {
      const provider = getReadProvider();
      const contract = new ethers.Contract(
        CONTRACT_CONFIG.CONTRACT_ADDRESS,
        CONTRACT_CONFIG.CONTRACT_ABI,
        provider
      );

      // First get all plan IDs
      const planIds = await contract[CONTRACT_FUNCTIONS.AllPlans]();
      console.log(" Found plan IDs:", planIds);

      // Query all PlanCreated events
      const filter = contract.filters.PlanCreated();
      const { fromBlock, toBlock } = await getRecentBlockRange(provider);
      const events = await queryFilterChunked(contract, filter, fromBlock, toBlock);

      console.log(" Found PlanCreated events:", events.length);

      // Map events to plan details
      const plans = events
        .map((event: any) => {
          try {
            const parsedEvent = contract.interface.parseLog({
              topics: event.topics as string[],
              data: event.data,
            });

            if (parsedEvent && parsedEvent.args) {
              const planId = parsedEvent.args.planId.toString();
              const intervalSeconds = Number(parsedEvent.args.interval.toString());
              
              // Convert interval to human-readable format
              let interval: "monthly" | "yearly" = "monthly";
              if (intervalSeconds >= 365 * 24 * 60 * 60) {
                interval = "yearly";
              } else if (intervalSeconds >= 30 * 24 * 60 * 60) {
                interval = "monthly";
              }

              return {
                id: planId,
                providerId: parsedEvent.args.provider.toLowerCase(),
                providerName: parsedEvent.args.provider.slice(0, 6) + "..." + parsedEvent.args.provider.slice(-4),
                name: `Plan ${planId}`,
                description: `Subscription plan #${planId}`,
                price: ethers.formatEther(parsedEvent.args.price),
                interval: interval,
                isActive: true,
                subscriberCount: 0, // Direct contract calls - subscriber count can be tracked via SubscriptionCreated events if needed
                createdAt: new Date(event.blockNumber ? 0 : Date.now()).toISOString(),
              };
            }
            return null;
          } catch (e) {
            console.error("Error parsing event:", e);
            return null;
          }
        })
        .filter((plan: any) => plan !== null) as Plan[];

      console.log(" Parsed plans:", plans);
      return plans as Plan[];
    } catch (error: any) {
      // Log the full error for debugging (RPC/network/parse issues)
      console.error("Error fetching plans with details:", error);
      // Notify user and rethrow so UI can surface the error (no mock fallback)
      toast.error("Failed to fetch plans from contract");
      throw error;
    }
  };

  // Get subscriptions for a specific user by querying SubscriptionCreated events
  const getUserSubscriptions = async (userAddress: string) => {
    try {
      const provider = getReadProvider();
      const contract = new ethers.Contract(
        CONTRACT_CONFIG.CONTRACT_ADDRESS,
        CONTRACT_CONFIG.CONTRACT_ABI,
        provider
      );

      const filter = contract.filters.SubscriptionCreated(null, userAddress, null);
      const { fromBlock, toBlock } = await getRecentBlockRange(provider);
      const events = await queryFilterChunked(contract, filter, fromBlock, toBlock);

      const subs = await Promise.all(
        events.map(async (event: any) => {
          try {
            const parsed = contract.interface.parseLog({ topics: event.topics as string[], data: event.data });
            if (!parsed || !parsed.args) return null;
            const block = (await provider.getBlock(event.blockNumber)) || { timestamp: Math.floor(Date.now() / 1000) };
            return {
              subscriptionId: parsed.args.subscriptionId?.toString?.() ?? null,
              planId: parsed.args.planId?.toString?.() ?? null,
              user: parsed.args.user ?? null,
              createdAt: new Date((block.timestamp as number) * 1000).toISOString(),
            };
          } catch (e) {
            console.error("Error parsing subscription event:", e);
            return null;
          }
        })
      );

      return subs.filter((s) => s !== null) as any[];
    } catch (error: any) {
      console.error("Error fetching user subscriptions:", error);
      throw error;
    }
  };

  // Get payment history for a user by querying PaymentProcessed events (from/to)
  const getPaymentHistory = async (userAddress: string) => {
    try {
      const provider = getReadProvider();
      const contract = new ethers.Contract(
        CONTRACT_CONFIG.CONTRACT_ADDRESS,
        CONTRACT_CONFIG.CONTRACT_ABI,
        provider
      );

      // Filter where from == user OR to == user. We'll fetch both and merge.
      const fromFilter = contract.filters.PaymentProcessed(userAddress, null);
      const toFilter = contract.filters.PaymentProcessed(null, userAddress);

      const { fromBlock, toBlock } = await getRecentBlockRange(provider);
      const [fromEvents, toEvents] = await Promise.all([
        queryFilterChunked(contract, fromFilter, fromBlock, toBlock),
        queryFilterChunked(contract, toFilter, fromBlock, toBlock),
      ]);

      const mapEvent = async (event: any) => {
        try {
          const parsed = contract.interface.parseLog({ topics: event.topics as string[], data: event.data });
          if (!parsed || !parsed.args) return null;
          const block = (await provider.getBlock(event.blockNumber)) || { timestamp: Math.floor(Date.now() / 1000) };
          return {
            from: parsed.args.from ?? null,
            to: parsed.args.to ?? null,
            amount: parsed.args.amount ? ethers.formatEther(parsed.args.amount) : null,
            subscriptionId: parsed.args.subscriptionId?.toString?.() ?? null,
            timestamp: new Date((block.timestamp as number) * 1000).toISOString(),
          };
        } catch (e) {
          console.error("Error parsing payment event:", e);
          return null;
        }
      };

      const payments = await Promise.all([
        ...fromEvents.map(mapEvent),
        ...toEvents.map(mapEvent),
      ]);

      return payments.filter((p) => p !== null) as any[];
    } catch (error: any) {
      console.error("Error fetching payment history:", error);
      throw error;
    }
  };

  // Get recent subscribers for a provider by querying SubscriptionCreated events
  const getProviderRecentSubscribers = async (providerAddress: string, limit: number = 10) => {
    try {
      const provider = getReadProvider();
      const contract = new ethers.Contract(
        CONTRACT_CONFIG.CONTRACT_ADDRESS,
        CONTRACT_CONFIG.CONTRACT_ABI,
        provider
      );

      // First get all plans (cannot filter by non-indexed provider in topics)
      const allPlansFilter = contract.filters.PlanCreated();
      const { fromBlock, toBlock } = await getRecentBlockRange(provider);
      const planEvents = await queryFilterChunked(contract, allPlansFilter, fromBlock, toBlock);
      const providerPlanIds = planEvents
        .map((event: any) => {
          const parsed = contract.interface.parseLog({ topics: event.topics as string[], data: event.data });
          const prov = parsed?.args?.provider?.toLowerCase?.();
          if (prov !== providerAddress.toLowerCase()) return null;
          return parsed?.args?.planId?.toString() ?? null;
        })
        .filter((id: string | null) => id !== null);

      if (providerPlanIds.length === 0) {
        return [];
      }

      // Get all subscription events for these plans
      const allSubscriptions: RecentSubscriber[] = [];
      
      for (const planId of providerPlanIds) {
        const subFilter = contract.filters.SubscriptionCreated(null, null, planId);
        const subEvents = await queryFilterChunked(contract, subFilter, fromBlock, toBlock);
        
        for (const event of subEvents) {
          try {
            const parsed = contract.interface.parseLog({ topics: event.topics as string[], data: event.data });
            if (!parsed || !parsed.args) continue;
            
            const block = (await provider.getBlock(event.blockNumber)) || { timestamp: Math.floor(Date.now() / 1000) };
            
            // Get plan details from the PlanCreated event
            const planEvent = planEvents.find((pe: any) => {
              const p = contract.interface.parseLog({ topics: pe.topics as string[], data: pe.data });
              return p?.args?.planId?.toString() === planId;
            });
            
            let planPrice = "0";
            if (planEvent) {
              const planParsed = contract.interface.parseLog({ 
                topics: planEvent.topics as string[], 
                data: planEvent.data 
              });
              planPrice = planParsed?.args?.price ? ethers.formatEther(planParsed.args.price) : "0";
            }
            
            allSubscriptions.push({
              subscriptionId: parsed.args.subscriptionId?.toString?.() ?? "",
              planId: parsed.args.planId?.toString?.() ?? "",
              user: parsed.args.user ?? "",
              planName: `Plan ${parsed.args.planId?.toString?.() ?? ""}`,
              amount: planPrice,
              timestamp: new Date((block.timestamp as number) * 1000).toISOString(),
            });
          } catch (e) {
            console.error("Error parsing subscription event:", e);
          }
        }
      }

      // Sort by timestamp (most recent first) and limit
      return allSubscriptions
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error: any) {
      console.error("Error fetching recent subscribers:", error);
      return [];
    }
  };

  // Get earnings data for a provider aggregated by month
  const getProviderEarningsData = async (providerAddress: string) => {
    try {
      const provider = getReadProvider();
      const contract = new ethers.Contract(
        CONTRACT_CONFIG.CONTRACT_ADDRESS,
        CONTRACT_CONFIG.CONTRACT_ABI,
        provider
      );

      // Query ProviderEarnings events (cannot filter by non-indexed provider)
      const filter = contract.filters.ProviderEarnings();
      const { fromBlock, toBlock } = await getRecentBlockRange(provider);
      const events = await queryFilterChunked(contract, filter, fromBlock, toBlock);

      // Aggregate by month
      const monthlyEarnings = new Map<string, number>();

      for (const event of events) {
        try {
          const parsed = contract.interface.parseLog({ topics: event.topics as string[], data: event.data });
          if (!parsed || !parsed.args) continue;
          const prov = parsed.args.provider?.toLowerCase?.();
          if (prov !== providerAddress.toLowerCase()) continue;

          const block = await provider.getBlock(event.blockNumber);
          if (!block) continue;

          const date = new Date((block.timestamp as number) * 1000);
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          
          const amount = parseFloat(ethers.formatEther(parsed.args.amount));
          monthlyEarnings.set(monthKey, (monthlyEarnings.get(monthKey) || 0) + amount);
        } catch (e) {
          console.error("Error parsing earnings event:", e);
        }
      }

      // Convert to array and sort by date
      const earningsData: EarningsData[] = Array.from(monthlyEarnings.entries())
        .map(([month, earnings]) => ({ month, earnings }))
        .sort((a, b) => {
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(-6); // Last 6 months

      return earningsData;
    } catch (error: any) {
      console.error("Error fetching earnings data:", error);
      return [];
    }
  };

  // Get all transactions for a user (deposits, withdrawals, subscriptions)
  const getUserTransactions = async (userAddress: string) => {
    try {
      const provider = getReadProvider();
      const contract = new ethers.Contract(
        CONTRACT_CONFIG.CONTRACT_ADDRESS,
        CONTRACT_CONFIG.CONTRACT_ABI,
        provider
      );

      const transactions: Transaction[] = [];

      // Get deposit events
      const { fromBlock, toBlock } = await getRecentBlockRange(provider);

      const depositFilter = contract.filters.EscrowDeposit(userAddress);
      const depositEvents = await queryFilterChunked(contract, depositFilter, fromBlock, toBlock);
      
      for (const event of depositEvents) {
        try {
          const parsed = contract.interface.parseLog({ topics: event.topics as string[], data: event.data });
          if (!parsed || !parsed.args) continue;
          
          const block = await provider.getBlock(event.blockNumber);
          if (!block) continue;

          transactions.push({
            type: 'deposit',
            amount: ethers.formatEther(parsed.args.amount),
            timestamp: new Date((block.timestamp as number) * 1000).toISOString(),
            hash: event.transactionHash,
            to: userAddress,
          });
        } catch (e) {
          console.error("Error parsing deposit event:", e);
        }
      }

      // Get withdrawal events
      const withdrawalFilter = contract.filters.EscrowWithdrawal(userAddress);
      const withdrawalEvents = await queryFilterChunked(contract, withdrawalFilter, fromBlock, toBlock);
      
      for (const event of withdrawalEvents) {
        try {
          const parsed = contract.interface.parseLog({ topics: event.topics as string[], data: event.data });
          if (!parsed || !parsed.args) continue;
          
          const block = await provider.getBlock(event.blockNumber);
          if (!block) continue;

          transactions.push({
            type: 'withdrawal',
            amount: ethers.formatEther(parsed.args.amount),
            timestamp: new Date((block.timestamp as number) * 1000).toISOString(),
            hash: event.transactionHash,
            from: userAddress,
          });
        } catch (e) {
          console.error("Error parsing withdrawal event:", e);
        }
      }

      // Get subscription events for this user
      const subscriptionFilter = contract.filters.SubscriptionCreated(null, userAddress);
      const subscriptionEvents = await queryFilterChunked(contract, subscriptionFilter, fromBlock, toBlock);
      
      for (const event of subscriptionEvents) {
        try {
          const parsed = contract.interface.parseLog({ topics: event.topics as string[], data: event.data });
          if (!parsed || !parsed.args) continue;
          
          const block = await provider.getBlock(event.blockNumber);
          if (!block) continue;

          // Get the plan price from PlanCreated event
          const planFilter = contract.filters.PlanCreated(parsed.args.planId);
          const planEvents = await queryFilterChunked(contract, planFilter, fromBlock, toBlock);
          let planPrice = "0";
          
          if (planEvents.length > 0) {
            const planParsed = contract.interface.parseLog({ 
              topics: planEvents[0].topics as string[], 
              data: planEvents[0].data 
            });
            planPrice = planParsed?.args?.price ? ethers.formatEther(planParsed.args.price) : "0";
          }

          transactions.push({
            type: 'subscription',
            amount: planPrice,
            timestamp: new Date((block.timestamp as number) * 1000).toISOString(),
            hash: event.transactionHash,
            from: userAddress,
          });
        } catch (e) {
          console.error("Error parsing subscription event:", e);
        }
      }

      // Get payment events where user is sender or receiver
      const paymentFromFilter = contract.filters.PaymentProcessed(userAddress, null);
      const paymentToFilter = contract.filters.PaymentProcessed(null, userAddress);
      
      const [paymentFromEvents, paymentToEvents] = await Promise.all([
        queryFilterChunked(contract, paymentFromFilter, fromBlock, toBlock),
        queryFilterChunked(contract, paymentToFilter, fromBlock, toBlock),
      ]);

      for (const event of [...paymentFromEvents, ...paymentToEvents]) {
        try {
          const parsed = contract.interface.parseLog({ topics: event.topics as string[], data: event.data });
          if (!parsed || !parsed.args) continue;
          
          const block = await provider.getBlock(event.blockNumber);
          if (!block) continue;

          transactions.push({
            type: 'payment',
            amount: ethers.formatEther(parsed.args.amount),
            timestamp: new Date((block.timestamp as number) * 1000).toISOString(),
            hash: event.transactionHash,
            from: parsed.args.from,
            to: parsed.args.to,
          });
        } catch (e) {
          console.error("Error parsing payment event:", e);
        }
      }

      // Sort by timestamp (most recent first)
      return transactions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error: any) {
      console.error("Error fetching user transactions:", error);
      return [];
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
    getAllPlansWithDetails,
    getUserSubscriptions,
    getPaymentHistory,
    getProviderRecentSubscribers,
    getProviderEarningsData,
    getUserTransactions,
    Deposite,
    isProviderRegistered,
    getPlanDetails,
    isLoading,
  };
};
