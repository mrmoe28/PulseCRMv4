import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

// In-memory storage for signature requests (replace with database in production)
const signatureRequests = new Map<string, SignatureRequest>();

interface SignatureRequest {
  id: string;
  token: string;
  documentId: string;
  documentName: string;
  documentUrl: string;
  signerEmail: string;
  signerName: string;
  requestedBy: string;
  requestedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'viewed' | 'signed' | 'expired';
  ipAddress?: string;
  signedAt?: Date;
  signature?: string;
  auditTrail: AuditEntry[];
}

interface AuditEntry {
  action: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Configure email transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      documentId,
      documentName,
      documentUrl,
      signerEmail,
      signerName,
      requestedBy,
      message,
    } = body;

    // Validate required fields
    if (!documentId || !documentName || !documentUrl || !signerEmail || !signerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique token for this signature request
    const token = randomBytes(32).toString('hex');
    const requestId = randomBytes(16).toString('hex');

    // Create signature request
    const signatureRequest: SignatureRequest = {
      id: requestId,
      token,
      documentId,
      documentName,
      documentUrl,
      signerEmail,
      signerName,
      requestedBy: requestedBy || 'PulseCRM User',
      requestedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'pending',
      auditTrail: [
        {
          action: 'Signature request created',
          timestamp: new Date(),
          ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        },
      ],
    };

    // Store the signature request
    signatureRequests.set(token, signatureRequest);

    // Generate signature URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3010';
    const signatureUrl = `${baseUrl}/sign/${token}`;

    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Document Signature Request</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            display: inline-block;
            background-color: rgba(255,255,255,0.2);
            color: white;
            width: 60px;
            height: 60px;
            line-height: 60px;
            border-radius: 12px;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .content {
            padding: 40px 30px;
          }
          .document-info {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
          }
          .document-name {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 25px 0;
            text-align: center;
          }
          .button:hover {
            opacity: 0.9;
          }
          .security-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
          }
          .footer {
            background-color: #f8f9fa;
            text-align: center;
            padding: 25px;
            color: #6c757d;
            font-size: 13px;
            border-top: 1px solid #e9ecef;
          }
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
          .expiry-notice {
            color: #dc3545;
            font-weight: 600;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">P</div>
            <h1 style="margin: 0; font-size: 28px;">Signature Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">PulseCRM Document Management</p>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
              Hello ${signerName},
            </p>
            
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              ${requestedBy} has requested your signature on the following document:
            </p>
            
            <div class="document-info">
              <div class="document-name">📄 ${documentName}</div>
              <div style="color: #6c757d; font-size: 14px;">
                Requested on: ${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            ${message ? `
              <div style="background-color: #f0f8ff; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong style="color: #0066cc;">Message from ${requestedBy}:</strong>
                <p style="margin: 10px 0 0 0; color: #333;">${message}</p>
              </div>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="${signatureUrl}" class="button">
                ✍️ Review & Sign Document
              </a>
            </div>
            
            <div class="security-notice">
              <strong>🔒 Security Notice:</strong><br>
              This signature request is secure and legally binding. Your signature will be encrypted and stored securely. 
              An audit trail of all actions will be maintained for compliance purposes.
            </div>
            
            <p class="expiry-notice">
              ⏰ This signature request will expire in 7 days
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="font-size: 14px; color: #6c757d; line-height: 1.6;">
                <strong>What happens next?</strong><br>
                1. Click the button above to review the document<br>
                2. Type your full name to create your signature<br>
                3. Click "Sign Document" to complete the process<br>
                4. You'll receive a copy of the signed document via email
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0 0 10px 0;">
              This email was sent by PulseCRM Document Management System
            </p>
            <p style="margin: 0;">
              If you have questions, please contact <a href="mailto:${process.env.SMTP_FROM || 'support@pulsecrm.com'}">support</a>
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">
              © ${new Date().getFullYear()} PulseCRM. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM || 'PulseCRM <noreply@pulsecrm.com>',
      to: signerEmail,
      subject: `Signature Requested: ${documentName}`,
      html: emailHtml,
      text: `Hello ${signerName},\n\n${requestedBy} has requested your signature on: ${documentName}\n\nClick here to sign: ${signatureUrl}\n\nThis request will expire in 7 days.\n\nPulseCRM Document Management`,
    };

    await transporter.sendMail(mailOptions);

    // Add email sent to audit trail
    signatureRequest.auditTrail.push({
      action: 'Signature request email sent',
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
    });

    return NextResponse.json({
      success: true,
      message: 'Signature request sent successfully',
      requestId,
      token,
      signatureUrl,
      expiresAt: signatureRequest.expiresAt,
    });

  } catch (error) {
    console.error('Error sending signature request:', error);
    return NextResponse.json(
      { error: 'Failed to send signature request' },
      { status: 500 }
    );
  }
}

// Export for use in other routes
export { signatureRequests };