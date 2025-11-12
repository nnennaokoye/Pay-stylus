// Check localStorage and subscription status
console.log("=== StreamPay Storage Check ===");

// Check localStorage keys
const keys = Object.keys(localStorage);
console.log("📦 LocalStorage keys:", keys);

// Check specific StreamPay keys
const subscriptions = localStorage.getItem("StreamPaySubscriptions");
const walletData = localStorage.getItem("StreamPayWallet");

console.log("💳 Subscriptions data:", subscriptions);
console.log("🔐 Wallet data:", walletData);

if (subscriptions) {
  try {
    const parsed = JSON.parse(subscriptions);
    console.log("📊 Parsed subscriptions:", parsed);
    console.log("📈 Number of subscriptions:", Object.keys(parsed).length);
  } catch (e) {
    console.log("❌ Error parsing subscriptions:", e);
  }
}

// Check if we have subscription ID 185601
if (subscriptions) {
  const data = JSON.parse(subscriptions);
  if (data["185601"]) {
    console.log("✅ Found subscription 185601:", data["185601"]);
  } else {
    console.log("❌ Subscription 185601 not found");
    console.log("Available IDs:", Object.keys(data));
  }
}
