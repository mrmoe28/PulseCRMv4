import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { stateTokens, cleanupExpiredStateTokens, storeDemoToken } from '@/lib/api/tokenStorage';
import { hasOAuthConfig, buildAuthUrl } from '@/lib/api/oauth-config';

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
    const provider = 'google-calendar';
    const hasConfig = hasOAuthConfig(provider);
    
    if (!hasConfig) {
      // Always use demo mode when credentials are not configured
      // This provides a better user experience and allows testing without setup
      const message = process.env.NODE_ENV === 'production' 
        ? 'Google Calendar connected (Demo Mode - Add GOOGLE_CALENDAR_CLIENT_ID for production)'
        : 'Google Calendar connected (Demo Mode)';
      
      // Store demo token for connection status checking
      storeDemoToken(`${organizationId}_google_calendar`, userId);
      
      // Construct absolute URL for redirect
      const redirectUrl = new URL(returnUrl, baseUrl);
      redirectUrl.searchParams.set('integration', 'google-calendar');
      redirectUrl.searchParams.set('status', 'demo-connected');
      redirectUrl.searchParams.set('message', message);
      
      return NextResponse.redirect(redirectUrl.toString());
    }

    // Generate state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    stateTokens.set(state, {
      organizationId,
      userId,
      provider,
      returnUrl,
      timestamp: Date.now(),
    });

    // Clean up old state tokens
    cleanupExpiredStateTokens();

    // Build redirect URI for callback
    const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI || 
      `${process.env.NEXTAUTH_URL || baseUrl}/api/integrations/google/callback`;

    // Build OAuth authorization URL using shared config
    const authUrl = buildAuthUrl(provider, state, redirectUri);
    
    if (!authUrl) {
      throw new Error('Failed to build authorization URL');
    }

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