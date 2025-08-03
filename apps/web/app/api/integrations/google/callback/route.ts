import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Import state tokens from auth route (in production, use shared storage)
const stateTokens = new Map<string, { organizationId: string; userId: string; timestamp: number }>();

// Simple in-memory storage for tokens (replace with database in production)
const tokenStorage = new Map<string, any>();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Get the base URL for constructing absolute URLs
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error);
      const errorUrl = new URL('/settings/integrations', baseUrl);
      errorUrl.searchParams.set('error', 'oauth_failed');
      errorUrl.searchParams.set('message', error);
      return NextResponse.redirect(errorUrl.toString());
    }

    if (!code || !state) {
      const errorUrl = new URL('/settings/integrations', baseUrl);
      errorUrl.searchParams.set('error', 'missing_params');
      errorUrl.searchParams.set('message', 'Missing authorization code or state');
      return NextResponse.redirect(errorUrl.toString());
    }

    // For development/demo mode without real OAuth
    if (!process.env.GOOGLE_CALENDAR_CLIENT_ID) {
      // Store mock tokens
      const mockTokens = {
        access_token: 'demo_access_token_' + crypto.randomBytes(16).toString('hex'),
        refresh_token: 'demo_refresh_token_' + crypto.randomBytes(16).toString('hex'),
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'https://www.googleapis.com/auth/calendar',
      };

      // Store for demo purposes
      tokenStorage.set('demo_org', mockTokens);

      const successUrl = new URL('/settings/integrations', baseUrl);
      successUrl.searchParams.set('integration', 'google-calendar');
      successUrl.searchParams.set('status', 'connected');
      successUrl.searchParams.set('message', 'Google Calendar connected successfully');
      return NextResponse.redirect(successUrl.toString());
    }

    // Verify state token (CSRF protection)
    const stateData = stateTokens.get(state);
    if (!stateData) {
      const errorUrl = new URL('/settings/integrations', baseUrl);
      errorUrl.searchParams.set('error', 'invalid_state');
      errorUrl.searchParams.set('message', 'Invalid or expired state token');
      return NextResponse.redirect(errorUrl.toString());
    }

    // Clean up used state token
    stateTokens.delete(state);

    const { organizationId, userId } = stateData;

    // Exchange authorization code for tokens
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI || 
      `${process.env.NEXTAUTH_URL || 'http://localhost:3010'}/api/integrations/google/callback`;

    if (!clientSecret) {
      const errorUrl = new URL('/settings/integrations', baseUrl);
      errorUrl.searchParams.set('error', 'config_error');
      errorUrl.searchParams.set('message', 'Google Calendar client secret not configured');
      return NextResponse.redirect(errorUrl.toString());
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      const errorUrl = new URL('/settings/integrations', baseUrl);
      errorUrl.searchParams.set('error', 'token_exchange_failed');
      errorUrl.searchParams.set('message', 'Failed to exchange authorization code');
      return NextResponse.redirect(errorUrl.toString());
    }

    const tokens = await tokenResponse.json();

    // Store tokens securely (encrypted in production)
    // For now, using in-memory storage
    const encryptedTokens = {
      access_token: Buffer.from(tokens.access_token).toString('base64'),
      refresh_token: tokens.refresh_token ? Buffer.from(tokens.refresh_token).toString('base64') : null,
      expires_at: Date.now() + (tokens.expires_in * 1000),
      scope: tokens.scope,
    };

    // Store tokens associated with organization
    tokenStorage.set(`${organizationId}_google_calendar`, {
      ...encryptedTokens,
      connectedAt: new Date().toISOString(),
      connectedBy: userId,
    });

    // Make a test API call to verify the connection
    try {
      const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      if (!calendarResponse.ok) {
        console.error('Calendar API test failed');
      }
    } catch (testError) {
      console.error('Calendar API test error:', testError);
    }

    // Redirect back to integrations page with success message
    const successUrl = new URL('/settings/integrations', baseUrl);
    successUrl.searchParams.set('integration', 'google-calendar');
    successUrl.searchParams.set('status', 'connected');
    successUrl.searchParams.set('message', 'Google Calendar connected successfully');
    return NextResponse.redirect(successUrl.toString());
  } catch (error) {
    console.error('Google Calendar callback error:', error);
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const errorUrl = new URL('/settings/integrations', baseUrl);
    errorUrl.searchParams.set('error', 'callback_error');
    errorUrl.searchParams.set('message', 'Failed to complete Google Calendar connection');
    return NextResponse.redirect(errorUrl.toString());
  }
}

// Helper function to refresh access token
export async function refreshAccessToken(organizationId: string): Promise<string | null> {
  try {
    const storedTokens = tokenStorage.get(`${organizationId}_google_calendar`);
    if (!storedTokens || !storedTokens.refresh_token) {
      return null;
    }

    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return null;
    }

    const refreshToken = Buffer.from(storedTokens.refresh_token, 'base64').toString('utf-8');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      console.error('Token refresh failed');
      return null;
    }

    const newTokens = await response.json();

    // Update stored tokens
    storedTokens.access_token = Buffer.from(newTokens.access_token).toString('base64');
    storedTokens.expires_at = Date.now() + (newTokens.expires_in * 1000);
    tokenStorage.set(`${organizationId}_google_calendar`, storedTokens);

    return newTokens.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

// Export token storage for use in other routes
export { tokenStorage };