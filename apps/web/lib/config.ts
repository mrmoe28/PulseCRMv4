export const appConfig = {
    // Application settings
    mode: process.env.APP_MODE || 'production',
    name: process.env.APP_NAME || 'PulseCRM',
    version: process.env.APP_VERSION || '1.0.0',

    // Database settings
    databaseType: process.env.DATABASE_TYPE || 'json',

    // Authentication settings
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '2592000'), // 30 days

    // Feature flags
    enableDemoMode: process.env.ENABLE_DEMO_MODE === 'true',
    enableRegistration: process.env.ENABLE_REGISTRATION !== 'false',
    enablePasswordReset: process.env.ENABLE_PASSWORD_RESET !== 'false',

    // Environment helpers
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
};

export const getAppInfo = () => ({
    name: appConfig.name,
    version: appConfig.version,
    mode: appConfig.mode,
    environment: process.env.NODE_ENV,
    features: {
        demoMode: appConfig.enableDemoMode,
        registration: appConfig.enableRegistration,
        passwordReset: appConfig.enablePasswordReset,
    }
}); 