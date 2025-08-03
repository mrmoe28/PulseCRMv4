import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { stateTokens, cleanupExpiredStateTokens } from '@/lib/api/tokenStorage';
import { googleCalendarService } from '@/lib/services/google-calendar.service';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const userId = searchParams.get('userId');
    const returnUrl = searchParams.get('returnUrl') || '/settings/integrations';
    
    // Get the base URL for constructing absolute URLs
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    if (!organizationId || !userId) {
      return NextResponse.json(
        { error: 'Missing organizationId or userId' },
        { status: 400 }
      );
    }

    // Check if we have Google OAuth credentials
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Google Calendar integration is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables.' },
        { status: 503 }
      );
    }

    // Generate state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    stateTokens.set(state, {
      organizationId,
      userId,
      provider: 'google-calendar',
      returnUrl,
      timestamp: Date.now(),
    });

    // Clean up old state tokens
    cleanupExpiredStateTokens();

    // Build redirect URI for callback
    const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI || 
      `${process.env.NEXTAUTH_URL || baseUrl}/api/oauth/google-calendar/callback`;

    // Build OAuth authorization URL using Google Calendar service
    const authUrl = googleCalendarService.getAuthorizationUrl(state, redirectUri);

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

// State tokens are now imported from shared module