# Vercel Deployment Guide for PulseCRM

This guide will walk you through deploying PulseCRM to Vercel from your GitHub repository.

## Prerequisites

- GitHub repository connected (✅ Already done: https://github.com/mrmoe28/SitePulse-pulse.git)
- Vercel account (free tier works)
- Database provider account (Vercel Postgres recommended)

## Step 1: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository: `mrmoe28/SitePulse-pulse`
4. Click "Import"

## Step 2: Configure Build Settings

The build settings should be auto-detected from `vercel.json`, but verify:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (leave as is)
- **Build Command**: `turbo run build --filter=@pulsecrm/web` (auto-detected)
- **Output Directory**: `apps/web/.next` (auto-detected)
- **Install Command**: `pnpm install --no-frozen-lockfile` (auto-detected)

## Step 3: Set Up Database (Required)

### Option A: Vercel Postgres (Recommended - Easiest)

1. In your Vercel project dashboard, go to the "Storage" tab
2. Click "Create Database" → Select "Postgres"
3. Choose a region close to your users
4. Click "Create"
5. Click "Connect Store" to connect it to your project
6. All required environment variables will be automatically added!

### Option B: External Database (Supabase, Neon, etc.)

1. Create a PostgreSQL database with your provider
2. Get your connection strings
3. Add them manually in Step 4

## Step 4: Configure Environment Variables

Go to your project Settings → Environment Variables and add:

### Required Variables

```bash
# Authentication (REQUIRED)
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-project.vercel.app

# Database (Added automatically if using Vercel Postgres)
# If using external database, add these:
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
```

### Optional but Recommended

```bash
# Email Service (for password reset)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your-api-key
EMAIL_FROM=noreply@yourdomain.com

# File Storage (for document uploads)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx
```

### How to Generate NEXTAUTH_SECRET

Run this command in your terminal:
```bash
openssl rand -base64 32
```
Copy the output and use it as your NEXTAUTH_SECRET value.

## Step 5: Deploy

1. Click "Deploy" button
2. Wait for the build to complete (usually 2-3 minutes)
3. If the build fails, check the logs for missing environment variables

## Step 6: Run Database Migrations

After successful deployment:

1. Install Vercel CLI locally:
```bash
npm i -g vercel
```

2. Link to your project:
```bash
vercel link
```

3. Pull environment variables:
```bash
vercel env pull .env.local
```

4. Run migrations:
```bash
cd apps/web
pnpm db:push
```

## Step 7: Test Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. You should see the login page
3. Create a new account or use test credentials (if enabled)

## Common Issues & Solutions

### Build Fails: "Module not found"
- Make sure all dependencies are listed in package.json
- Check that imports use correct casing (Linux is case-sensitive)

### "No database connection"
- Ensure all POSTGRES_* environment variables are set
- Check that DATABASE_URL is properly formatted

### "NEXTAUTH_URL is not set"
- Add NEXTAUTH_URL with your full Vercel URL
- Don't include trailing slash

### "Invalid NEXTAUTH_SECRET"
- Generate a new secret with the openssl command
- Make sure it's at least 32 characters

## Production Checklist

Before going live:

- [ ] Set up custom domain (Settings → Domains)
- [ ] Configure email service for password resets
- [ ] Set up file storage (Vercel Blob or S3)
- [ ] Enable Vercel Analytics (optional)
- [ ] Set up error tracking (Sentry - optional)
- [ ] Review and update security headers
- [ ] Test all critical user flows

## Monitoring

1. **Vercel Dashboard**: Monitor deployments, functions, and errors
2. **Runtime Logs**: View real-time logs in Vercel dashboard
3. **Analytics**: Enable Vercel Analytics for user insights

## Updating Your App

When you push to GitHub:
1. Vercel automatically triggers a new deployment
2. Preview deployments are created for pull requests
3. Production deployment happens on merge to main branch

## Need Help?

- Check build logs in Vercel dashboard
- Review environment variables
- Ensure database is connected and migrations are run
- Join Vercel Discord for community support