import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import nodemailer from 'nodemailer';
import { signatureRequests } from '../send/route';

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
    const { token, signature, consent } = body;

    // Validate required fields
    if (!token || !signature || !consent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get signature request
    const signatureRequest = signatureRequests.get(token);

    if (!signatureRequest) {
      return NextResponse.json(
        { error: 'Invalid signature request' },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > signatureRequest.expiresAt) {
      return NextResponse.json(
        { error: 'This signature request has expired' },
        { status: 410 }
      );
    }

    // Check if already signed
    if (signatureRequest.status === 'signed') {
      return NextResponse.json(
        { error: 'This document has already been signed' },
        { status: 409 }
      );
    }

    // Record signature
    const ipAddress = request.headers.get('x-forwarded-for') || request.ip;
    const userAgent = request.headers.get('user-agent') || '';
    
    signatureRequest.status = 'signed';
    signatureRequest.signature = signature;
    signatureRequest.signedAt = new Date();
    signatureRequest.ipAddress = ipAddress;
    
    // Add to audit trail
    signatureRequest.auditTrail.push({
      action: 'Document signed',
      timestamp: new Date(),
      ipAddress,
      userAgent,
    });

    // Fetch the PDF document
    const pdfResponse = await fetch(signatureRequest.documentUrl);
    const pdfBuffer = await pdfResponse.arrayBuffer();
    
    // Load and modify the PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const { width, height } = lastPage.getSize();
    
    // Add signature text
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const signatureText = `Electronically signed by: ${signature}`;
    const dateText = `Date: ${new Date().toLocaleString()}`;
    const ipText = `IP Address: ${ipAddress}`;
    const docIdText = `Document ID: ${signatureRequest.id}`;
    
    // Add signature block at bottom of last page
    const yPosition = 100;
    lastPage.drawText(signatureText, {
      x: 50,
      y: yPosition,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    
    lastPage.drawText(dateText, {
      x: 50,
      y: yPosition - 20,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    
    lastPage.drawText(ipText, {
      x: 50,
      y: yPosition - 40,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    
    lastPage.drawText(docIdText, {
      x: 50,
      y: yPosition - 60,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    
    // Draw a line above signature
    lastPage.drawLine({
      start: { x: 50, y: yPosition + 10 },
      end: { x: 300, y: yPosition + 10 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    // Save the signed PDF
    const signedPdfBytes = await pdfDoc.save();
    const signedPdfBuffer = Buffer.from(signedPdfBytes);
    
    // Send confirmation emails
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3010';
    
    // Email to signer
    const signerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; }
          .success-icon { font-size: 48px; }
          .details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #6c757d; font-size: 12px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1>Document Signed Successfully</h1>
          </div>
          <div class="content">
            <p>Hello ${signatureRequest.signerName},</p>
            <p>You have successfully signed the following document:</p>
            <div class="details">
              <strong>Document:</strong> ${signatureRequest.documentName}<br>
              <strong>Signed on:</strong> ${new Date().toLocaleString()}<br>
              <strong>Document ID:</strong> ${signatureRequest.id}
            </div>
            <p>A copy of the signed document is attached to this email for your records.</p>
            <p><strong>Audit Trail:</strong></p>
            <ul>
              ${signatureRequest.auditTrail.map(entry => 
                `<li>${entry.action} - ${new Date(entry.timestamp).toLocaleString()}</li>`
              ).join('')}
            </ul>
          </div>
          <div class="footer">
            <p>This is a legally binding electronic signature.</p>
            <p>© ${new Date().getFullYear()} PulseCRM. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'PulseCRM <noreply@pulsecrm.com>',
      to: signatureRequest.signerEmail,
      subject: `Document Signed: ${signatureRequest.documentName}`,
      html: signerEmailHtml,
      attachments: [
        {
          filename: `Signed_${signatureRequest.documentName}`,
          content: signedPdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
    
    // Email to requester (if email is available)
    if (process.env.NOTIFICATION_EMAIL) {
      const requesterEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 30px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Document Signature Completed</h1>
            </div>
            <div class="content">
              <p><strong>${signatureRequest.signerName}</strong> has signed the document:</p>
              <p><strong>${signatureRequest.documentName}</strong></p>
              <p>Signed on: ${new Date().toLocaleString()}</p>
              <p>The signed document is attached.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'PulseCRM <noreply@pulsecrm.com>',
        to: process.env.NOTIFICATION_EMAIL,
        subject: `Signature Completed: ${signatureRequest.documentName}`,
        html: requesterEmailHtml,
        attachments: [
          {
            filename: `Signed_${signatureRequest.documentName}`,
            content: signedPdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    }
    
    // Add email notifications to audit trail
    signatureRequest.auditTrail.push({
      action: 'Confirmation emails sent',
      timestamp: new Date(),
      ipAddress,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Document signed successfully',
      signedAt: signatureRequest.signedAt,
      documentId: signatureRequest.id,
    });

  } catch (error) {
    console.error('Error completing signature:', error);
    return NextResponse.json(
      { error: 'Failed to complete signature' },
      { status: 500 }
    );
  }
}