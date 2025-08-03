import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

/**
 * Database Migration Runner
 * Run with: pnpm db:migrate
 */

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Check if we have a database connection
    if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
      console.error('❌ No database connection found. Please set POSTGRES_URL or DATABASE_URL');
      process.exit(1);
    }

    // Create migrations tracking table
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Migrations table ready');

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files`);

    // Run each migration
    for (const file of files) {
      // Check if migration has already been executed
      const result = await sql`
        SELECT * FROM migrations WHERE filename = ${file}
      `;

      if (result.rows.length > 0) {
        console.log(`⏩ Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`📝 Running migration: ${file}`);
      
      // Read and execute migration
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
      
      // Split by semicolon and execute each statement
      // Note: This is a simple approach. For complex migrations, consider a more robust parser
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        try {
          // For CREATE FUNCTION and trigger statements, we need to handle them specially
          if (statement.includes('CREATE OR REPLACE FUNCTION') || 
              statement.includes('CREATE TRIGGER')) {
            // These need to be executed as a single statement with the semicolon
            await sql.query(statement + ';');
          } else {
            await sql.query(statement);
          }
        } catch (error: any) {
          // Ignore errors for IF NOT EXISTS statements that already exist
          if (!error.message?.includes('already exists')) {
            console.error(`Error executing statement in ${file}:`, error.message);
            throw error;
          }
        }
      }

      // Record migration as executed
      await sql`
        INSERT INTO migrations (filename) VALUES (${file})
      `;
      
      console.log(`✅ Migration ${file} completed`);
    }

    console.log('🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export default runMigrations;