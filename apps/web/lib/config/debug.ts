/**
 * Debug configuration for development and production environments
 */

export const debugConfig = {
    // Enable debug features
    enabled: process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true',
    
    // Debug panel settings
    panel: {
        enabled: process.env.NODE_ENV === 'development',
        hotkey: 'ctrl+shift+d',
        position: 'bottom-right' as const,
    },
    
    // Logging configuration
    logging: {
        // Log levels to capture
        levels: ['error', 'warn', 'info', 'debug'] as const,
        
        // Maximum number of logs to keep in memory
        maxLogs: 1000,
        
        // Enable console hijacking
        hijackConsole: true,
        
        // Log to external service in production
        remoteLogging: process.env.NODE_ENV === 'production' && process.env.REMOTE_LOGGING_ENABLED === 'true',
    },
    
    // Performance monitoring
    performance: {
        enabled: true,
        
        // Slow operation threshold (ms)
        slowThreshold: 1000,
        
        // Track API calls
        trackApi: true,
        
        // Track database queries
        trackDatabase: true,
        
        // Track React renders (development only)
        trackRenders: process.env.NODE_ENV === 'development',
    },
    
    // Error tracking
    errors: {
        // Capture unhandled errors
        captureUnhandled: true,
        
        // Include stack traces
        includeStackTrace: true,
        
        // Maximum error history
        maxErrors: 100,
        
        // Send errors to external service
        remoteReporting: process.env.NODE_ENV === 'production',
    },
    
    // Network debugging
    network: {
        // Log all API requests
        logRequests: process.env.NODE_ENV === 'development',
        
        // Log request/response bodies
        logBodies: process.env.NODE_ENV === 'development',
        
        // Maximum body size to log (bytes)
        maxBodySize: 10240, // 10KB
        
        // Endpoints to ignore
        ignoreEndpoints: ['/api/health', '/api/debug'],
    },
    
    // Storage debugging
    storage: {
        // Track localStorage changes
        trackLocalStorage: true,
        
        // Track sessionStorage changes
        trackSessionStorage: true,
        
        // Track cookie changes
        trackCookies: process.env.NODE_ENV === 'development',
    },
    
    // Feature flags for debugging
    features: {
        // Show debug information in UI
        showDebugInfo: process.env.NODE_ENV === 'development',
        
        // Enable debug API endpoints
        debugEndpoints: process.env.NODE_ENV === 'development',
        
        // Show performance metrics
        showPerformance: process.env.NODE_ENV === 'development',
        
        // Enable debug keyboard shortcuts
        debugShortcuts: process.env.NODE_ENV === 'development',
    },
};

// Helper to check if a debug feature is enabled
export function isDebugFeatureEnabled(feature: keyof typeof debugConfig.features): boolean {
    return debugConfig.enabled && debugConfig.features[feature];
}

// Helper to get debug configuration
export function getDebugConfig() {
    return debugConfig;
}