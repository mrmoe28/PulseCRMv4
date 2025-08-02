"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSessionsRelations = exports.jobAssignmentsRelations = exports.contractorsRelations = exports.documentsRelations = exports.tasksRelations = exports.jobsRelations = exports.contactsRelations = exports.companiesRelations = exports.usersRelations = exports.organizationsRelations = exports.userSessions = exports.verificationTokens = exports.jobAssignments = exports.contractors = exports.documents = exports.tasks = exports.jobs = exports.contacts = exports.companies = exports.users = exports.organizations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// Organizations table - for multi-tenancy (each company/signup gets their own org)
exports.organizations = (0, pg_core_1.pgTable)('organizations', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 100 }).notNull().unique(),
    plan: (0, pg_core_1.varchar)('plan', { length: 50 }).notNull().default('free'), // free, pro, enterprise
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('active'),
    maxUsers: (0, pg_core_1.integer)('max_users').notNull().default(5),
    maxJobs: (0, pg_core_1.integer)('max_jobs').notNull().default(50),
    maxStorageGb: (0, pg_core_1.integer)('max_storage_gb').notNull().default(1),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    slugIdx: (0, pg_core_1.index)('organizations_slug_idx').on(table.slug),
    planIdx: (0, pg_core_1.index)('organizations_plan_idx').on(table.plan),
}));
// Users table - for authentication and user management
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    firstName: (0, pg_core_1.varchar)('first_name', { length: 100 }).notNull(),
    lastName: (0, pg_core_1.varchar)('last_name', { length: 100 }).notNull(),
    role: (0, pg_core_1.varchar)('role', { length: 50 }).notNull().default('member'), // owner, admin, member
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    emailVerifiedAt: (0, pg_core_1.timestamp)('email_verified_at'),
    invitationToken: (0, pg_core_1.varchar)('invitation_token', { length: 255 }),
    invitedByUserId: (0, pg_core_1.uuid)('invited_by_user_id'), // Will add foreign key constraint separately
    lastLoginAt: (0, pg_core_1.timestamp)('last_login_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    emailIdx: (0, pg_core_1.index)('users_email_idx').on(table.email),
    roleIdx: (0, pg_core_1.index)('users_role_idx').on(table.role),
    orgIdx: (0, pg_core_1.index)('users_org_idx').on(table.organizationId),
}));
// Companies table - for client companies (isolated per organization)
exports.companies = (0, pg_core_1.pgTable)('companies', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    industry: (0, pg_core_1.varchar)('industry', { length: 100 }),
    website: (0, pg_core_1.varchar)('website', { length: 255 }),
    address: (0, pg_core_1.text)('address'),
    city: (0, pg_core_1.varchar)('city', { length: 100 }),
    state: (0, pg_core_1.varchar)('state', { length: 50 }),
    zipCode: (0, pg_core_1.varchar)('zip_code', { length: 20 }),
    country: (0, pg_core_1.varchar)('country', { length: 100 }).default('US'),
    phone: (0, pg_core_1.varchar)('phone', { length: 50 }),
    email: (0, pg_core_1.varchar)('email', { length: 255 }),
    notes: (0, pg_core_1.text)('notes'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    nameIdx: (0, pg_core_1.index)('companies_name_idx').on(table.name),
    orgIdx: (0, pg_core_1.index)('companies_org_idx').on(table.organizationId),
}));
// Contacts table - for individual contacts within companies
exports.contacts = (0, pg_core_1.pgTable)('contacts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id).notNull(),
    companyId: (0, pg_core_1.uuid)('company_id').references(() => exports.companies.id).notNull(),
    firstName: (0, pg_core_1.varchar)('first_name', { length: 100 }).notNull(),
    lastName: (0, pg_core_1.varchar)('last_name', { length: 100 }).notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 100 }),
    email: (0, pg_core_1.varchar)('email', { length: 255 }),
    phone: (0, pg_core_1.varchar)('phone', { length: 50 }),
    mobile: (0, pg_core_1.varchar)('mobile', { length: 50 }),
    isPrimary: (0, pg_core_1.boolean)('is_primary').notNull().default(false),
    notes: (0, pg_core_1.text)('notes'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    nameIdx: (0, pg_core_1.index)('contacts_name_idx').on(table.firstName, table.lastName),
    emailIdx: (0, pg_core_1.index)('contacts_email_idx').on(table.email),
    companyIdx: (0, pg_core_1.index)('contacts_company_idx').on(table.companyId),
    orgIdx: (0, pg_core_1.index)('contacts_org_idx').on(table.organizationId),
}));
// Jobs table - for construction projects/jobs
exports.jobs = (0, pg_core_1.pgTable)('jobs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id).notNull(),
    jobNumber: (0, pg_core_1.varchar)('job_number', { length: 50 }).notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    companyId: (0, pg_core_1.uuid)('company_id').references(() => exports.companies.id).notNull(),
    primaryContactId: (0, pg_core_1.uuid)('primary_contact_id').references(() => exports.contacts.id),
    assignedUserId: (0, pg_core_1.uuid)('assigned_user_id').references(() => exports.users.id),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('quoted'), // quoted, scheduled, in_progress, completed, cancelled
    priority: (0, pg_core_1.varchar)('priority', { length: 50 }).notNull().default('medium'), // low, medium, high, urgent
    estimatedStartDate: (0, pg_core_1.date)('estimated_start_date'),
    estimatedEndDate: (0, pg_core_1.date)('estimated_end_date'),
    actualStartDate: (0, pg_core_1.date)('actual_start_date'),
    actualEndDate: (0, pg_core_1.date)('actual_end_date'),
    estimatedBudget: (0, pg_core_1.decimal)('estimated_budget', { precision: 12, scale: 2 }),
    actualCost: (0, pg_core_1.decimal)('actual_cost', { precision: 12, scale: 2 }),
    location: (0, pg_core_1.text)('location'),
    requirements: (0, pg_core_1.text)('requirements'),
    notes: (0, pg_core_1.text)('notes'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    jobNumberIdx: (0, pg_core_1.index)('jobs_job_number_idx').on(table.jobNumber),
    statusIdx: (0, pg_core_1.index)('jobs_status_idx').on(table.status),
    priorityIdx: (0, pg_core_1.index)('jobs_priority_idx').on(table.priority),
    companyIdx: (0, pg_core_1.index)('jobs_company_idx').on(table.companyId),
    assignedIdx: (0, pg_core_1.index)('jobs_assigned_idx').on(table.assignedUserId),
    orgIdx: (0, pg_core_1.index)('jobs_org_idx').on(table.organizationId),
}));
// Tasks table - for individual tasks within jobs
exports.tasks = (0, pg_core_1.pgTable)('tasks', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id).notNull(),
    jobId: (0, pg_core_1.uuid)('job_id').references(() => exports.jobs.id).notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    assignedUserId: (0, pg_core_1.uuid)('assigned_user_id').references(() => exports.users.id),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('pending'), // pending, in_progress, completed, cancelled
    priority: (0, pg_core_1.varchar)('priority', { length: 50 }).notNull().default('medium'), // low, medium, high, urgent
    estimatedHours: (0, pg_core_1.decimal)('estimated_hours', { precision: 8, scale: 2 }),
    actualHours: (0, pg_core_1.decimal)('actual_hours', { precision: 8, scale: 2 }),
    dueDate: (0, pg_core_1.date)('due_date'),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    orderIndex: (0, pg_core_1.integer)('order_index').notNull().default(0),
    notes: (0, pg_core_1.text)('notes'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    statusIdx: (0, pg_core_1.index)('tasks_status_idx').on(table.status),
    priorityIdx: (0, pg_core_1.index)('tasks_priority_idx').on(table.priority),
    jobIdx: (0, pg_core_1.index)('tasks_job_idx').on(table.jobId),
    assignedIdx: (0, pg_core_1.index)('tasks_assigned_idx').on(table.assignedUserId),
    orderIdx: (0, pg_core_1.index)('tasks_order_idx').on(table.orderIndex),
    orgIdx: (0, pg_core_1.index)('tasks_org_idx').on(table.organizationId),
}));
// Documents table - for file management linked to jobs/contacts
exports.documents = (0, pg_core_1.pgTable)('documents', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id).notNull(),
    jobId: (0, pg_core_1.uuid)('job_id').references(() => exports.jobs.id),
    contactId: (0, pg_core_1.uuid)('contact_id').references(() => exports.contacts.id),
    fileName: (0, pg_core_1.varchar)('file_name', { length: 255 }).notNull(),
    originalFileName: (0, pg_core_1.varchar)('original_file_name', { length: 255 }).notNull(),
    filePath: (0, pg_core_1.varchar)('file_path', { length: 500 }).notNull(),
    fileSize: (0, pg_core_1.integer)('file_size').notNull(), // in bytes
    mimeType: (0, pg_core_1.varchar)('mime_type', { length: 100 }).notNull(),
    fileType: (0, pg_core_1.varchar)('file_type', { length: 50 }).notNull(), // pdf, image, document, etc.
    category: (0, pg_core_1.varchar)('category', { length: 100 }), // contract, invoice, photo, etc.
    title: (0, pg_core_1.varchar)('title', { length: 255 }),
    description: (0, pg_core_1.text)('description'),
    uploadedByUserId: (0, pg_core_1.uuid)('uploaded_by_user_id').references(() => exports.users.id).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('active'), // active, archived, deleted
    tags: (0, pg_core_1.jsonb)('tags'), // array of strings for tagging
    metadata: (0, pg_core_1.jsonb)('metadata'), // extracted data, dimensions, etc.
    isPublic: (0, pg_core_1.boolean)('is_public').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    fileNameIdx: (0, pg_core_1.index)('documents_file_name_idx').on(table.fileName),
    fileTypeIdx: (0, pg_core_1.index)('documents_file_type_idx').on(table.fileType),
    categoryIdx: (0, pg_core_1.index)('documents_category_idx').on(table.category),
    jobIdx: (0, pg_core_1.index)('documents_job_idx').on(table.jobId),
    contactIdx: (0, pg_core_1.index)('documents_contact_idx').on(table.contactId),
    uploadedByIdx: (0, pg_core_1.index)('documents_uploaded_by_idx').on(table.uploadedByUserId),
    orgIdx: (0, pg_core_1.index)('documents_org_idx').on(table.organizationId),
}));
// Contractors table - for managing construction contractors
exports.contractors = (0, pg_core_1.pgTable)('contractors', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id).notNull(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id), // link to user if they have account
    // Personal Information
    firstName: (0, pg_core_1.varchar)('first_name', { length: 100 }).notNull(),
    lastName: (0, pg_core_1.varchar)('last_name', { length: 100 }).notNull(),
    // Company Information
    companyName: (0, pg_core_1.varchar)('company_name', { length: 255 }),
    businessType: (0, pg_core_1.varchar)('business_type', { length: 100 }), // LLC, Corporation, Sole Proprietor, etc.
    licenseNumber: (0, pg_core_1.varchar)('license_number', { length: 100 }),
    insuranceProvider: (0, pg_core_1.varchar)('insurance_provider', { length: 255 }),
    insurancePolicyNumber: (0, pg_core_1.varchar)('insurance_policy_number', { length: 100 }),
    insuranceExpirationDate: (0, pg_core_1.date)('insurance_expiration_date'),
    bondingCompany: (0, pg_core_1.varchar)('bonding_company', { length: 255 }),
    bondAmount: (0, pg_core_1.decimal)('bond_amount', { precision: 12, scale: 2 }),
    // Contact Information
    email: (0, pg_core_1.varchar)('email', { length: 255 }),
    phone: (0, pg_core_1.varchar)('phone', { length: 50 }),
    mobile: (0, pg_core_1.varchar)('mobile', { length: 50 }),
    fax: (0, pg_core_1.varchar)('fax', { length: 50 }),
    website: (0, pg_core_1.varchar)('website', { length: 255 }),
    // Address Information
    address: (0, pg_core_1.text)('address'),
    city: (0, pg_core_1.varchar)('city', { length: 100 }),
    state: (0, pg_core_1.varchar)('state', { length: 50 }),
    zipCode: (0, pg_core_1.varchar)('zip_code', { length: 20 }),
    country: (0, pg_core_1.varchar)('country', { length: 100 }).default('US'),
    // Business Details
    skills: (0, pg_core_1.jsonb)('skills'), // array of skills/certifications
    specialties: (0, pg_core_1.jsonb)('specialties'), // array of specialty areas
    hourlyRate: (0, pg_core_1.decimal)('hourly_rate', { precision: 8, scale: 2 }),
    dayRate: (0, pg_core_1.decimal)('day_rate', { precision: 10, scale: 2 }),
    overtimeRate: (0, pg_core_1.decimal)('overtime_rate', { precision: 8, scale: 2 }),
    paymentTerms: (0, pg_core_1.varchar)('payment_terms', { length: 100 }), // Net 30, Net 15, etc.
    taxId: (0, pg_core_1.varchar)('tax_id', { length: 50 }), // EIN or SSN for 1099
    w9OnFile: (0, pg_core_1.boolean)('w9_on_file').notNull().default(false),
    // Emergency Contact
    emergencyContact: (0, pg_core_1.jsonb)('emergency_contact'), // name, phone, relationship
    // Status and Dates
    contractStartDate: (0, pg_core_1.date)('contract_start_date'),
    contractEndDate: (0, pg_core_1.date)('contract_end_date'),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('active'), // active, inactive, suspended, terminated
    rating: (0, pg_core_1.decimal)('rating', { precision: 3, scale: 2 }), // 0.00 to 5.00
    notes: (0, pg_core_1.text)('notes'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    nameIdx: (0, pg_core_1.index)('contractors_name_idx').on(table.firstName, table.lastName),
    companyIdx: (0, pg_core_1.index)('contractors_company_idx').on(table.companyName),
    emailIdx: (0, pg_core_1.index)('contractors_email_idx').on(table.email),
    statusIdx: (0, pg_core_1.index)('contractors_status_idx').on(table.status),
    userIdx: (0, pg_core_1.index)('contractors_user_idx').on(table.userId),
    orgIdx: (0, pg_core_1.index)('contractors_org_idx').on(table.organizationId),
}));
// Job Assignments table - for linking contractors to jobs
exports.jobAssignments = (0, pg_core_1.pgTable)('job_assignments', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id).notNull(),
    jobId: (0, pg_core_1.uuid)('job_id').references(() => exports.jobs.id).notNull(),
    contractorId: (0, pg_core_1.uuid)('contractor_id').references(() => exports.contractors.id).notNull(),
    role: (0, pg_core_1.varchar)('role', { length: 100 }), // foreman, subcontractor, specialist, etc.
    assignedDate: (0, pg_core_1.date)('assigned_date').notNull(),
    unassignedDate: (0, pg_core_1.date)('unassigned_date'),
    hourlyRate: (0, pg_core_1.decimal)('hourly_rate', { precision: 8, scale: 2 }), // can override default rate
    dayRate: (0, pg_core_1.decimal)('day_rate', { precision: 10, scale: 2 }), // can override default rate
    contractAmount: (0, pg_core_1.decimal)('contract_amount', { precision: 12, scale: 2 }), // fixed contract amount if applicable
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    jobIdx: (0, pg_core_1.index)('job_assignments_job_idx').on(table.jobId),
    contractorIdx: (0, pg_core_1.index)('job_assignments_contractor_idx').on(table.contractorId),
    roleIdx: (0, pg_core_1.index)('job_assignments_role_idx').on(table.role),
    orgIdx: (0, pg_core_1.index)('job_assignments_org_idx').on(table.organizationId),
    // Unique constraint: one contractor can't have multiple active assignments to same job
    uniqueActiveAssignment: (0, pg_core_1.unique)().on(table.jobId, table.contractorId, table.isActive),
}));
// Email Verification Tokens table - for email verification and password resets
exports.verificationTokens = (0, pg_core_1.pgTable)('verification_tokens', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    token: (0, pg_core_1.varchar)('token', { length: 255 }).notNull().unique(),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(), // 'email_verification', 'password_reset'
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    usedAt: (0, pg_core_1.timestamp)('used_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    emailIdx: (0, pg_core_1.index)('verification_tokens_email_idx').on(table.email),
    tokenIdx: (0, pg_core_1.index)('verification_tokens_token_idx').on(table.token),
    typeIdx: (0, pg_core_1.index)('verification_tokens_type_idx').on(table.type),
    expiresIdx: (0, pg_core_1.index)('verification_tokens_expires_idx').on(table.expiresAt),
}));
// User Sessions table - for managing active user sessions
exports.userSessions = (0, pg_core_1.pgTable)('user_sessions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id).notNull(),
    sessionToken: (0, pg_core_1.varchar)('session_token', { length: 255 }).notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }), // supports IPv6
    userAgent: (0, pg_core_1.text)('user_agent'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    lastAccessedAt: (0, pg_core_1.timestamp)('last_accessed_at').defaultNow().notNull(),
}, (table) => ({
    userIdx: (0, pg_core_1.index)('user_sessions_user_idx').on(table.userId),
    tokenIdx: (0, pg_core_1.index)('user_sessions_token_idx').on(table.sessionToken),
    expiresIdx: (0, pg_core_1.index)('user_sessions_expires_idx').on(table.expiresAt),
    activeIdx: (0, pg_core_1.index)('user_sessions_active_idx').on(table.isActive),
}));
// Define relationships
exports.organizationsRelations = (0, drizzle_orm_1.relations)(exports.organizations, ({ many }) => ({
    users: many(exports.users),
    companies: many(exports.companies),
    contacts: many(exports.contacts),
    jobs: many(exports.jobs),
    tasks: many(exports.tasks),
    documents: many(exports.documents),
    contractors: many(exports.contractors),
    jobAssignments: many(exports.jobAssignments),
}));
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one, many }) => ({
    organization: one(exports.organizations, {
        fields: [exports.users.organizationId],
        references: [exports.organizations.id],
    }),
    invitedBy: one(exports.users, {
        fields: [exports.users.invitedByUserId],
        references: [exports.users.id],
    }),
    assignedJobs: many(exports.jobs),
    assignedTasks: many(exports.tasks),
    sessions: many(exports.userSessions),
}));
exports.companiesRelations = (0, drizzle_orm_1.relations)(exports.companies, ({ one, many }) => ({
    organization: one(exports.organizations, {
        fields: [exports.companies.organizationId],
        references: [exports.organizations.id],
    }),
    contacts: many(exports.contacts),
    jobs: many(exports.jobs),
}));
exports.contactsRelations = (0, drizzle_orm_1.relations)(exports.contacts, ({ one, many }) => ({
    organization: one(exports.organizations, {
        fields: [exports.contacts.organizationId],
        references: [exports.organizations.id],
    }),
    company: one(exports.companies, {
        fields: [exports.contacts.companyId],
        references: [exports.companies.id],
    }),
    primaryJobs: many(exports.jobs),
}));
exports.jobsRelations = (0, drizzle_orm_1.relations)(exports.jobs, ({ one, many }) => ({
    organization: one(exports.organizations, {
        fields: [exports.jobs.organizationId],
        references: [exports.organizations.id],
    }),
    company: one(exports.companies, {
        fields: [exports.jobs.companyId],
        references: [exports.companies.id],
    }),
    primaryContact: one(exports.contacts, {
        fields: [exports.jobs.primaryContactId],
        references: [exports.contacts.id],
    }),
    assignedUser: one(exports.users, {
        fields: [exports.jobs.assignedUserId],
        references: [exports.users.id],
    }),
    tasks: many(exports.tasks),
}));
exports.tasksRelations = (0, drizzle_orm_1.relations)(exports.tasks, ({ one }) => ({
    organization: one(exports.organizations, {
        fields: [exports.tasks.organizationId],
        references: [exports.organizations.id],
    }),
    job: one(exports.jobs, {
        fields: [exports.tasks.jobId],
        references: [exports.jobs.id],
    }),
    assignedUser: one(exports.users, {
        fields: [exports.tasks.assignedUserId],
        references: [exports.users.id],
    }),
}));
exports.documentsRelations = (0, drizzle_orm_1.relations)(exports.documents, ({ one }) => ({
    organization: one(exports.organizations, {
        fields: [exports.documents.organizationId],
        references: [exports.organizations.id],
    }),
    job: one(exports.jobs, {
        fields: [exports.documents.jobId],
        references: [exports.jobs.id],
    }),
    contact: one(exports.contacts, {
        fields: [exports.documents.contactId],
        references: [exports.contacts.id],
    }),
    uploadedBy: one(exports.users, {
        fields: [exports.documents.uploadedByUserId],
        references: [exports.users.id],
    }),
}));
exports.contractorsRelations = (0, drizzle_orm_1.relations)(exports.contractors, ({ one, many }) => ({
    organization: one(exports.organizations, {
        fields: [exports.contractors.organizationId],
        references: [exports.organizations.id],
    }),
    user: one(exports.users, {
        fields: [exports.contractors.userId],
        references: [exports.users.id],
    }),
    jobAssignments: many(exports.jobAssignments),
}));
exports.jobAssignmentsRelations = (0, drizzle_orm_1.relations)(exports.jobAssignments, ({ one }) => ({
    organization: one(exports.organizations, {
        fields: [exports.jobAssignments.organizationId],
        references: [exports.organizations.id],
    }),
    job: one(exports.jobs, {
        fields: [exports.jobAssignments.jobId],
        references: [exports.jobs.id],
    }),
    contractor: one(exports.contractors, {
        fields: [exports.jobAssignments.contractorId],
        references: [exports.contractors.id],
    }),
}));
exports.userSessionsRelations = (0, drizzle_orm_1.relations)(exports.userSessions, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.userSessions.userId],
        references: [exports.users.id],
    }),
}));
