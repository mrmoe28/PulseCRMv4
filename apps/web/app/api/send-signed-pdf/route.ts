import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';
import nodemailer from 'nodemailer';

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SignatureData {
  userId: string;
  imageUrl: string;
  page: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  signedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File;
    const signaturesJson = formData.get('signatures') as string;
    const documentName = formData.get('documentName') as string;
    
    if (!pdfFile || !signaturesJson) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const signatures: SignatureData[] = JSON.parse(signaturesJson);
    
    // Load the PDF
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Process each signature
    for (const signature of signatures) {
      const page = pdfDoc.getPage(signature.page - 1); // Pages are 0-indexed
      const { width, height } = page.getSize();
      
      // Calculate actual position and size
      const x = (signature.xPercent / 100) * width;
      const y = height - ((signature.yPercent / 100) * height); // PDF coordinates are bottom-up
      const sigWidth = (signature.widthPercent / 100) * width;
      
      // Convert base64 image to buffer
      const imageData = signature.imageUrl.split(',')[1];
      const imageBytes = Buffer.from(imageData, 'base64');
      
      // Embed the image
      let image;
      if (signature.imageUrl.includes('image/png')) {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        image = await pdfDoc.embedJpg(imageBytes);
      }
      
      // Calculate aspect ratio
      const aspectRatio = image.width / image.height;
      const sigHeight = sigWidth / aspectRatio;
      
      // Draw the signature
      page.drawImage(image, {
        x: x,
        y: y - sigHeight, // Adjust for top-left origin
        width: sigWidth,
        height: sigHeight,
      });
      
      // Add timestamp
      page.drawText(`Signed: ${new Date(signature.signedAt).toLocaleDateString()}`, {
        x: x,
        y: y - sigHeight - 15,
        size: 8,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
    
    // Save the modified PDF
    const signedPdfBytes = await pdfDoc.save();
    const signedPdfBuffer = Buffer.from(signedPdfBytes);
    
    // Get user email from session/auth (placeholder)
    const userEmail = process.env.DEFAULT_EMAIL || 'user@example.com';
    const recipientEmails = process.env.RECIPIENT_EMAILS?.split(',') || [userEmail];
    
    // Send email with the signed PDF
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@constructflow.com',
      to: recipientEmails,
      subject: `Signed Document: ${documentName}`,
      text: `Please find attached the signed document: ${documentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Document Signed Successfully</h2>
          <p>The following document has been signed and is attached to this email:</p>
          <p><strong>${documentName}</strong></p>
          <p>Signed on: ${new Date().toLocaleString()}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from ConstructFlow Document Management System.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Signed_${documentName}`,
          content: signedPdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };
    
    // Send the email
    await transporter.sendMail(mailOptions);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Document signed and emailed successfully',
      recipients: recipientEmails,
    });
    
  } catch (error) {
    console.error('Error processing signed PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process signed document' },
      { status: 500 }
    );
  }
}
