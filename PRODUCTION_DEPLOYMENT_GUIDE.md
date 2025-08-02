# 🚀 ConstructFlow/PulseCRM Production Deployment Guide

## Overview
This guide covers converting the application from development/demo mode to a fully production-ready system.

## 1. Database Setup (Required)

### Option A: Vercel Postgres (Recommended)
```bash
# In Vercel Dashboard:
1. Go to Storage tab
2. Create Postgres database
3. Connect to your project
4. Environment variables are auto-added

# Run migrations locally:
vercel env pull .env.local
cd apps/web
pnpm db:push
```

### Option B: External PostgreSQL
```env
POSTGRES_URL=postgresql://user:pass@host:5432/dbname
POSTGRES_PRISMA_URL=postgresql://user:pass@host:5432/dbname?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://user:pass@host:5432/dbname
```

## 2. Environment Variables (Required)

### Create `.env.production` or set in Vercel Dashboard:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
APP_URL=https://your-domain.com

# Database (from step 1)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Authentication (Required)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>

# Email Service (Required for password reset)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your-api-key
EMAIL_FROM=noreply@your-domain.com

# File Storage (Required for documents)
# Option 1: Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_token

# Option 2: AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=your-bucket-name

# Security
RATE_LIMIT_ENABLED=true
ALLOWED_ORIGINS=https://your-domain.com
CSP_REPORT_URI=https://your-domain.com/api/csp-report

# Analytics (Optional)
VERCEL_ANALYTICS_ID=
GOOGLE_ANALYTICS_ID=
SENTRY_DSN=

# Feature Flags
ENABLE_REAL_TIME=true
ENABLE_NOTIFICATIONS=true
ENABLE_FILE_UPLOAD=true
MAX_FILE_SIZE_MB=10
```

## 3. Code Changes Required

### A. Remove Demo Data and Hardcoded Values

1. **Update Authentication** (`apps/web/app/auth/page.tsx`):
```typescript
// Remove hardcoded admin credentials
// Remove this:
if (email === 'admin' && password === 'admin123') {
  // Demo login
}

// Keep only real authentication
const user = await validateUserPassword(email, password);
```

2. **Remove Test Users** (`apps/web/lib/database-postgres.ts`):
```typescript
// Remove any seed data or test users
// Ensure clean database initialization
```

3. **Update API Routes** to use real data:
- Remove mock responses
- Connect to actual database
- Implement proper error handling

### B. Security Hardening

1. **Add Rate Limiting** (`apps/web/middleware.ts`):
```typescript
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(req: NextRequest) {
  // Add rate limiting
  const { success } = await rateLimit(req);
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  // Existing middleware...
}
```

2. **Implement CORS** (`apps/web/next.config.js`):
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGINS },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        ],
      },
    ];
  },
};
```

3. **Add Input Validation** (all API routes):
```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  // Add validation for all inputs
});
```

### C. Performance Optimization

1. **Enable Caching**:
```typescript
// Add to API routes
export const revalidate = 60; // Cache for 60 seconds
```

2. **Optimize Images**:
```typescript
import Image from 'next/image';
// Use Next.js Image component everywhere
```

3. **Enable ISR** (Incremental Static Regeneration):
```typescript
export const revalidate = 3600; // Revalidate every hour
```

## 4. Email Service Setup

### Configure SendGrid (Recommended):

1. **Update** `apps/web/lib/email/index.ts`:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await sgMail.send({
      to: options.to,
      from: process.env.EMAIL_FROM!,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}
```

2. **Install SendGrid**:
```bash
cd apps/web
pnpm add @sendgrid/mail
```

## 5. File Storage Setup

### Configure Vercel Blob Storage:

1. **Update** file upload handlers:
```typescript
import { put } from '@vercel/blob';

export async function uploadFile(file: File) {
  const blob = await put(file.name, file, {
    access: 'public',
  });
  return blob.url;
}
```

2. **Install Vercel Blob**:
```bash
pnpm add @vercel/blob
```

## 6. Real-time Features (Optional)

### Add WebSocket Support:

1. **Install Pusher** or **Ably**:
```bash
pnpm add pusher pusher-js
```

2. **Configure real-time updates**:
```typescript
// Server-side
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: 'us2',
});

// Client-side
import Pusher from 'pusher-js';

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: 'us2',
});
```

## 7. Monitoring & Analytics

### A. Error Tracking (Sentry):

1. **Install Sentry**:
```bash
pnpm add @sentry/nextjs
```

2. **Configure** `sentry.config.js`:
```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### B. Analytics:

1. **Add Vercel Analytics**:
```bash
pnpm add @vercel/analytics
```

2. **Update** `apps/web/app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## 8. Deployment Checklist

### Pre-deployment:
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Email service configured and tested
- [ ] File storage configured
- [ ] Remove all console.logs
- [ ] Enable production error handling
- [ ] Test all critical paths

### Security:
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Drizzle ORM)
- [ ] XSS prevention (React handles this)
- [ ] CSRF protection enabled
- [ ] Secure headers configured

### Performance:
- [ ] Images optimized
- [ ] Code splitting enabled
- [ ] API routes cached where appropriate
- [ ] Database queries optimized
- [ ] Static assets on CDN

### Monitoring:
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Uptime monitoring set up
- [ ] Database backups configured

## 9. Post-Deployment

### A. Domain Setup:
```bash
# In Vercel Dashboard
1. Go to Settings → Domains
2. Add your domain
3. Configure DNS records
```

### B. SSL Certificate:
- Automatic on Vercel

### C. Backup Strategy:
1. **Database**: Enable point-in-time recovery
2. **Files**: Regular S3/Blob backups
3. **Code**: Git tags for releases

## 10. Maintenance Mode

Create `apps/web/app/maintenance/page.tsx`:
```typescript
export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Under Maintenance</h1>
        <p>We'll be back shortly!</p>
      </div>
    </div>
  );
}
```

Enable with environment variable:
```env
MAINTENANCE_MODE=true
```

## Summary

To go to production:
1. ✅ Set up real database (Postgres)
2. ✅ Configure all environment variables
3. ✅ Remove demo/test code
4. ✅ Set up email service
5. ✅ Configure file storage
6. ✅ Add monitoring/analytics
7. ✅ Run security audit
8. ✅ Deploy to Vercel
9. ✅ Configure custom domain
10. ✅ Monitor and maintain

The app is architecturally ready for production - just needs these configurations and service integrations!
