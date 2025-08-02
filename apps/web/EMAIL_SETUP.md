# Email Configuration for PulseCRM

## Development Mode (Current)
In development mode, emails are:
- Logged to the console
- Saved to `data/sent-emails.log`
- Reset links are shown directly in the UI

## Production Setup

### Option 1: Gmail (Simple for testing)
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=PulseCRM <noreply@pulsecrm.com>
```

To use Gmail:
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password: https://myaccount.google.com/apppasswords
3. Use the app password (not your regular password)

### Option 2: SendGrid (Recommended for production)
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@pulsecrm.com
```

### Option 3: AWS SES
```env
EMAIL_SERVICE=aws-ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
EMAIL_FROM=noreply@pulsecrm.com
```

### Option 4: Custom SMTP
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=username
SMTP_PASS=password
EMAIL_FROM=noreply@pulsecrm.com
```

## Installing Email Service

1. **Install nodemailer** (for any email service):
   ```bash
   cd apps/web
   pnpm add nodemailer
   pnpm add -D @types/nodemailer
   ```

2. **For SendGrid**:
   ```bash
   pnpm add @sendgrid/mail
   ```

3. **For AWS SES**:
   ```bash
   pnpm add @aws-sdk/client-ses
   ```

## Update the Email Service

Once you've chosen your email service, update `/lib/email/index.ts`:

```typescript
// Example with nodemailer
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Or with SendGrid
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

## Testing Email Configuration

1. Set your environment variables in `.env.local`
2. Test with the forgot password feature
3. Check email delivery logs
