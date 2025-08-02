import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  decimal,
  integer,
  boolean,
  uuid,
  date,
  jsonb,
  index,
  foreignKey,
  unique
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Organizations table - for multi-tenancy (each company/signup gets their own org)
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  plan: varchar('plan', { length: 50 }).notNull().default('free'), // free, pro, enterprise
  status: varchar('status', { length: 50 }).notNull().default('active'),
  maxUsers: integer('max_users').notNull().default(5),
  maxJobs: integer('max_jobs').notNull().default(50),
  maxStorageGb: integer('max_storage_gb').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('organizations_slug_idx').on(table.slug),
  planIdx: index('organizations_plan_idx').on(table.plan),
}));

// Users table - for authentication and user management
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('member'), // owner, admin, member
  isActive: boolean('is_active').notNull().default(true),
  emailVerifiedAt: timestamp('email_verified_at'),
  invitationToken: varchar('invitation_token', { length: 255 }),
  invitedByUserId: uuid('invited_by_user_id'), // Will add foreign key constraint separately
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
  orgIdx: index('users_org_idx').on(table.organizationId),
}));

// Companies table - for client companies (isolated per organization)
export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  industry: varchar('industry', { length: 100 }),
  website: varchar('website', { length: 255 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 100 }).default('US'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('companies_name_idx').on(table.name),
  orgIdx: index('companies_org_idx').on(table.organizationId),
}));

// Contacts table - for individual contacts within companies
export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  title: varchar('title', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  mobile: varchar('mobile', { length: 50 }),
  isPrimary: boolean('is_primary').notNull().default(false),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('contacts_name_idx').on(table.firstName, table.lastName),
  emailIdx: index('contacts_email_idx').on(table.email),
  companyIdx: index('contacts_company_idx').on(table.companyId),
  orgIdx: index('contacts_org_idx').on(table.organizationId),
}));

// Jobs table - for construction projects/jobs
export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  jobNumber: varchar('job_number', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  primaryContactId: uuid('primary_contact_id').references(() => contacts.id),
  assignedUserId: uuid('assigned_user_id').references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('quoted'), // quoted, scheduled, in_progress, completed, cancelled
  priority: varchar('priority', { length: 50 }).notNull().default('medium'), // low, medium, high, urgent
  estimatedStartDate: date('estimated_start_date'),
  estimatedEndDate: date('estimated_end_date'),
  actualStartDate: date('actual_start_date'),
  actualEndDate: date('actual_end_date'),
  estimatedBudget: decimal('estimated_budget', { precision: 12, scale: 2 }),
  actualCost: decimal('actual_cost', { precision: 12, scale: 2 }),
  location: text('location'),
  requirements: text('requirements'),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  jobNumberIdx: index('jobs_job_number_idx').on(table.jobNumber),
  statusIdx: index('jobs_status_idx').on(table.status),
  priorityIdx: index('jobs_priority_idx').on(table.priority),
  companyIdx: index('jobs_company_idx').on(table.companyId),
  assignedIdx: index('jobs_assigned_idx').on(table.assignedUserId),
  orgIdx: index('jobs_org_idx').on(table.organizationId),
}));

// Tasks table - for individual tasks within jobs
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  jobId: uuid('job_id').references(() => jobs.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  assignedUserId: uuid('assigned_user_id').references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, in_progress, completed, cancelled
  priority: varchar('priority', { length: 50 }).notNull().default('medium'), // low, medium, high, urgent
  estimatedHours: decimal('estimated_hours', { precision: 8, scale: 2 }),
  actualHours: decimal('actual_hours', { precision: 8, scale: 2 }),
  dueDate: date('due_date'),
  completedAt: timestamp('completed_at'),
  orderIndex: integer('order_index').notNull().default(0),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('tasks_status_idx').on(table.status),
  priorityIdx: index('tasks_priority_idx').on(table.priority),
  jobIdx: index('tasks_job_idx').on(table.jobId),
  assignedIdx: index('tasks_assigned_idx').on(table.assignedUserId),
  orderIdx: index('tasks_order_idx').on(table.orderIndex),
  orgIdx: index('tasks_org_idx').on(table.organizationId),
}));

// Documents table - for file management linked to jobs/contacts
export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  jobId: uuid('job_id').references(() => jobs.id),
  contactId: uuid('contact_id').references(() => contacts.id),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  fileSize: integer('file_size').notNull(), // in bytes
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileType: varchar('file_type', { length: 50 }).notNull(), // pdf, image, document, etc.
  category: varchar('category', { length: 100 }), // contract, invoice, photo, etc.
  title: varchar('title', { length: 255 }),
  description: text('description'),
  uploadedByUserId: uuid('uploaded_by_user_id').references(() => users.id).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, archived, deleted
  tags: jsonb('tags'), // array of strings for tagging
  metadata: jsonb('metadata'), // extracted data, dimensions, etc.
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  fileNameIdx: index('documents_file_name_idx').on(table.fileName),
  fileTypeIdx: index('documents_file_type_idx').on(table.fileType),
  categoryIdx: index('documents_category_idx').on(table.category),
  jobIdx: index('documents_job_idx').on(table.jobId),
  contactIdx: index('documents_contact_idx').on(table.contactId),
  uploadedByIdx: index('documents_uploaded_by_idx').on(table.uploadedByUserId),
  orgIdx: index('documents_org_idx').on(table.organizationId),
}));

// Contractors table - for managing construction contractors
export const contractors = pgTable('contractors', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  userId: uuid('user_id').references(() => users.id), // link to user if they have account
  
  // Personal Information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  
  // Company Information
  companyName: varchar('company_name', { length: 255 }),
  businessType: varchar('business_type', { length: 100 }), // LLC, Corporation, Sole Proprietor, etc.
  licenseNumber: varchar('license_number', { length: 100 }),
  insuranceProvider: varchar('insurance_provider', { length: 255 }),
  insurancePolicyNumber: varchar('insurance_policy_number', { length: 100 }),
  insuranceExpirationDate: date('insurance_expiration_date'),
  bondingCompany: varchar('bonding_company', { length: 255 }),
  bondAmount: decimal('bond_amount', { precision: 12, scale: 2 }),
  
  // Contact Information
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  mobile: varchar('mobile', { length: 50 }),
  fax: varchar('fax', { length: 50 }),
  website: varchar('website', { length: 255 }),
  
  // Address Information
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 100 }).default('US'),
  
  // Business Details
  skills: jsonb('skills'), // array of skills/certifications
  specialties: jsonb('specialties'), // array of specialty areas
  hourlyRate: decimal('hourly_rate', { precision: 8, scale: 2 }),
  dayRate: decimal('day_rate', { precision: 10, scale: 2 }),
  overtimeRate: decimal('overtime_rate', { precision: 8, scale: 2 }),
  paymentTerms: varchar('payment_terms', { length: 100 }), // Net 30, Net 15, etc.
  taxId: varchar('tax_id', { length: 50 }), // EIN or SSN for 1099
  w9OnFile: boolean('w9_on_file').notNull().default(false),
  
  // Emergency Contact
  emergencyContact: jsonb('emergency_contact'), // name, phone, relationship
  
  // Status and Dates
  contractStartDate: date('contract_start_date'),
  contractEndDate: date('contract_end_date'),
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, inactive, suspended, terminated
  rating: decimal('rating', { precision: 3, scale: 2 }), // 0.00 to 5.00
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('contractors_name_idx').on(table.firstName, table.lastName),
  companyIdx: index('contractors_company_idx').on(table.companyName),
  emailIdx: index('contractors_email_idx').on(table.email),
  statusIdx: index('contractors_status_idx').on(table.status),
  userIdx: index('contractors_user_idx').on(table.userId),
  orgIdx: index('contractors_org_idx').on(table.organizationId),
}));

// Job Assignments table - for linking contractors to jobs
export const jobAssignments = pgTable('job_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  jobId: uuid('job_id').references(() => jobs.id).notNull(),
  contractorId: uuid('contractor_id').references(() => contractors.id).notNull(),
  role: varchar('role', { length: 100 }), // foreman, subcontractor, specialist, etc.
  assignedDate: date('assigned_date').notNull(),
  unassignedDate: date('unassigned_date'),
  hourlyRate: decimal('hourly_rate', { precision: 8, scale: 2 }), // can override default rate
  dayRate: decimal('day_rate', { precision: 10, scale: 2 }), // can override default rate
  contractAmount: decimal('contract_amount', { precision: 12, scale: 2 }), // fixed contract amount if applicable
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  jobIdx: index('job_assignments_job_idx').on(table.jobId),
  contractorIdx: index('job_assignments_contractor_idx').on(table.contractorId),
  roleIdx: index('job_assignments_role_idx').on(table.role),
  orgIdx: index('job_assignments_org_idx').on(table.organizationId),
  // Unique constraint: one contractor can't have multiple active assignments to same job
  uniqueActiveAssignment: unique().on(table.jobId, table.contractorId, table.isActive),
}));

// Email Verification Tokens table - for email verification and password resets
export const verificationTokens = pgTable('verification_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(), // 'email_verification', 'password_reset'
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('verification_tokens_email_idx').on(table.email),
  tokenIdx: index('verification_tokens_token_idx').on(table.token),
  typeIdx: index('verification_tokens_type_idx').on(table.type),
  expiresIdx: index('verification_tokens_expires_idx').on(table.expiresAt),
}));

// User Sessions table - for managing active user sessions
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }), // supports IPv6
  userAgent: text('user_agent'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastAccessedAt: timestamp('last_accessed_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('user_sessions_user_idx').on(table.userId),
  tokenIdx: index('user_sessions_token_idx').on(table.sessionToken),
  expiresIdx: index('user_sessions_expires_idx').on(table.expiresAt),
  activeIdx: index('user_sessions_active_idx').on(table.isActive),
}));

// Define relationships
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  companies: many(companies),
  contacts: many(contacts),
  jobs: many(jobs),
  tasks: many(tasks),
  documents: many(documents),
  contractors: many(contractors),
  jobAssignments: many(jobAssignments),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  invitedBy: one(users, {
    fields: [users.invitedByUserId],
    references: [users.id],
  }),
  assignedJobs: many(jobs),
  assignedTasks: many(tasks),
  sessions: many(userSessions),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [companies.organizationId],
    references: [organizations.id],
  }),
  contacts: many(contacts),
  jobs: many(jobs),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [contacts.organizationId],
    references: [organizations.id],
  }),
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
  primaryJobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [jobs.organizationId],
    references: [organizations.id],
  }),
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  primaryContact: one(contacts, {
    fields: [jobs.primaryContactId],
    references: [contacts.id],
  }),
  assignedUser: one(users, {
    fields: [jobs.assignedUserId],
    references: [users.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  organization: one(organizations, {
    fields: [tasks.organizationId],
    references: [organizations.id],
  }),
  job: one(jobs, {
    fields: [tasks.jobId],
    references: [jobs.id],
  }),
  assignedUser: one(users, {
    fields: [tasks.assignedUserId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  organization: one(organizations, {
    fields: [documents.organizationId],
    references: [organizations.id],
  }),
  job: one(jobs, {
    fields: [documents.jobId],
    references: [jobs.id],
  }),
  contact: one(contacts, {
    fields: [documents.contactId],
    references: [contacts.id],
  }),
  uploadedBy: one(users, {
    fields: [documents.uploadedByUserId],
    references: [users.id],
  }),
}));

export const contractorsRelations = relations(contractors, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [contractors.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [contractors.userId],
    references: [users.id],
  }),
  jobAssignments: many(jobAssignments),
}));

export const jobAssignmentsRelations = relations(jobAssignments, ({ one }) => ({
  organization: one(organizations, {
    fields: [jobAssignments.organizationId],
    references: [organizations.id],
  }),
  job: one(jobs, {
    fields: [jobAssignments.jobId],
    references: [jobs.id],
  }),
  contractor: one(contractors, {
    fields: [jobAssignments.contractorId],
    references: [contractors.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));
