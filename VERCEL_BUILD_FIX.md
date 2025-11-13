# Vercel Build Fix

## Issue
Build failing with: `sh: line 1: vite: command not found`

## Root Cause
Vercel wasn't installing dependencies before running the build command.

## Solution Applied

1. **Updated `vercel.json`**:
   - Changed `buildCommand` to `npm install && npm run build`
   - This ensures dependencies are installed before building

2. **Created `.npmrc`**:
   - Added `shamefully-hoist=true` to help with dependency resolution

## Alternative Solutions (if above doesn't work)

### Option 1: In Vercel Dashboard Settings
Go to your project → Settings → General → Build & Development Settings:
- **Install Command**: `npm install` (or leave empty for auto)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Option 2: Move vite to dependencies (not recommended)
If the above doesn't work, you could move `vite` from `devDependencies` to `dependencies`, but this is not standard practice.

### Option 3: Use npx
Change build command to: `npx vite build`

## Next Steps

1. **Commit the changes**:
   ```bash
   git add vercel.json .npmrc
   git commit -m "Fix Vercel build: ensure dependencies are installed"
   git push origin main
   ```

2. **Redeploy on Vercel**:
   - Vercel will automatically trigger a new build
   - Or manually trigger from the dashboard

3. **Check build logs**:
   - Should see `npm install` running first
   - Then `npm run build` should succeed

## Expected Build Output

```
> npm install
... (installing dependencies)
> npm run build
> vite build
vite v5.x.x building for production...
✓ built in X.XXs
```

---

**The fix is in place!** Just commit and push, then redeploy. 🚀

