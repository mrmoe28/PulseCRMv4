const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('🔌 Connecting to Vercel Postgres...');
  const client = postgres(connectionString, {
    max: 1,
    ssl: 'require',
  });

  try {
    console.log('📋 Running multi-tenancy migrations...');

    // Read and execute the multi-tenancy migration
    const migrationPath = path.join(__dirname, '../migrations/001_add_multi_tenancy.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      console.log('⚡ Executing:', statement.substring(0, 50) + '...');
      await client.unsafe(statement);
    }

    console.log('✅ Multi-tenancy migrations completed successfully!');

    // Verify tables were created
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('📊 Created tables:', tables.map((t) => t.table_name).join(', '));
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('🎉 Database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations };
