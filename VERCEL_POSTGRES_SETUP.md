# Vercel Postgres Setup Guide

## Overview

This guide will help you set up **Vercel Postgres** for persistent database storage that survives deployments.

## Why Vercel Postgres?

- ✅ **Persistent Storage**: Data survives all deployments
- ✅ **Serverless**: Automatically scales with your app
- ✅ **Vercel Integration**: Seamless setup and configuration
- ✅ **Production Ready**: Built for production workloads

## Step 1: Create Vercel Postgres Database

### Option A: Via Vercel Dashboard (Recommended)

1. Go to your **Vercel Dashboard**
2. Select your **constructflow project**
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a database name (e.g., `constructflow-db`)
7. Select your preferred region
8. Click **Create**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Create Postgres database
vercel storage create postgres constructflow-db
```

## Step 2: Environment Variables

After creating the database, Vercel will automatically add these environment variables to your project:

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

**Important**: The app only needs `POSTGRES_URL` to work. The presence of this variable enables Postgres mode.

## Step 3: Verify Setup

### Check Environment Variables

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Confirm `POSTGRES_URL` is present
3. It should look like: `postgres://username:password@host:port/database`

### Test Database Connection

Once deployed, test the database by visiting:

```url
https://your-vercel-app.vercel.app/api/test-db
```

**Expected Response with Postgres:**

```json
{
  "success": true,
  "environment": "Vercel",
  "databaseType": "Postgres",
  "userCount": 0,
  "users": [],
  "timestamp": "2025-07-03T04:11:09.570Z"
}
```

## Step 4: Test User Registration

1. Visit your Vercel app signup page
2. Create a new account
3. Verify the account persists by:
   - Checking the test endpoint again
   - Logging in with the account
   - Deploying new code and confirming the account still exists

## Database Schema

The app automatically creates these tables when first accessed:

### `users` table

- `id` (VARCHAR, Primary Key)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `organization_id` (VARCHAR)
- `organization_name` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `organizations` table

- `id` (VARCHAR, Primary Key)
- `name` (VARCHAR)
- `slug` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Fallback Behavior

The app uses a smart fallback system:

1. **Vercel + POSTGRES_URL**: Uses Vercel Postgres (persistent)
2. **Local Development**: Uses JSON file storage (persistent locally)
3. **Fallback**: Uses memory storage (temporary)

## Troubleshooting

### Database Connection Issues

- Check that `POSTGRES_URL` environment variable is set
- Verify the URL format is correct
- Check Vercel function logs for connection errors

### Tables Not Created

- The app auto-creates tables on first access
- Check function logs for SQL errors
- Ensure your Postgres instance allows DDL operations

### Data Not Persisting

- Confirm `databaseType: "Postgres"` in test endpoint response
- Check that you're using the production Vercel URL, not localhost
- Verify environment variables are set in Vercel dashboard

## Cost Information

- **Hobby Plan**: 1 database included
- **Pro Plan**: Additional databases available
- **Pricing**: Based on storage and compute usage
- **Free Tier**: Generous limits for development/small apps

## Next Steps

After setup:

1. ✅ Create Vercel Postgres database
2. ✅ Verify environment variables are set
3. ✅ Test the `/api/test-db` endpoint
4. ✅ Create a test user account
5. ✅ Deploy new code and verify data persists

Your app will now have persistent storage that survives all deployments! 🎉
