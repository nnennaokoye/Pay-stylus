# StreamPay Contract Deployment Guide

## 🎯 Complete Step-by-Step Deployment Process

---

## Prerequisites

### 1. Required Tools
- **Rust & Cargo** (v1.87.0)
- **cargo-stylus** (Arbitrum Stylus CLI)
- **Foundry (cast)** (for contract initialization)
- **Private Key** with Arbitrum Sepolia ETH (~0.01 ETH for gas)

### 2. Get Arbitrum Sepolia ETH
- Bridge from Ethereum Sepolia: https://bridge.arbitrum.io/
- Or use faucet: https://faucet.quicknode.com/arbitrum/sepolia

---

## Installation Commands

### Install Rust (if not installed)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Install cargo-stylus
```bash
cargo install --force cargo-stylus
```

### Install Foundry (for cast)
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

## Deployment Steps

### Step 1: Navigate to Contract Directory
```bash
cd ~/StreamPay-arbitrum/smart-contract
```

### Step 2: Verify Contract Compiles
```bash
cargo stylus check --endpoint=https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm
```

**Expected Output:**
```
Finished release [optimized] target(s)
contract size: 23.6 KB
wasm data fee: 0.001234 ETH
```

### Step 3: Deploy Using the Script
```bash
# Make script executable
chmod +x deploy.sh

# Deploy (replace YOUR_PRIVATE_KEY)
./deploy.sh YOUR_PRIVATE_KEY
```

**OR Deploy Manually:**

```bash
# Set your private key
export PRIVATE_KEY="your_private_key_here"

# Deploy contract
cargo stylus deploy \
  --endpoint=https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm \
  --private-key=$PRIVATE_KEY \
  --no-verify
```

### Step 4: Save the Contract Address
The deployment will output something like:
```
✅ Contract deployed successfully!
📍 Contract Address: 0xYourNewContractAddress...
```

**SAVE THIS ADDRESS!** You'll need it for the next steps.

### Step 5: Export the ABI
```bash
cargo stylus export-abi > abi.json
```

### Step 6: Initialize the Contract
```bash
# Replace with your actual contract address and private key
cast send 0xYourNewContractAddress \
  "initialize()" \
  --private-key YOUR_PRIVATE_KEY \
  --rpc-url https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm
```

### Step 7: Verify Initialization
```bash
# Check if admin is set (should return your wallet address)
cast call 0xYourNewContractAddress \
  "admin()(address)" \
  --rpc-url https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm
```

---

## Post-Deployment Configuration

### 1. Update Frontend Configuration

Edit `src/contracts/contractconfig.ts`:
```typescript
export const CONTRACT_CONFIG = {
  CONTRACT_ADDRESS: "0xYourNewContractAddress", // UPDATE THIS
  CONTRACT_ABI: CONTRACT_ABI_JSON,
  NETWORK_ID: 421614,
  NETWORK_NAME: "Arbitrum Sepolia",
  NETWORK_RPC_URL: "https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm",
};
```

### 2. Update Subgraph Configuration

Edit `subgraph/subgraph.yaml`:
```yaml
source:
  address: "0xYourNewContractAddress"  # UPDATE THIS
  abi: SubscriptionEscrow
  startBlock: YOUR_DEPLOYMENT_BLOCK    # UPDATE THIS
```

### 3. Update Complete ABI

Copy the new ABI to the frontend:
```bash
cp smart-contract/abi.json complete-abi.json
```

### 4. Update Documentation

Edit `CONTRACT_INFO.md` with new address and deployment details.

---

## Testing the Deployed Contract

### 1. Register as Provider
```bash
cast send 0xYourNewContractAddress \
  "registerProvider(string)" "MyProvider" \
  --private-key YOUR_PRIVATE_KEY \
  --rpc-url https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm
```

### 2. Create a Test Plan
```bash
# 0.001 ETH every 60 seconds
cast send 0xYourNewContractAddress \
  "createPlan(uint256,uint256,string)" \
  1000000000000000 60 "test-plan" \
  --private-key YOUR_PRIVATE_KEY \
  --rpc-url https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm
```

### 3. Deposit to Escrow
```bash
cast send 0xYourNewContractAddress \
  "deposit()" \
  --value 10000000000000000 \
  --private-key YOUR_PRIVATE_KEY \
  --rpc-url https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm
```

### 4. Check Balance
```bash
cast call 0xYourNewContractAddress \
  "getUserBalance(address)" YOUR_WALLET_ADDRESS \
  --rpc-url https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm
```

### 5. Subscribe to Plan
```bash
cast send 0xYourNewContractAddress \
  "subscribe(uint256)" 1 \
  --private-key YOUR_PRIVATE_KEY \
  --rpc-url https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm
```

---

## Redeploy Subgraph

After updating the contract address in `subgraph.yaml`:

```bash
cd subgraph
graph codegen
graph build
graph deploy --studio subscription-escrow-subgraph
```

---

## Troubleshooting

### Issue: "Contract compilation failed"
**Solution:**
```bash
# Clean and rebuild
cargo clean
cargo build --release --target wasm32-unknown-unknown
```

### Issue: "Insufficient funds"
**Solution:** Get more Arbitrum Sepolia ETH from faucet

### Issue: "Network not supported"
**Solution:** Ensure you're using Arbitrum Sepolia RPC:
```
https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm
```

### Issue: "Initialize already called"
**Solution:** Contract can only be initialized once. If you need to redeploy, deploy a new contract instance.

---

## Verification Checklist

After deployment, verify:

- [ ] Contract deployed successfully
- [ ] Contract initialized (admin set)
- [ ] ABI exported
- [ ] Frontend config updated
- [ ] Subgraph config updated
- [ ] Provider registration works
- [ ] Plan creation works
- [ ] Deposit/withdraw works
- [ ] Subscription works
- [ ] Subgraph redeployed

---

## Important Notes

1. **Save Your Private Key Securely** - Never commit it to git
2. **Save Contract Address** - You'll need it for all integrations
3. **Save Deployment Block** - Needed for subgraph indexing
4. **Test Thoroughly** - Use test scripts before going to production
5. **Monitor Gas Costs** - Deployment costs ~0.001-0.01 ETH

---

## Quick Reference

**Network:** Arbitrum Sepolia  
**Chain ID:** 421614  
**RPC:** https://sepolia-rollup.arbitrum.io/rpc  
**RPC (Alchemy):** https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm  
**Explorer:** https://sepolia.arbiscan.io  
**Faucet:** https://faucet.quicknode.com/arbitrum/sepolia  

**Current Contract:** 0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B  
**Protocol Fee:** 2.5%  
**Contract Size:** ~23.6 KiB  

---

## Need Help?

- Check contract source: `smart-contract/lib.rs`
- Review test scripts: `test-*.js` files
- Check deployment logs for errors   
- Verify network connection and balance
