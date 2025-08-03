import { NextRequest, NextResponse } from 'next/server';

// Access global signature requests storage
declare global {
  var signatureRequests: Map<string, any> | undefined;
}

// Initialize if not exists
if (!global.signatureRequests) {
  global.signatureRequests = new Map<string, any>();
}

const signatureRequests = global.signatureRequests;

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Get signature request by token
    const signatureRequest = signatureRequests.get(token);

    if (!signatureRequest) {
      return NextResponse.json(
        { error: 'Invalid or expired signature request' },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > signatureRequest.expiresAt) {
      signatureRequest.status = 'expired';
      return NextResponse.json(
        { error: 'This signature request has expired' },
        { status: 410 }
      );
    }

    // Check if already signed
    if (signatureRequest.status === 'signed') {
      return NextResponse.json(
        { 
          error: 'This document has already been signed',
          signedAt: signatureRequest.signedAt 
        },
        { status: 409 }
      );
    }

    // Update status to viewed if still pending
    if (signatureRequest.status === 'pending') {
      signatureRequest.status = 'viewed';
      signatureRequest.auditTrail.push({
        action: 'Document viewed by signer',
        timestamp: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
      });
    }

    // Return signature request details (excluding sensitive data)
    return NextResponse.json({
      id: signatureRequest.id,
      documentName: signatureRequest.documentName,
      documentUrl: signatureRequest.documentUrl,
      signerName: signatureRequest.signerName,
      signerEmail: signatureRequest.signerEmail,
      requestedBy: signatureRequest.requestedBy,
      requestedAt: signatureRequest.requestedAt,
      expiresAt: signatureRequest.expiresAt,
      status: signatureRequest.status,
    });

  } catch (error) {
    console.error('Error getting signature request:', error);
    return NextResponse.json(
      { error: 'Failed to get signature request' },
      { status: 500 }
    );
  }
}