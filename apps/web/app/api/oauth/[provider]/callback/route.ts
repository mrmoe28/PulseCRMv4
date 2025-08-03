import { NextRequest, NextResponse } from 'next/server';
import { tokenStorage, stateTokens } from '@/lib/api/tokenStorage';
import { exchangeCodeForTokens } from '@/lib/api/oauth-config';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Get the base URL for constructing absolute URLs
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    
    // Handle OAuth errors
    if (error) {
      console.error(`OAuth error for ${provider}:`, error);
      const errorUrl = new URL('/settings/integrations', baseUrl);
      errorUrl.searchParams.set('error', 'oauth_failed');
      errorUrl.searchParams.set('message', `${provider} authorization failed: ${error}`);
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
    const redirectUri = `${process.env.NEXTAUTH_URL || baseUrl}/api/oauth/${provider}/callback`;
    
    try {
      // Exchange authorization code for tokens
      const tokens = await exchangeCodeForTokens(provider, code, redirectUri);
      
      // Store tokens securely (encrypted in production)
      const tokenKey = `${organizationId}_${provider}`;
      const storedTokens = {
        access_token: Buffer.from(tokens.access_token).toString('base64'),
        refresh_token: tokens.refresh_token ? Buffer.from(tokens.refresh_token).toString('base64') : null,
        expires_at: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : null,
        scope: tokens.scope,
        token_type: tokens.token_type,
        connectedAt: new Date().toISOString(),
        connectedBy: userId,
      };
      
      // Add provider-specific data
      if (provider === 'slack') {
        storedTokens.team = tokens.team;
        storedTokens.incoming_webhook = tokens.incoming_webhook;
      } else if (provider === 'quickbooks') {
        storedTokens.realmId = tokens.realmId || searchParams.get('realmId');
        storedTokens.company_id = tokens.company_id;
      }
      
      tokenStorage.set(tokenKey, storedTokens);
      
      // Test the connection by making a simple API call
      let connectionTest = { success: true };
      
      if (provider === 'gmail') {
        // Test Gmail API
        const testResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });
        connectionTest.success = testResponse.ok;
        if (testResponse.ok) {
          const profile = await testResponse.json();
          storedTokens.email = profile.emailAddress;
        }
      } else if (provider === 'slack') {
        // Test Slack API
        const testResponse = await fetch('https://slack.com/api/auth.test', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });
        connectionTest = await testResponse.json();
        if (connectionTest.ok) {
          storedTokens.team_name = connectionTest.team;
          storedTokens.user = connectionTest.user;
        }
      } else if (provider === 'quickbooks') {
        // Test QuickBooks API
        const companyId = storedTokens.realmId;
        if (companyId) {
          const testResponse = await fetch(
            `https://sandbox-quickbooks.api.intuit.com/v3/company/${companyId}/companyinfo/${companyId}`,
            {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                Accept: 'application/json',
              },
            }
          );
          connectionTest.success = testResponse.ok;
        }
      }
      
      // Update stored tokens with connection test results
      tokenStorage.set(tokenKey, storedTokens);
      
      // Redirect back to integrations page with success message
      const successUrl = new URL(returnUrl || '/settings/integrations', baseUrl);
      successUrl.searchParams.set('integration', provider);
      successUrl.searchParams.set('status', 'connected');
      successUrl.searchParams.set('message', `${provider} connected successfully`);
      
      return NextResponse.redirect(successUrl.toString());
    } catch (tokenError: any) {
      console.error(`Token exchange failed for ${provider}:`, tokenError);
      
      const errorUrl = new URL(returnUrl || '/settings/integrations', baseUrl);
      errorUrl.searchParams.set('error', 'token_exchange_failed');
      errorUrl.searchParams.set('message', tokenError.message || 'Failed to complete authorization');
      
      return NextResponse.redirect(errorUrl.toString());
    }
  } catch (error) {
    console.error(`OAuth callback error for ${params.provider}:`, error);
    
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const errorUrl = new URL('/settings/integrations', baseUrl);
    errorUrl.searchParams.set('error', 'callback_error');
    errorUrl.searchParams.set('message', `Failed to complete ${params.provider} connection`);
    
    return NextResponse.redirect(errorUrl.toString());
  }
}