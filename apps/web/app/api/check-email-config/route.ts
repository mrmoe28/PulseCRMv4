import { NextResponse } from 'next/server';

export async function GET() {
  const isConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  return NextResponse.json({
    configured: isConfigured,
    message: isConfigured 
      ? 'Email service is configured' 
      : 'Email service requires configuration. Please set SMTP environment variables.',
  });
}