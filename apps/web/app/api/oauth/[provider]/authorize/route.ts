import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { stateTokens } from '@/lib/api/tokenStorage';
import { getOAuthConfig, hasOAuthConfig, buildAuthUrl } from '@/lib/api/oauth-config';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const searchParams = req.nextUrl.searchParams;
    const organizationId = searchParams.get('org') || searchParams.get('organizationId');
    const userId = searchParams.get('userId') || 'system';
    const returnUrl = searchParams.get('returnUrl') || '/settings/integrations';
    
    // Get the base URL for constructing absolute URLs
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Missing organizationId' },
        { status: 400 }
      );
    }
    
    // Check if OAuth is configured for this provider
    if (!hasOAuthConfig(provider)) {
      return NextResponse.json(
        { error: `OAuth integration for ${provider} is not configured. Please add the required credentials to your environment variables.` },
        { status: 503 }
      );
    }
    
    // Special handling for Stripe (API key based)
    if (provider === 'stripe') {
      // Redirect to a page where user can enter API key
      const redirectUrl = new URL(returnUrl, baseUrl);
      redirectUrl.searchParams.set('integration', 'stripe');
      redirectUrl.searchParams.set('setup', 'api-key');
      redirectUrl.searchParams.set('message', 'Enter your Stripe API key to connect');
      
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
    
    // Clean up old state tokens (older than 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [key, value] of stateTokens.entries()) {
      if (value.timestamp < tenMinutesAgo) {
        stateTokens.delete(key);
      }
    }
    
    // Build redirect URI for callback
    const redirectUri = `${process.env.NEXTAUTH_URL || baseUrl}/api/oauth/${provider}/callback`;
    
    // Build OAuth authorization URL
    const authUrl = buildAuthUrl(provider, state, redirectUri);
    
    if (!authUrl) {
      return NextResponse.json(
        { error: `Failed to build authorization URL for ${provider}` },
        { status: 500 }
      );
    }
    
    // Redirect to provider's OAuth page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error(`OAuth authorize error:`, error);
    
    // Redirect back with error
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const returnUrl = req.nextUrl.searchParams.get('returnUrl') || '/settings/integrations';
    const errorUrl = new URL(returnUrl, baseUrl);
    errorUrl.searchParams.set('error', 'oauth_error');
    errorUrl.searchParams.set('message', `Failed to initiate authentication`);
    
    return NextResponse.redirect(errorUrl.toString());
  }
}