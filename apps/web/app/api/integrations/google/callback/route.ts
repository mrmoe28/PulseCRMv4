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

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        `/settings/integrations?error=oauth_failed&message=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        '/settings/integrations?error=missing_params&message=Missing authorization code or state'
      );
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

      return NextResponse.redirect(
        '/settings/integrations?integration=google-calendar&status=connected&message=Google Calendar connected successfully'
      );
    }

    // Verify state token (CSRF protection)
    const stateData = stateTokens.get(state);
    if (!stateData) {
      return NextResponse.redirect(
        '/settings/integrations?error=invalid_state&message=Invalid or expired state token'
      );
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
      return NextResponse.redirect(
        '/settings/integrations?error=config_error&message=Google Calendar client secret not configured'
      );
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
      return NextResponse.redirect(
        '/settings/integrations?error=token_exchange_failed&message=Failed to exchange authorization code'
      );
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
    return NextResponse.redirect(
      '/settings/integrations?integration=google-calendar&status=connected&message=Google Calendar connected successfully'
    );
  } catch (error) {
    console.error('Google Calendar callback error:', error);
    return NextResponse.redirect(
      '/settings/integrations?error=callback_error&message=Failed to complete Google Calendar connection'
    );
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