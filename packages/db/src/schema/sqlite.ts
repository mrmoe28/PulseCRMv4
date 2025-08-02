import { 
  sqliteTable, 
  integer, 
  text, 
  real,
  blob,
  index,
  uniqueIndex,
  primaryKey
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Organizations table - for multi-tenancy (each company/signup gets their own org)
export const organizations = sqliteTable('organizations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: text('plan').notNull().default('free'), // free, pro, enterprise
  status: text('status').notNull().default('active'),
  maxUsers: integer('max_users').notNull().default(5),
  maxJobs: integer('max_jobs').notNull().default(50),
  maxStorageGb: integer('max_storage_gb').notNull().default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  slugIdx: index('organizations_slug_idx').on(table.slug),
  planIdx: index('organizations_plan_idx').on(table.plan),
}));

// Users table - for authentication and user management
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role').notNull().default('member'), // owner, admin, member
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  emailVerifiedAt: integer('email_verified_at', { mode: 'timestamp' }),
  invitationToken: text('invitation_token'),
  invitedByUserId: text('invited_by_user_id'),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
  orgIdx: index('users_org_idx').on(table.organizationId),
}));

// Companies table - for client companies (isolated per organization)
export const companies = sqliteTable('companies', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  industry: text('industry'),
  website: text('website'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country').default('US'),
  phone: text('phone'),
  email: text('email'),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  nameIdx: index('companies_name_idx').on(table.name),
  orgIdx: index('companies_org_idx').on(table.organizationId),
}));

// Contacts table - for individual contacts within companies
export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  companyId: text('company_id').notNull().references(() => companies.id),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  title: text('title'),
  email: text('email'),
  phone: text('phone'),
  mobile: text('mobile'),
  isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  nameIdx: index('contacts_name_idx').on(table.firstName, table.lastName),
  emailIdx: index('contacts_email_idx').on(table.email),
  companyIdx: index('contacts_company_idx').on(table.companyId),
  orgIdx: index('contacts_org_idx').on(table.organizationId),
}));

// Jobs table - for construction projects/jobs
export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  jobNumber: text('job_number').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  companyId: text('company_id').notNull().references(() => companies.id),
  primaryContactId: text('primary_contact_id').references(() => contacts.id),
  assignedUserId: text('assigned_user_id').references(() => users.id),
  status: text('status').notNull().default('quoted'), // quoted, scheduled, in_progress, completed, cancelled
  priority: text('priority').notNull().default('medium'), // low, medium, high, urgent
  estimatedStartDate: text('estimated_start_date'), // YYYY-MM-DD format
  estimatedEndDate: text('estimated_end_date'),
  actualStartDate: text('actual_start_date'),
  actualEndDate: text('actual_end_date'),
  estimatedBudget: real('estimated_budget'),
  actualCost: real('actual_cost'),
  location: text('location'),
  requirements: text('requirements'),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  jobNumberIdx: index('jobs_job_number_idx').on(table.jobNumber),
  statusIdx: index('jobs_status_idx').on(table.status),
  priorityIdx: index('jobs_priority_idx').on(table.priority),
  companyIdx: index('jobs_company_idx').on(table.companyId),
  assignedIdx: index('jobs_assigned_idx').on(table.assignedUserId),
  orgIdx: index('jobs_org_idx').on(table.organizationId),
}));

// Tasks table - for individual tasks within jobs
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  jobId: text('job_id').notNull().references(() => jobs.id),
  title: text('title').notNull(),
  description: text('description'),
  assignedUserId: text('assigned_user_id').references(() => users.id),
  status: text('status').notNull().default('pending'), // pending, in_progress, completed, cancelled
  priority: text('priority').notNull().default('medium'), // low, medium, high, urgent
  estimatedHours: real('estimated_hours'),
  actualHours: real('actual_hours'),
  dueDate: text('due_date'), // YYYY-MM-DD format
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  orderIndex: integer('order_index').notNull().default(0),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  statusIdx: index('tasks_status_idx').on(table.status),
  priorityIdx: index('tasks_priority_idx').on(table.priority),
  jobIdx: index('tasks_job_idx').on(table.jobId),
  assignedIdx: index('tasks_assigned_idx').on(table.assignedUserId),
  orderIdx: index('tasks_order_idx').on(table.orderIndex),
  orgIdx: index('tasks_org_idx').on(table.organizationId),
}));

// Documents table - for file management linked to jobs/contacts
export const documents = sqliteTable('documents', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  jobId: text('job_id').references(() => jobs.id),
  contactId: text('contact_id').references(() => contacts.id),
  fileName: text('file_name').notNull(),
  originalFileName: text('original_file_name').notNull(),
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size').notNull(), // in bytes
  mimeType: text('mime_type').notNull(),
  fileType: text('file_type').notNull(), // pdf, image, document, etc.
  category: text('category'), // contract, invoice, photo, etc.
  title: text('title'),
  description: text('description'),
  uploadedByUserId: text('uploaded_by_user_id').notNull().references(() => users.id),
  status: text('status').notNull().default('active'), // active, archived, deleted
  tags: text('tags'), // JSON array of strings for tagging
  metadata: text('metadata'), // JSON object for extracted data, dimensions, etc.
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  fileNameIdx: index('documents_file_name_idx').on(table.fileName),
  fileTypeIdx: index('documents_file_type_idx').on(table.fileType),
  categoryIdx: index('documents_category_idx').on(table.category),
  jobIdx: index('documents_job_idx').on(table.jobId),
  contactIdx: index('documents_contact_idx').on(table.contactId),
  uploadedByIdx: index('documents_uploaded_by_idx').on(table.uploadedByUserId),
  orgIdx: index('documents_org_idx').on(table.organizationId),
}));

// Crew Members table - for managing construction crew
export const crewMembers = sqliteTable('crew_members', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  userId: text('user_id').references(() => users.id), // link to user if they have account
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  skills: text('skills'), // JSON array of skills/certifications
  hourlyRate: real('hourly_rate'),
  payrollId: text('payroll_id'), // external payroll system ID
  emergencyContact: text('emergency_contact'), // JSON object: name, phone, relationship
  hireDate: text('hire_date'), // YYYY-MM-DD format
  status: text('status').notNull().default('active'), // active, inactive, terminated
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  nameIdx: index('crew_members_name_idx').on(table.firstName, table.lastName),
  emailIdx: index('crew_members_email_idx').on(table.email),
  statusIdx: index('crew_members_status_idx').on(table.status),
  userIdx: index('crew_members_user_idx').on(table.userId),
  orgIdx: index('crew_members_org_idx').on(table.organizationId),
}));

// Job Assignments table - for linking crew members to jobs
export const jobAssignments = sqliteTable('job_assignments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  jobId: text('job_id').notNull().references(() => jobs.id),
  crewMemberId: text('crew_member_id').notNull().references(() => crewMembers.id),
  role: text('role'), // foreman, laborer, specialist, etc.
  assignedDate: text('assigned_date').notNull(), // YYYY-MM-DD format
  unassignedDate: text('unassigned_date'), // YYYY-MM-DD format
  hourlyRate: real('hourly_rate'), // can override default rate
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  jobIdx: index('job_assignments_job_idx').on(table.jobId),
  crewIdx: index('job_assignments_crew_idx').on(table.crewMemberId),
  roleIdx: index('job_assignments_role_idx').on(table.role),
  orgIdx: index('job_assignments_org_idx').on(table.organizationId),
  // Unique constraint for active assignments
  uniqueActiveAssignment: uniqueIndex('job_assignments_unique_active').on(table.jobId, table.crewMemberId),
}));

// Define relationships (same as before)
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  companies: many(companies),
  contacts: many(contacts),
  jobs: many(jobs),
  tasks: many(tasks),
  documents: many(documents),
  crewMembers: many(crewMembers),
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
  uploadedDocuments: many(documents),
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
  documents: many(documents),
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
  documents: many(documents),
  jobAssignments: many(jobAssignments),
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

export const crewMembersRelations = relations(crewMembers, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [crewMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [crewMembers.userId],
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
  crewMember: one(crewMembers, {
    fields: [jobAssignments.crewMemberId],
    references: [crewMembers.id],
  }),
}));
