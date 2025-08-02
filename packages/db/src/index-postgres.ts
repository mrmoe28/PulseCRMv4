import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database configuration
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:@localhost:5432/constructflow_prod';

// Configure postgres connection with optimizations
const connectionOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'constructflow_prod',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Better for serverless
};

// Create connection
export const sql = postgres(connectionString, connectionOptions);

// Create Drizzle database instance with schema
export const db = drizzle(sql, { 
  schema,
  logger: process.env.NODE_ENV === 'development' && process.env.ENABLE_DB_LOGGING === 'true'
});

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await sql.end();
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
