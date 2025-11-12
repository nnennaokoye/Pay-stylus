# Deploying StreamPay to Vercel

This guide will help you deploy your StreamPay frontend to Vercel.

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier is sufficient)
3. **Node.js** - Vercel will handle this automatically, but ensure your `package.json` is correct

## Quick Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Project**
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `./` (root of your repo)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Environment Variables** (Optional)
   - Currently, your contract config is hardcoded
   - If you want to use environment variables, add them here:
     - `VITE_CONTRACT_ADDRESS` (optional)
     - `VITE_RPC_URL` (optional)
     - `VITE_NETWORK_ID` (optional)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No** (first time) or **Yes** (subsequent)
   - Project name? **streampay** (or your choice)
   - Directory? **./** (current directory)
   - Override settings? **No**

4. **Production Deployment**
   ```bash
   vercel --prod
   ```

## Project Configuration

### Files Created

- ✅ `vercel.json` - Vercel configuration file
  - Sets build command and output directory
  - Configures SPA routing (all routes → index.html)
  - Sets cache headers for assets

### Build Settings

Your project is configured with:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: Auto-detected (18.x or 20.x)

## Environment Variables (Optional)

If you want to make your config more flexible, you can use environment variables:

### In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add variables:
   - `VITE_CONTRACT_ADDRESS` = `0xdbb07ad146a1db553811a26c1e838bfa7fdb84cf`
   - `VITE_RPC_URL` = `https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm`
   - `VITE_NETWORK_ID` = `421614`

### Update `src/contracts/contractconfig.ts`:
```typescript
export const CONTRACT_CONFIG = {
  CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS || "0xdbb07ad146a1db553811a26c1e838bfa7fdb84cf",
  CONTRACT_ABI: CONTRACT_ABI_JSON,
  NETWORK_ID: Number(import.meta.env.VITE_NETWORK_ID) || 421614,
  NETWORK_NAME: "Arbitrum Sepolia",
  NETWORK_RPC_URL: import.meta.env.VITE_RPC_URL || "https://arb-sepolia.g.alchemy.com/v2/sriH8r9wrKXR8Gz9faKsm",
};
```

**Note**: Currently, your config is hardcoded, which works fine. Environment variables are optional.

## Post-Deployment

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Continuous Deployment

- ✅ **Automatic**: Every push to `main` branch auto-deploys
- ✅ **Preview Deployments**: Pull requests get preview URLs
- ✅ **Build Logs**: Available in Vercel dashboard

## Troubleshooting

### Build Fails

1. **Check Build Logs** in Vercel dashboard
2. **Common Issues**:
   - Missing dependencies → Check `package.json`
   - TypeScript errors → Fix before deploying
   - Import errors → Check file paths

### App Works Locally but Not on Vercel

1. **Check Browser Console** for errors
2. **Verify Contract Address** is correct
3. **Check Network** - Ensure RPC URL is accessible
4. **Check Build Output** - Verify `dist` folder has all files

### Routing Issues

- ✅ Already handled by `vercel.json` rewrites
- All routes redirect to `index.html` for SPA routing

### Environment Variables Not Working

- Ensure variables start with `VITE_` prefix
- Rebuild after adding variables
- Check variable names match exactly

## Performance Optimization

Vercel automatically:
- ✅ CDN distribution globally
- ✅ Asset optimization
- ✅ Automatic HTTPS
- ✅ Edge caching

## Monitoring

- **Analytics**: Enable in Vercel dashboard (optional)
- **Logs**: View in Vercel dashboard → Deployments → View Function Logs
- **Speed Insights**: Available in Vercel dashboard

## Cost

- **Free Tier**: 
  - 100GB bandwidth/month
  - Unlimited deployments
  - Perfect for development/testing
- **Pro Tier**: $20/month (if you need more)

## Next Steps After Deployment

1. ✅ Test the deployed app
2. ✅ Connect wallet and test contract interactions
3. ✅ Share the URL with users
4. ✅ Set up custom domain (optional)
5. ✅ Monitor usage and performance

## Quick Reference

**Deploy Command**: `vercel --prod`  
**Build Command**: `npm run build`  
**Output**: `dist/` folder  
**Framework**: Vite  
**Node Version**: Auto (18.x or 20.x)

---

**Your app will be live at**: `https://your-project-name.vercel.app`

Happy deploying! 🚀

