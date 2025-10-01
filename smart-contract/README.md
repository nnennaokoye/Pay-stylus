# StreamPay Hybrid Escrow Smart Contract

## 🚀 Overview
Production-ready Stylus smart contract for StreamPay's hybrid escrow subscription system.

## 📋 Contract Details
- **Language**: Rust (Stylus)
- **Network**: Arbitrum Sepolia  
- **Address**: `0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B`
- **Size**: 23.6 KiB (optimized)

## 🔧 Core Features
### 🏦 Hybrid Escrow System
- Flexible deposits separate from subscriptions
- Capital efficiency - no large upfront locks
- Emergency withdrawals with user control
- Auto-deduction for subscription fees

### 📊 Provider Management  
- Provider registration and plan creation
- Real-time earnings tracking
- 2.5% protocol fee system

## 🛠️ Main Functions
```rust
// Admin
pub fn initialize() -> Result<bool, SubscriptionError>

// Provider
pub fn register_provider(name: String) -> Result<bool, SubscriptionError>
pub fn create_plan(price: U256, interval: U256, metadata: String) -> Result<U256, SubscriptionError>

// Hybrid Escrow
pub fn deposit() -> Result<bool, SubscriptionError>  // PAYABLE
pub fn withdraw(amount: U256) -> Result<bool, SubscriptionError>
pub fn get_user_balance(user: Address) -> U256

// Subscriptions
pub fn subscribe(plan_id: U256) -> Result<U256, SubscriptionError>  // PAYABLE
```

## 🚀 Quick Deploy
```bash
cargo stylus deploy --endpoint=https://sepolia-rollup.arbitrum.io/rpc --private-key=YOUR_KEY
```

## 🧪 Test with Cast
```bash
# Deposit
cast send CONTRACT "deposit()" --value 5000000000000000 --private-key KEY --rpc-url RPC

# Check balance  
cast call CONTRACT "getUserBalance(address)" YOUR_ADDRESS --rpc-url RPC
```

See `/subgraph` folder for provider analytics.
