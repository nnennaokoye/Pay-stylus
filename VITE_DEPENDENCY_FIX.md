# Moving Vite to Dependencies

## What Changed

Moved `vite` and `@vitejs/plugin-react` from `devDependencies` to `dependencies` in `package.json`.

## Why This Fixes the Issue

**The Problem:**
- Vercel sometimes skips installing `devDependencies` in production builds
- `vite` was in `devDependencies`, so it wasn't being installed
- This caused the `vite: command not found` error

**The Solution:**
- Moving `vite` to `dependencies` ensures it's always installed
- Vercel will install it during the build process
- Build will now succeed

## Changes Made

**Before:**
```json
"devDependencies": {
  "vite": "^5.4.2",
  "@vitejs/plugin-react": "^4.3.1",
  ...
}
```

**After:**
```json
"dependencies": {
  "vite": "^5.4.2",
  "@vitejs/plugin-react": "^4.3.1",
  ...
}
```

## Impact

✅ **Positive:**
- Vite will always be installed (fixes the build issue)
- No code changes needed
- Build process remains the same

⚠️ **Note:**
- Vite is now in dependencies (slightly larger production bundle, but it's only used during build anyway)
- This is a common practice for build tools in CI/CD environments

## Next Steps

1. **Update package-lock.json** (if needed):
   ```bash
   npm install
   ```

2. **Commit and push**:
   ```bash
   git add package.json package-lock.json
   git commit -m "Move vite to dependencies to fix Vercel build"
   git push origin main
   ```

3. **Vercel will auto-redeploy** - build should now succeed!

## Expected Result

- ✅ `npm ci` installs vite (now in dependencies)
- ✅ `npm run build` finds vite command
- ✅ Build succeeds
- ✅ Deployment completes

---

**This should fix the build issue!** Vite will now be installed as a regular dependency, ensuring it's available during the build process. 🚀

