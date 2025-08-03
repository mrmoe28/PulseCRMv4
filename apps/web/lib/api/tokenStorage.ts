// OAuth token storage with state management
// TODO: Replace in-memory storage with database in production

import crypto from 'crypto';

// Store OAuth tokens for integrations (temporary in-memory storage)
const tokenStorage = new Map<string, any>();

// Store OAuth state tokens for CSRF protection
const stateTokens = new Map<string, { 
  organizationId: string; 
  userId: string; 
  provider?: string;
  returnUrl?: string;
  timestamp: number;
}>();

// Helper function to clean up expired state tokens
export function cleanupExpiredStateTokens() {
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  for (const [key, value] of stateTokens.entries()) {
    if (value.timestamp < tenMinutesAgo) {
      stateTokens.delete(key);
    }
  }
}

// Store OAuth tokens securely
export function storeOAuthTokens(
  organizationId: string, 
  provider: string, 
  tokens: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    token_type?: string;
  }
) {
  const tokenKey = `${organizationId}_${provider}`;
  
  // Calculate expiry time
  const expiresAt = tokens.expires_in 
    ? Date.now() + (tokens.expires_in * 1000)
    : Date.now() + 3600000; // Default 1 hour
  
  tokenStorage.set(tokenKey, {
    ...tokens,
    expires_at: expiresAt,
    stored_at: new Date().toISOString(),
    provider: provider,
  });
  
  return tokenKey;
}

// Get OAuth tokens
export function getOAuthTokens(organizationId: string, provider: string) {
  const tokenKey = `${organizationId}_${provider}`;
  return tokenStorage.get(tokenKey);
}

// Delete OAuth tokens
export function deleteOAuthTokens(organizationId: string, provider: string) {
  const tokenKey = `${organizationId}_${provider}`;
  return tokenStorage.delete(tokenKey);
}

// Check if tokens are expired
export function isTokenExpired(tokens: any): boolean {
  if (!tokens || !tokens.expires_at) {
    return true;
  }
  // Add 5 minute buffer before expiry
  return Date.now() > (tokens.expires_at - 300000);
}

export { tokenStorage, stateTokens };