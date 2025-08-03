// OAuth configuration for all supported providers
// This centralizes OAuth settings for Gmail, Slack, QuickBooks, and other services

export interface OAuthProvider {
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientId?: string;
  clientSecret?: string;
  responseType?: string;
  grantType?: string;
  accessType?: string;
  prompt?: string;
}

export const oauthProviders: Record<string, OAuthProvider> = {
  'google-calendar': {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    responseType: 'code',
    grantType: 'authorization_code',
    accessType: 'offline',
    prompt: 'consent',
  },
  
  gmail: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://mail.google.com/'
    ],
    clientId: process.env.GOOGLE_CLIENT_ID, // Same as Google Calendar
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    responseType: 'code',
    grantType: 'authorization_code',
    accessType: 'offline',
    prompt: 'consent',
  },
  
  slack: {
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scopes: [
      'channels:read',
      'chat:write',
      'users:read',
      'incoming-webhook'
    ],
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    responseType: 'code',
    grantType: 'authorization_code',
  },
  
  quickbooks: {
    authUrl: 'https://appcenter.intuit.com/connect/oauth2',
    tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    scopes: ['com.intuit.quickbooks.accounting'],
    clientId: process.env.QUICKBOOKS_CLIENT_ID,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
    responseType: 'code',
    grantType: 'authorization_code',
  },
  
  // Stripe uses API keys, not OAuth
  stripe: {
    authUrl: '', // Not used - Stripe uses API keys
    tokenUrl: '',
    scopes: [],
    clientId: process.env.STRIPE_PUBLISHABLE_KEY,
    clientSecret: process.env.STRIPE_SECRET_KEY,
  }
};

/**
 * Get OAuth configuration for a provider
 */
export function getOAuthConfig(provider: string): OAuthProvider | null {
  return oauthProviders[provider] || null;
}

/**
 * Check if a provider has OAuth configured
 */
export function hasOAuthConfig(provider: string): boolean {
  const config = oauthProviders[provider];
  if (!config) return false;
  
  // For Stripe, just check if API keys exist
  if (provider === 'stripe') {
    return !!config.clientSecret;
  }
  
  // For OAuth providers, check client ID and secret
  return !!(config.clientId && config.clientSecret);
}

/**
 * Build OAuth authorization URL
 */
export function buildAuthUrl(
  provider: string,
  state: string,
  redirectUri: string
): string | null {
  const config = oauthProviders[provider];
  if (!config || !config.authUrl || !config.clientId) {
    return null;
  }
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: config.responseType || 'code',
    scope: config.scopes.join(' '),
    state: state,
  });
  
  // Add provider-specific parameters
  if (provider === 'google-calendar' || provider === 'gmail') {
    params.append('access_type', config.accessType || 'offline');
    params.append('prompt', config.prompt || 'consent');
  }
  
  return `${config.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  provider: string,
  code: string,
  redirectUri: string
): Promise<any> {
  const config = oauthProviders[provider];
  if (!config || !config.tokenUrl) {
    throw new Error(`OAuth not configured for provider: ${provider}`);
  }
  
  const params = new URLSearchParams({
    code,
    client_id: config.clientId || '',
    client_secret: config.clientSecret || '',
    redirect_uri: redirectUri,
    grant_type: config.grantType || 'authorization_code',
  });
  
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }
  
  return response.json();
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(
  provider: string,
  refreshToken: string
): Promise<any> {
  const config = oauthProviders[provider];
  if (!config || !config.tokenUrl) {
    throw new Error(`OAuth not configured for provider: ${provider}`);
  }
  
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: config.clientId || '',
    client_secret: config.clientSecret || '',
    grant_type: 'refresh_token',
  });
  
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }
  
  return response.json();
}