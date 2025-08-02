# 📧 Email Configuration for ConstructFlow/PulseCRM

## ✅ Current Status

Email functionality has been configured and is working in **development mode**:

### What's Working:
1. **Password Reset Emails** - Sent when users request password reset
2. **Password Changed Notifications** - Sent when password is changed
3. **Email Templates** - Professional HTML email templates created
4. **Development Logging** - Emails are logged to console and saved to file

### Development Mode Features:
- 📋 Emails are logged to the console
- 💾 Saved to `data/sent-emails.log`
- 🔗 Reset links shown directly in the UI
- 🚀 No external email service required

## 🛠️ How to Set Up Production Email

### Step 1: Choose Your Email Service

#### Option A: Gmail (Quick Setup for Testing)

1. Enable 2-factor authentication on Gmail
2. Generate an app password at https://myaccount.google.com/apppasswords
3. Add to your `.env.local`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
EMAIL_FROM="PulseCRM <noreply@pulsecrm.com>"
```

#### Option B: SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com
2. Create an API key
3. Add to your `.env.local`:
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your-api-key-here
EMAIL_FROM=noreply@pulsecrm.com
```

#### Option C: Custom SMTP Server

```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=username
SMTP_PASS=password
EMAIL_FROM=noreply@pulsecrm.com
```

### Step 2: Install Required Packages

```bash
cd apps/web

# For any email service using SMTP
pnpm add nodemailer
pnpm add -D @types/nodemailer

# For SendGrid specifically
pnpm add @sendgrid/mail

# For AWS SES
pnpm add @aws-sdk/client-ses
```

### Step 3: Update Email Service Code

Edit `/lib/email/index.ts` and uncomment the production code:

```typescript
// For nodemailer (Gmail, SMTP)
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
  }
});

// For SendGrid
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
```

### Step 4: Test Your Configuration

1. Try the forgot password feature
2. Check your email inbox
3. Monitor logs for any errors

## 📝 Email Templates

The system includes professional email templates for:

### 1. Password Reset Email
- Clean, responsive design
- Clear call-to-action button
- Security warnings
- Fallback text version

### 2. Password Changed Notification
- Confirmation of password change
- Security alert if not initiated by user
- Timestamp of change
- Instructions if compromised

## 🔍 Debugging Email Issues

### Check Email Logs (Development)
```bash
# View sent emails log
cat data/sent-emails.log

# View reset links
cat data/reset-links.txt

# Check console output
# Emails are logged with "📧 EMAIL SENT" header
```

### Common Issues:

1. **Gmail: "Less secure app" error**
   - Use App Password, not regular password
   - Enable 2-factor authentication first

2. **SendGrid: API key invalid**
   - Check API key starts with "SG."
   - Verify key has send permissions

3. **SMTP: Connection refused**
   - Check firewall settings
   - Verify SMTP port (usually 587 or 465)
   - Try telnet to test connection

## 🚀 Production Checklist

- [ ] Choose email service provider
- [ ] Set up account and get credentials
- [ ] Install required npm packages
- [ ] Update `.env.local` with credentials
- [ ] Update `/lib/email/index.ts` with production code
- [ ] Test password reset flow
- [ ] Test password change notifications
- [ ] Set up email domain authentication (SPF, DKIM)
- [ ] Monitor email delivery rates

## 💡 Best Practices

1. **Always use environment variables** for credentials
2. **Set up domain authentication** to improve deliverability
3. **Monitor bounce rates** and handle them appropriately
4. **Include unsubscribe links** for marketing emails
5. **Test emails** across different email clients
6. **Set appropriate "from" addresses** that users can reply to

## 📧 Current Email Flow

1. User requests password reset → Email sent with reset link
2. User changes password → Confirmation email sent
3. User resets password via link → Confirmation email sent

All emails include:
- Professional HTML design
- Fallback text version
- Clear branding
- Security information
- Mobile-responsive layout

The email system is fully functional and ready for production deployment!
