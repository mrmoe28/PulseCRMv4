// Production configuration for ConstructFlow/PulseCRM
export const productionConfig = {
  // Feature flags
  features: {
    enableRealTime: process.env.ENABLE_REAL_TIME === 'true',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true',
    enableFileUpload: process.env.ENABLE_FILE_UPLOAD === 'true',
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10'),
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableErrorTracking: process.env.NODE_ENV === 'production',
  },

  // Security settings
  security: {
    rateLimitEnabled: process.env.RATE_LIMIT_ENABLED === 'true',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
    cspReportUri: process.env.CSP_REPORT_URI,
    sessionTimeout: 30 * 24 * 60 * 60 * 1000, // 30 days
  },

  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },

  // Database
  database: {
    provider: process.env.POSTGRES_URL ? 'postgres' : 'file',
    maxConnections: 20,
    connectionTimeout: 30000,
  },

  // Email
  email: {
    provider: process.env.EMAIL_SERVICE || 'console',
    from: process.env.EMAIL_FROM || 'noreply@pulsecrm.com',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@pulsecrm.com',
  },

  // Storage
  storage: {
    provider: process.env.BLOB_READ_WRITE_TOKEN ? 'vercel-blob' : 'local',
    maxSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10'),
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },

  // Performance
  performance: {
    enableCaching: process.env.NODE_ENV === 'production',
    cacheMaxAge: 3600, // 1 hour
    enableISR: true,
    revalidateInterval: 3600, // 1 hour
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: process.env.NODE_ENV !== 'production',
    enableFile: process.env.NODE_ENV === 'production',
  },
};

// Environment validation
export function validateEnvironment() {
  const required = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Warn about recommended variables
  const recommended = [
    'POSTGRES_URL',
    'EMAIL_SERVICE',
    'BLOB_READ_WRITE_TOKEN',
  ];

  const missingRecommended = recommended.filter(key => !process.env[key]);
  
  if (missingRecommended.length > 0) {
    console.warn(`Missing recommended environment variables: ${missingRecommended.join(', ')}`);
  }
}

// Production readiness check
export function isProductionReady(): boolean {
  return (
    process.env.NODE_ENV === 'production' &&
    !!process.env.POSTGRES_URL &&
    !!process.env.EMAIL_SERVICE &&
    process.env.EMAIL_SERVICE !== 'console' &&
    !!process.env.NEXTAUTH_SECRET &&
    !!process.env.NEXTAUTH_URL
  );
}
