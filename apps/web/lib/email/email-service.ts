// Email configuration and sending functionality
// For production, replace with your actual email service (SendGrid, AWS SES, etc.)

interface EmailConfig {
  service: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Email templates
export const emailTemplates = {
  passwordReset: (resetLink: string, userEmail: string) => ({
    subject: 'Reset Your PulseCRM Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
          }
          .header {
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .logo {
            display: inline-block;
            background-color: #ff6600;
            color: white;
            width: 50px;
            height: 50px;
            line-height: 50px;
            border-radius: 8px;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .content {
            padding: 30px;
            background-color: #f8f9fa;
            border-radius: 0 0 8px 8px;
          }
          .button {
            display: inline-block;
            background-color: #ff6600;
            color: #ffffff;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            color: #666666;
            font-size: 12px;
            padding: 20px;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">P</div>
            <h1 style="margin: 0;">PulseCRM</h1>
            <p style="margin: 5px 0 0 0;">Construction Management System</p>
          </div>
          
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hi there,</p>
            <p>We received a request to reset the password for your PulseCRM account associated with <strong>${userEmail}</strong>.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password won't change until you create a new one</li>
              </ul>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px;">
              ${resetLink}
            </p>
          </div>
          
          <div class="footer">
            <p>This email was sent by PulseCRM</p>
            <p>© 2025 PulseCRM. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Reset Your PulseCRM Password

We received a request to reset the password for your PulseCRM account associated with ${userEmail}.

Click this link to reset your password:
${resetLink}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email. Your password won't change until you create a new one.

This email was sent by PulseCRM
© 2025 PulseCRM. All rights reserved.
    `
  }),

  passwordChanged: (userEmail: string) => ({
    subject: 'Your PulseCRM Password Has Been Changed',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Password Changed</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
          }
          .header {
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .logo {
            display: inline-block;
            background-color: #ff6600;
            color: white;
            width: 50px;
            height: 50px;
            line-height: 50px;
            border-radius: 8px;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .content {
            padding: 30px;
            background-color: #f8f9fa;
            border-radius: 0 0 8px 8px;
          }
          .success {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666666;
            font-size: 12px;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">P</div>
            <h1 style="margin: 0;">PulseCRM</h1>
            <p style="margin: 5px 0 0 0;">Construction Management System</p>
          </div>
          
          <div class="content">
            <h2>Password Changed Successfully</h2>
            <p>Hi there,</p>
            
            <div class="success">
              <strong>✅ Your password has been changed successfully!</strong>
              <p style="margin: 10px 0 0 0;">This change was made on ${new Date().toLocaleString()}</p>
            </div>
            
            <p>If you made this change, you can safely ignore this email.</p>
            
            <p><strong>If you didn't make this change:</strong></p>
            <ol>
              <li>Your account may be compromised</li>
              <li>Reset your password immediately</li>
              <li>Contact support if you need assistance</li>
            </ol>
            
            <p>For security reasons, you may need to sign in again on all your devices.</p>
          </div>
          
          <div class="footer">
            <p>This email was sent by PulseCRM</p>
            <p>© 2025 PulseCRM. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Password Changed Successfully

Your PulseCRM password has been changed successfully!

This change was made on ${new Date().toLocaleString()}

If you made this change, you can safely ignore this email.

If you didn't make this change:
1. Your account may be compromised
2. Reset your password immediately
3. Contact support if you need assistance

For security reasons, you may need to sign in again on all your devices.

This email was sent by PulseCRM
© 2025 PulseCRM. All rights reserved.
    `
  })
};

// Mock email sender for development
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // In development, log the email to console
  if (process.env.NODE_ENV === 'development') {
    console.log('=================================');
    console.log('📧 EMAIL SENT (Development Mode)');
    console.log('=================================');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Preview:', options.text?.substring(0, 200) + '...');
    console.log('=================================');
    
    // Optionally save to a file for testing
    const fs = await import('fs/promises');
    const path = await import('path');
    const emailLogPath = path.join(process.cwd(), 'data', 'sent-emails.log');
    const logEntry = `
${new Date().toISOString()}
To: ${options.to}
Subject: ${options.subject}
---
${options.text || 'No text version'}
=====================================
`;
    await fs.appendFile(emailLogPath, logEntry).catch(() => {});
    
    return true;
  }

  // Production email sending would go here
  // Example with nodemailer (you'll need to install it):
  /*
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@pulsecrm.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
  */

  // For now, just return true
  return true;
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  const template = emailTemplates.passwordReset(resetLink, email);
  return sendEmail({
    to: email,
    ...template
  });
}

// Send password changed notification
export async function sendPasswordChangedEmail(email: string): Promise<boolean> {
  const template = emailTemplates.passwordChanged(email);
  return sendEmail({
    to: email,
    ...template
  });
}
