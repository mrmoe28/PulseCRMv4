# EmailJS Setup Guide for PulseCRM

PulseCRM now uses EmailJS for automatic email sending without requiring SMTP configuration. This guide will help you set up your own EmailJS account for production use.

## Quick Start (Using Demo Keys)

The application comes with demo EmailJS keys that work out of the box for testing:
- Limited to 200 emails per day
- Works immediately without configuration
- Perfect for development and testing

## Production Setup (Recommended)

### Step 1: Create EmailJS Account

1. Visit [EmailJS](https://www.emailjs.com/)
2. Sign up for a free account (includes 200 emails/month)
3. Or upgrade to a paid plan for more emails

### Step 2: Create an Email Service

1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the connection instructions
5. Name it "PulseCRM Service"
6. Save the Service ID

### Step 3: Create Email Template

1. Go to "Email Templates"
2. Click "Create New Template"
3. Set up the template:

**Subject:**
```
Signature Request: {{document_name}}
```

**Content:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 25px 0; }
    .footer { text-align: center; color: #6c757d; font-size: 12px; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Signature Request</h1>
      <p>PulseCRM Document Management</p>
    </div>
    
    <div style="padding: 20px;">
      <p>Hello {{to_name}},</p>
      
      <p>{{from_name}} has requested your signature on the following document:</p>
      
      <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
        <strong>📄 {{document_name}}</strong>
      </div>
      
      {{#if message}}
      <div style="background: #f0f8ff; padding: 15px; margin: 20px 0; border-left: 4px solid #0066cc;">
        <strong>Message from {{from_name}}:</strong>
        <p>{{message}}</p>
      </div>
      {{/if}}
      
      <div style="text-align: center;">
        <a href="{{signature_link}}" class="button">✍️ Review & Sign Document</a>
      </div>
      
      <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border: 1px solid #ffeaa7; color: #856404;">
        <strong>🔒 Security Notice:</strong><br>
        This signature request is secure and legally binding. Your signature will be encrypted and stored securely.
      </div>
      
      <p style="color: #dc3545; font-weight: 600;">
        ⏰ This signature request will expire on {{expires_date}}
      </p>
    </div>
    
    <div class="footer">
      <p>This email was sent by PulseCRM Document Management System</p>
      <p>© 2024 PulseCRM. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

4. Save the template
5. Copy the Template ID

### Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### Step 5: Test the Integration

1. Upload a document
2. Click "Send for Signature"
3. Enter recipient details
4. Email should be sent automatically

## Features

### Automatic Email Sending
- No SMTP configuration required
- Works directly from the browser
- Secure and reliable

### Daily Limit Protection
- Tracks emails sent per day
- Prevents exceeding free tier limits
- Automatic reset at midnight

### Fallback Options
- If EmailJS fails, falls back to mailto link
- User's email client opens with pre-filled message
- Ensures emails can always be sent

## Troubleshooting

### Email Not Sending
1. Check EmailJS dashboard for errors
2. Verify service is active
3. Confirm template variables match
4. Check daily limit hasn't been exceeded

### Rate Limiting
- Free tier: 200 emails/month
- Paid plans: Up to 10,000+ emails/month
- Daily limit tracking prevents overuse

### Security Notes
- Public key is safe to expose in frontend
- No sensitive credentials in client code
- All emails tracked in EmailJS dashboard

## Support

For EmailJS issues:
- Visit [EmailJS Documentation](https://www.emailjs.com/docs/)
- Check [EmailJS FAQ](https://www.emailjs.com/faq/)

For PulseCRM issues:
- Check the console for errors
- Verify environment variables are set
- Test with demo keys first