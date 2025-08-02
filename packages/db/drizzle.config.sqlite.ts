import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema/sqlite.ts',
  out: './drizzle-sqlite',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './dev.db',
  },
  verbose: true,
  strict: true,
} satisfies Config;
