# Database Setup Guide for PulseCRM

## Quick Start with Vercel Postgres

### 1. Create Database in Vercel Dashboard
1. Go to your Vercel project
2. Click on "Storage" tab
3. Click "Create Database" → Select "Postgres"
4. Choose your region
5. Click "Create" and "Connect"

### 2. Initialize Database Schema

After connecting the database, run these commands:

```bash
# Pull environment variables locally
vercel env pull .env.local

# Navigate to web app
cd apps/web

# Run the schema SQL
psql $POSTGRES_URL < lib/schema.sql

# OR use the Vercel dashboard SQL editor:
# 1. Go to Storage → Your Database → Query
# 2. Copy contents of lib/schema.sql
# 3. Paste and run
```

## Your Production Credentials

### NEXTAUTH_SECRET
```
K9GS9ujTqMm+GSsPQOhOi1TVmTqd0MhEpAoMgcUgVJs=
```

### Environment Variables to Set in Vercel

1. **NEXTAUTH_SECRET** (Required)
   ```
   K9GS9ujTqMm+GSsPQOhOi1TVmTqd0MhEpAoMgcUgVJs=
   ```

2. **NEXTAUTH_URL** (Required)
   ```
   https://your-project.vercel.app
   ```
   Replace with your actual Vercel URL

3. **Database Variables** (Auto-added by Vercel Postgres)
   - DATABASE_URL
   - POSTGRES_URL
   - POSTGRES_PRISMA_URL
   - POSTGRES_URL_NON_POOLING
   - POSTGRES_USER
   - POSTGRES_HOST
   - POSTGRES_PASSWORD
   - POSTGRES_DATABASE

## Alternative: Using External Database

If using Supabase, Neon, or another PostgreSQL provider:

### 1. Get Connection String
Your provider will give you a connection string like:
```
postgresql://username:password@host:port/database
```

### 2. Set Environment Variables
Add these to Vercel:
```
DATABASE_URL=postgresql://username:password@host:port/database
POSTGRES_URL=postgresql://username:password@host:port/database
POSTGRES_PRISMA_URL=postgresql://username:password@host:port/database?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://username:password@host:port/database
```

### 3. Run Schema
```bash
# Using psql
psql "postgresql://username:password@host:port/database" < apps/web/lib/schema.sql

# Or use your provider's SQL editor
```

## Verify Setup

After deployment, test your database:

1. Visit `/api/health` - Should show database as "healthy"
2. Try creating an account - Should work without errors
3. Check Vercel logs for any database errors

## Troubleshooting

### "Database configuration error"
- Ensure all POSTGRES_* variables are set
- Check connection string format
- Verify database is accessible

### "relation does not exist"
- Run the schema.sql file
- Check if tables were created: 
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public';
  ```

### Connection timeouts
- Check if database allows connections from Vercel IPs
- Verify SSL settings if required

## Next Steps

After database setup:
1. Deploy to Vercel
2. Run database migrations
3. Create your first user account
4. Start using PulseCRM!

## Database Schema Overview

The schema includes:
- **Multi-tenant support** with organizations
- **User management** with authentication
- **Contractors** (employees and companies)
- **Jobs** with full project tracking
- **Documents** with signature support
- **Tasks** for job management
- **Contacts** for CRM functionality

All tables include proper indexes and foreign key relationships for optimal performance.