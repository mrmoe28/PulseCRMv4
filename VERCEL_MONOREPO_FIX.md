# 🔧 Vercel Monorepo Deployment Configuration

## Important: Vercel Project Settings

### In Vercel Dashboard:

1. **Root Directory**: Leave EMPTY (not `apps/web`)
   - This ensures Vercel starts from the repository root
   - The monorepo structure requires installation from root

2. **Environment Variables**:
   - `ENABLE_EXPERIMENTAL_COREPACK` = `1`
   - Plus any other app-specific variables (DATABASE_URL, etc.)

## Configuration Files

### Root `vercel.json` (Repository Root)
```json
{
  "installCommand": "corepack enable && corepack prepare pnpm@8.10.0 --activate && pnpm install",
  "buildCommand": "pnpm turbo build --filter=@pulsecrm/web",
  "outputDirectory": "apps/web/.next"
}
```

### Why This Works

1. **installCommand**: Runs from repository root to install all monorepo dependencies
2. **buildCommand**: Uses Turborepo to build only the web app
3. **outputDirectory**: Points to where Next.js outputs the build

## Steps to Fix

1. **In Vercel Dashboard**:
   - Go to Settings → General
   - Set "Root Directory" to empty (remove `apps/web`)
   - Save changes

2. **Commit Configuration**:
   ```bash
   cd /Users/edwardharrison/Desktop/constructflow-main
   git add vercel.json
   git rm apps/web/vercel.json  # Remove if exists
   git commit -m "Fix Vercel monorepo configuration"
   git push origin main
   ```

3. **Redeploy**:
   - Vercel will automatically redeploy
   - Or manually trigger in Vercel dashboard

## Alternative Approach (If Above Doesn't Work)

If you prefer to keep `apps/web` as root in Vercel:

Create `apps/web/vercel.json`:
```json
{
  "installCommand": "cd ../.. && corepack enable && corepack prepare pnpm@8.10.0 --activate && pnpm install --filter=@pulsecrm/web...",
  "buildCommand": "pnpm build",
  "outputDirectory": ".next"
}
```

But the recommended approach is to use the repository root.
