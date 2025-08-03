import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Store state tokens temporarily (in production, use Redis or database)
const stateTokens = new Map<string, { organizationId: string; userId: string; timestamp: number }>();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const userId = searchParams.get('userId');
    const returnUrl = searchParams.get('returnUrl') || '/settings/integrations';

    if (!organizationId || !userId) {
      return NextResponse.json(
        { error: 'Missing organizationId or userId' },
        { status: 400 }
      );
    }

    // Check if we have Google OAuth credentials
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI || 
      `${process.env.NEXTAUTH_URL || 'http://localhost:3010'}/api/integrations/google/callback`;

    if (!clientId) {
      // Always use demo mode when credentials are not configured
      // This provides a better user experience and allows testing without setup
      const message = process.env.NODE_ENV === 'production' 
        ? 'Google Calendar connected (Demo Mode - Add GOOGLE_CALENDAR_CLIENT_ID for production)'
        : 'Google Calendar connected (Demo Mode)';
      
      return NextResponse.redirect(
        `${returnUrl}?integration=google-calendar&status=demo-connected&message=${encodeURIComponent(message)}`
      );
    }

    // Generate state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    stateTokens.set(state, {
      organizationId,
      userId,
      timestamp: Date.now(),
    });

    // Clean up old state tokens (older than 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [key, value] of stateTokens.entries()) {
      if (value.timestamp < tenMinutesAgo) {
        stateTokens.delete(key);
      }
    }

    // Build Google OAuth URL
    const authParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
      access_type: 'offline',
      prompt: 'consent',
      state: state,
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;

    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google Calendar OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google Calendar authentication' },
      { status: 500 }
    );
  }
}

// Export the state tokens for use in the callback
export { stateTokens };