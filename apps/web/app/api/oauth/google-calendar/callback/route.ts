import { NextRequest, NextResponse } from 'next/server';
import { stateTokens, storeOAuthTokens } from '@/lib/api/tokenStorage';
import { googleCalendarService } from '@/lib/services/google-calendar.service';

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
      console.error('OAuth error from Google:', error);
      const errorUrl = new URL('/settings/integrations', baseUrl);
      errorUrl.searchParams.set('error', 'oauth_failed');
      errorUrl.searchParams.set('message', `Google Calendar authorization failed: ${error}`);
      return NextResponse.redirect(errorUrl.toString());
    }
    
    if (!code || !state) {
      const errorUrl = new URL('/settings/integrations', baseUrl);
      errorUrl.searchParams.set('error', 'missing_params');
      errorUrl.searchParams.set('message', 'Missing authorization code or state');
      return NextResponse.redirect(errorUrl.toString());
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
    
    const { organizationId, userId, returnUrl } = stateData;
    const redirectUri = `${process.env.NEXTAUTH_URL || baseUrl}/api/oauth/google-calendar/callback`;
    
    try {
      // Exchange authorization code for tokens
      const { tokens, userInfo } = await googleCalendarService.exchangeCodeForTokens(
        code,
        redirectUri
      );
      
      // Store tokens
      storeOAuthTokens(organizationId, 'google-calendar', {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token!,
        expires_in: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600,
        scope: tokens.scope || '',
        token_type: tokens.token_type || 'Bearer',
      });
      
      // Store additional user info if needed
      const tokenData = {
        ...tokens,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        connectedBy: userId,
      };
      
      // Success! Redirect back to the return URL
      const successUrl = new URL(returnUrl || '/settings/integrations', baseUrl);
      successUrl.searchParams.set('integration', 'google-calendar');
      successUrl.searchParams.set('status', 'connected');
      successUrl.searchParams.set('message', `Google Calendar connected successfully for ${userInfo.email}`);
      
      return NextResponse.redirect(successUrl.toString());
    } catch (error: any) {
      console.error('Token exchange error:', error);
      
      const errorUrl = new URL(returnUrl || '/settings/integrations', baseUrl);
      errorUrl.searchParams.set('error', 'token_exchange_failed');
      errorUrl.searchParams.set('message', error.message || 'Failed to exchange authorization code for tokens');
      
      return NextResponse.redirect(errorUrl.toString());
    }
  } catch (error) {
    console.error('Google Calendar callback error:', error);
    
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const errorUrl = new URL('/settings/integrations', baseUrl);
    errorUrl.searchParams.set('error', 'callback_error');
    errorUrl.searchParams.set('message', 'An error occurred during Google Calendar authorization');
    
    return NextResponse.redirect(errorUrl.toString());
  }
}