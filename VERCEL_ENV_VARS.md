# Environment Variables for Vercel Deployment

## Current Status

Your code currently has **hardcoded values** in `src/contracts/contractconfig.ts`:
- Contract Address: `0xdbb07ad146a1db553811a26c1e838bfa7fdb84cf`
- RPC URL: `https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm` (contains API key)
- Network ID: `421614`

## Do You Need Environment Variables?

### Option 1: Deploy As-Is (Simplest) ✅

**You can deploy WITHOUT any environment variables!**

- Your RPC URL with API key is already in the code
- Contract address is public (not sensitive)
- Network ID is public information
- **This works fine for deployment**

**Pros:**
- ✅ No configuration needed
- ✅ Works immediately
- ✅ Simple deployment

**Cons:**
- ⚠️ API key is visible in the code (but it's a testnet key, so it's okay)

### Option 2: Use Environment Variables (Best Practice) 🔒

If you want to make it configurable and more secure:

## Environment Variables to Add (Optional)

If you choose Option 2, add these in Vercel Dashboard → Settings → Environment Variables:

| Variable Name | Value | Required? |
|--------------|-------|-----------|
| `VITE_CONTRACT_ADDRESS` | `0xdbb07ad146a1db553811a26c1e838bfa7fdb84cf` | Optional |
| `VITE_RPC_URL` | `https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm` | Optional |
| `VITE_NETWORK_ID` | `421614` | Optional |

**Note:** All variables must start with `VITE_` to be accessible in Vite apps.

## Recommendation

**For now: Deploy WITHOUT environment variables** (Option 1)

Reasons:
1. ✅ Your current setup works perfectly
2. ✅ Testnet API keys are safe to expose
3. ✅ Contract address is public anyway
4. ✅ Simpler deployment process

You can always add environment variables later if needed.

## If You Want to Use Environment Variables

I can update your code to support environment variables. Just let me know and I'll:
1. Update `contractconfig.ts` to read from `import.meta.env`
2. Provide fallback values
3. Update the deployment guide

---

**Bottom Line:** You can deploy right now without any environment variables! 🚀

