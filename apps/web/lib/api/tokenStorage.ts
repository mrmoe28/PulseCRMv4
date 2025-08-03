// Shared in-memory token storage for OAuth tokens and state
// In production, this should be replaced with database storage or Redis

// Store OAuth tokens for integrations
const tokenStorage = new Map<string, any>();

// Store OAuth state tokens for CSRF protection
const stateTokens = new Map<string, { organizationId: string; userId: string; timestamp: number }>();

// Helper function to clean up expired state tokens
export function cleanupExpiredStateTokens() {
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  for (const [key, value] of stateTokens.entries()) {
    if (value.timestamp < tenMinutesAgo) {
      stateTokens.delete(key);
    }
  }
}

// Helper function to store demo tokens
export function storeDemoToken(organizationId: string, userId: string) {
  tokenStorage.set(`${organizationId}_google_calendar`, {
    connectedAt: new Date().toISOString(),
    connectedBy: userId,
    isDemo: true,
    // Mock token data for demo mode
    access_token: 'demo_access_token',
    refresh_token: 'demo_refresh_token',
    expires_at: Date.now() + 3600000, // 1 hour from now
    scope: 'https://www.googleapis.com/auth/calendar',
  });
}

export { tokenStorage, stateTokens };