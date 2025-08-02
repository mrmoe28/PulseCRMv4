import { getDatabase as getPostgresDatabase } from './database-postgres';

// Check if PostgreSQL is configured
const isPostgresConfigured = !!(
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL
);

// In production, PostgreSQL is required
const isProduction = process.env.NODE_ENV === 'production';

// Export the appropriate database implementation
export async function getDatabase() {
    if (isProduction && !isPostgresConfigured) {
        throw new Error(
            'Database configuration error: PostgreSQL connection is required in production. ' +
            'Please set DATABASE_URL or POSTGRES_URL environment variable. ' +
            'See VERCEL_DEPLOYMENT_GUIDE.md for setup instructions.'
        );
    }

    if (isPostgresConfigured) {
        console.log('Using PostgreSQL database');
        return getPostgresDatabase();
    }

    // Only use in-memory for development
    if (!isProduction) {
        console.warn(
            'WARNING: Using in-memory database (development only). ' +
            'Data will not persist between restarts. ' +
            'Set up PostgreSQL for production use.'
        );
        // Import in-memory implementation only when needed
        const { getDatabase: getInMemoryDatabase } = await import('./database-inmemory');
        return getInMemoryDatabase();
    }

    throw new Error('No database configured');
}

// Re-export all types and functions from the postgres implementation
export * from './database-postgres';