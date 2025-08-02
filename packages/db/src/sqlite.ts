import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database, { type Database as BetterSqlite3Database } from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';

// Database file path (development)
const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'dev.db');

// Create SQLite connection
export const sqlite: BetterSqlite3Database = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('journal_mode = WAL');

// Create Drizzle database instance with schema
export const db = drizzle(sqlite, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

// Auto-migrate on startup in development
if (process.env.NODE_ENV === 'development') {
  try {
    console.log('🔄 Running database migrations...');
    migrate(db, { migrationsFolder: path.join(__dirname, '../drizzle') });
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.warn('⚠️ Migration warning (may be normal on first run):', error);
  }
}

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    sqlite.prepare('SELECT 1').get();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    sqlite.close();
    console.log('Database connection closed gracefully');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Export schema and types
export * from './schema';
export * from './utils/auth';
export type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

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
