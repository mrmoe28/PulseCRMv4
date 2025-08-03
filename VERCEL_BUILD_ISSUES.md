# Vercel Build Issues and Solutions

This document contains common Vercel build issues encountered with PulseCRM and their solutions.

## Common Build Errors

### 1. Module Not Found Errors

**Error Messages:**
```
Module not found: Can't resolve '@/components/Toast'
Module not found: Can't resolve '@/components/DocumentViewer'
Module not found: Can't resolve '@/components/DocumentSigner'
Module not found: Can't resolve '@/components/ui/button'
```

**Root Cause:**
- Vercel runs on Linux servers with case-sensitive filesystems
- Local development on macOS/Windows uses case-insensitive filesystems
- Import paths that work locally may fail on Vercel

**Solutions:**
1. Ensure exact case matching in imports:
   - File: `Toast.tsx` → Import: `from '@/components/Toast'` (not 'toast' or 'TOAST')
   - File: `DocumentViewer.tsx` → Import: `from '@/components/DocumentViewer'`

2. Use consistent export patterns:
   ```typescript
   // In component file (e.g., Toast.tsx)
   export function useToast() { ... }
   export default ToastComponent;
   
   // In consuming file
   import { useToast } from '@/components/Toast';
   import DocumentViewer from '@/components/DocumentViewer';
   ```

3. Create index files for cleaner imports:
   ```typescript
   // components/index.ts
   export { useToast } from './Toast';
   export { default as DocumentViewer } from './DocumentViewer';
   ```

### 2. Missing Dependencies

**Error Messages:**
```
Module not found: Can't resolve 'stripe'
```

**Root Cause:**
- Dependencies not properly saved to package.json
- pnpm-lock.yaml not committed or out of sync

**Solutions:**
1. Always install packages in the correct directory:
   ```bash
   cd apps/web && pnpm add package-name
   ```

2. Commit both package.json and pnpm-lock.yaml:
   ```bash
   git add package.json pnpm-lock.yaml
   git commit -m "Add dependencies"
   ```

### 3. Environment Variable Issues

**Error Messages:**
```
OAuth error: Missing client credentials
NEXTAUTH_URL is not defined
```

**Root Cause:**
- Environment variables not set in Vercel dashboard
- Incorrect variable names or values
- Variables with line breaks or special characters

**Solutions:**
1. Set variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add each variable for Production, Preview, and Development
   - Required OAuth variables:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `NEXTAUTH_URL` (must be full URL without line breaks)
     - `NEXTAUTH_SECRET`

2. Use Vercel CLI to manage variables:
   ```bash
   vercel env add VARIABLE_NAME production
   ```

3. Verify variables are set:
   ```bash
   vercel env ls
   ```

### 4. Build Command Issues

**Error Messages:**
```
Command "turbo run build" exited with 1
```

**Root Cause:**
- Incorrect build configuration in vercel.json
- Turbo not finding packages correctly
- Wrong working directory

**Solutions:**
1. Ensure vercel.json is properly configured:
   ```json
   {
     "buildCommand": "cd .. && turbo run build --filter=@pulsecrm/web",
     "installCommand": "cd .. && pnpm install --no-frozen-lockfile",
     "outputDirectory": ".next"
   }
   ```

2. Check package.json names match:
   - Root package.json: `"name": "pulsecrm"`
   - Web app package.json: `"name": "@pulsecrm/web"`

## Prevention Checklist

Before pushing to GitHub/Vercel:

### 1. Local Build Test
```bash
# From apps/web directory
pnpm build

# Or from root
turbo run build --filter=@pulsecrm/web
```

### 2. Check Imports
- [ ] All imports use exact case matching
- [ ] No relative imports crossing package boundaries
- [ ] Component files have proper exports
- [ ] TypeScript paths in tsconfig.json are correct

### 3. Dependencies
- [ ] All dependencies are in package.json
- [ ] pnpm-lock.yaml is up to date
- [ ] No missing type definitions

### 4. Environment Variables
- [ ] All required variables set in Vercel
- [ ] No line breaks in variable values
- [ ] Correct URLs for deployment (not localhost)

### 5. Git Status
- [ ] All necessary files are committed
- [ ] .gitignore doesn't exclude needed files
- [ ] No uncommitted dependency changes

## Quick Fixes

### Fix All Component Imports
```bash
# Check for case mismatches
grep -r "from '@/components" apps/web --include="*.tsx" --include="*.ts"

# Ensure components exist
ls -la apps/web/components/
```

### Verify Build Locally
```bash
# Clean build
rm -rf apps/web/.next
cd apps/web && pnpm build
```

### Link to Correct Vercel Project
```bash
# Remove old link
rm -rf apps/web/.vercel

# Link to correct project
cd apps/web
vercel link --project site-pulse-v-4-web-8dt3 --scope ekoapps --yes
```

### Force Redeploy
```bash
# After fixing issues and pushing to GitHub
# Vercel will auto-deploy, or manually trigger:
vercel --prod
```

## Common Patterns That Work

### Component with Hook Export
```typescript
// components/Toast.tsx
'use client';

import React, { useState } from 'react';

export interface ToastProps {
  message: string;
}

export function useToast() {
  // Hook implementation
  return { showToast };
}

export default function Toast({ message }: ToastProps) {
  // Component implementation
  return <div>{message}</div>;
}
```

### Importing Component with Hook
```typescript
// pages/dashboard.tsx
import { useToast } from '@/components/Toast';
// or
import Toast, { useToast } from '@/components/Toast';
```

### Dynamic Imports for Client Components
```typescript
import dynamic from 'next/dynamic';

const DocumentSigner = dynamic(() => import('@/components/DocumentSigner'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});
```

## Debugging Steps

1. **Check Vercel Build Logs:**
   - Go to Vercel Dashboard → Project → Deployments
   - Click on failed deployment
   - Review build logs for exact error

2. **Test Import Locally:**
   ```typescript
   // Create test file to verify import works
   import { ComponentName } from '@/components/ComponentName';
   console.log(ComponentName);
   ```

3. **Verify File Exists:**
   ```bash
   ls -la apps/web/components/ComponentName.tsx
   ```

4. **Check TypeScript Recognition:**
   ```bash
   cd apps/web && pnpm typecheck
   ```

## Notes

- Always test builds locally before pushing
- Vercel's Linux environment is case-sensitive
- Use exact file names in imports
- Keep this document updated with new issues encountered