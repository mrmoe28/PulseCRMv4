#!/usr/bin/env node

/**
 * Database Migration and Seeding Script
 * Usage: node scripts/migrate.js [command]
 * Commands: migrate, seed, reset, status
 */

const { execSync } = require('child_process');

const command = process.argv[2] || 'help';

async function checkDatabaseConnection() {
  try {
    const { checkDatabaseConnection } = require('../dist/index.js');
    return await checkDatabaseConnection();
  } catch (error) {
    console.error('Database connection module not found. Please build first.');
    return false;
  }
}

async function seedDatabase() {
  try {
    const { seedDatabase } = require('../dist/seeds/index.js');
    return await seedDatabase();
  } catch (error) {
    console.error('Seed module not found. Please build first.');
    throw error;
  }
}

async function resetDatabase() {
  try {
    const { resetDatabase } = require('../dist/seeds/index.js');
    return await resetDatabase();
  } catch (error) {
    console.error('Seed module not found. Please build first.');
    throw error;
  }
}

async function main() {
  console.log('🔧 PulseCRM Database Management');
  console.log('================================');

  try {
    switch (command) {
      case 'migrate':
        console.log('🚀 Running database migrations...');
        execSync('npx drizzle-kit push:pg', { stdio: 'inherit', cwd: process.cwd() });
        console.log('✅ Migrations completed');
        break;

      case 'generate':
        console.log('📝 Generating migration files...');
        execSync('npx drizzle-kit generate:pg', { stdio: 'inherit', cwd: process.cwd() });
        console.log('✅ Migration files generated');
        break;

      case 'seed':
        console.log('🏗️ Building packages first...');
        execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() });
        console.log('🌱 Seeding database...');
        await seedDatabase();
        console.log('✅ Database seeded successfully');
        break;

      case 'reset':
        console.log('🏗️ Building packages first...');
        execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() });
        console.log('🗑️ Resetting database...');
        await resetDatabase();
        console.log('✅ Database reset completed');
        break;

      case 'reset-seed':
        console.log('🏗️ Building packages first...');
        execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() });
        console.log('🔄 Resetting and seeding database...');
        await resetDatabase();
        await seedDatabase();
        console.log('✅ Database reset and seeded successfully');
        break;

      case 'studio':
        console.log('🎨 Opening Drizzle Studio...');
        execSync('npx drizzle-kit studio', { stdio: 'inherit', cwd: process.cwd() });
        break;

      case 'status':
        console.log('📊 Database status check...');
        console.log(`📍 Database URL: ${process.env.DATABASE_URL || 'default'}`);
        break;

      case 'help':
      default:
        console.log(`
Available commands:
  migrate      - Push schema changes to database
  generate     - Generate migration files from schema changes
  seed         - Populate database with sample data
  reset        - Clear all data from database
  reset-seed   - Reset database and add sample data
  studio       - Open Drizzle Studio for database management
  status       - Check database connection status
  help         - Show this help message

Examples:
  npm run db:migrate
  npm run db:seed
  npm run db:studio
        `);
        break;
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
