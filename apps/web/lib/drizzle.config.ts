import type { Config } from 'drizzle-kit';

export default {
    schema: '../Database/src/schema/postgres.ts',
    out: './drizzle',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@localhost:5432/constructflow_dev',
    },
} satisfies Config; 