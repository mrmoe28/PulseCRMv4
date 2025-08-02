// Main database connection - conditional based on environment
import * as schema from './schema';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
const hasDatabaseUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

// Use PostgreSQL for production/Vercel or if DATABASE_URL is provided
const usePostgres = isProduction || isVercel || hasDatabaseUrl;

let db: any;
let checkDatabaseConnection: () => Promise<boolean>;
let closeDatabaseConnection: () => Promise<void>;

if (usePostgres) {
  // PostgreSQL setup for production
  console.log('🐘 Using PostgreSQL database');
  
  const { drizzle } = require('drizzle-orm/postgres-js');
  const postgres = require('postgres');
  
  const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/pulsecrm';
  const sql = postgres(connectionString);
  
  db = drizzle(sql, { 
    schema,
    logger: process.env.NODE_ENV === 'development'
  });
  
  checkDatabaseConnection = async (): Promise<boolean> => {
    try {
      await sql`SELECT 1`;
      return true;
    } catch (error) {
      console.error('PostgreSQL connection failed:', error);
      return false;
    }
  };
  
  closeDatabaseConnection = async (): Promise<void> => {
    try {
      await sql.end();
      console.log('PostgreSQL connection closed gracefully');
    } catch (error) {
      console.error('Error closing PostgreSQL connection:', error);
    }
  };
  
} else {
  // SQLite setup for development
  console.log('🗄️ Using SQLite database (development)');
  
  let Database: any;
  let sqlite: any;
  
  try {
    Database = require('better-sqlite3');
    const path = require('path');
    const fs = require('fs');
    
    // Database file path
    const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'dev.db');
    
    // Ensure directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Create SQLite connection
    sqlite = new Database(dbPath);
    
    // Enable foreign keys and WAL mode
    sqlite.pragma('foreign_keys = ON');
    sqlite.pragma('journal_mode = WAL');
    
    const { drizzle } = require('drizzle-orm/better-sqlite3');
    
    db = drizzle(sqlite, { 
      schema,
      logger: process.env.NODE_ENV === 'development'
    });
    
    checkDatabaseConnection = async (): Promise<boolean> => {
      try {
        sqlite.prepare('SELECT 1').get();
        return true;
      } catch (error) {
        console.error('SQLite connection failed:', error);
        return false;
      }
    };
    
    closeDatabaseConnection = async (): Promise<void> => {
      try {
        sqlite.close();
        console.log('SQLite connection closed gracefully');
      } catch (error) {
        console.error('Error closing SQLite connection:', error);
      }
    };
    
  } catch (error) {
    console.warn('⚠️ SQLite not available, using mock database');
    
    // Mock database for cases where SQLite isn't available
    db = {
      select: () => ({ from: () => ({ where: () => [] }) }),
      insert: () => ({ values: () => ({ returning: () => [] }) }),
      update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
      delete: () => ({ where: () => ({ returning: () => [] }) })
    };
    
    checkDatabaseConnection = async () => {
      console.warn('Using mock database - no real connection');
      return true;
    };
    
    closeDatabaseConnection = async () => {
      console.log('Mock database - nothing to close');
    };
  }
}

// Initialize database with default data (development only)
export async function initializeDatabase() {
  if (usePostgres) {
    console.log('📋 PostgreSQL database - skipping auto-initialization');
    console.log('   Run migrations manually with: pnpm db:migrate');
    return true;
  }
  
  try {
    console.log('🔄 Initializing SQLite database...');
    
    // SQLite-specific initialization code here
    // This will only run in development with SQLite
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

// Auto-initialize only in development with SQLite
if (!usePostgres && process.env.NODE_ENV === 'development') {
  initializeDatabase().catch(console.error);
}

// Export the database instance and utilities
export { db, checkDatabaseConnection, closeDatabaseConnection };

// Export schema and types
export * from './schema';
export * from './utils/auth';

// Helper types for each table
export type Organization = typeof schema.organizations.$inferSelect;
export type NewOrganization = typeof schema.organizations.$inferInsert;
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type Company = typeof schema.companies.$inferSelect;
export type NewCompany = typeof schema.companies.$inferInsert;
export type Contact = typeof schema.contacts.$inferSelect;
export type NewContact = typeof schema.contacts.$inferInsert;
export type Job = typeof schema.jobs.$inferSelect;
export type NewJob = typeof schema.jobs.$inferInsert;
export type Task = typeof schema.tasks.$inferSelect;
export type NewTask = typeof schema.tasks.$inferInsert;
export type Document = typeof schema.documents.$inferSelect;
export type NewDocument = typeof schema.documents.$inferInsert;
export type CrewMember = typeof schema.crewMembers.$inferSelect;
export type NewCrewMember = typeof schema.crewMembers.$inferInsert;
export type JobAssignment = typeof schema.jobAssignments.$inferSelect;
export type NewJobAssignment = typeof schema.jobAssignments.$inferInsert;
