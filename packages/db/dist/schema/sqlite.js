"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobAssignmentsRelations = exports.contractorsRelations = exports.documentsRelations = exports.tasksRelations = exports.jobsRelations = exports.contactsRelations = exports.companiesRelations = exports.usersRelations = exports.organizationsRelations = exports.jobAssignments = exports.contractors = exports.documents = exports.tasks = exports.jobs = exports.contacts = exports.companies = exports.users = exports.organizations = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
// Organizations table - for multi-tenancy (each company/signup gets their own org)
exports.organizations = (0, sqlite_core_1.sqliteTable)('organizations', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: (0, sqlite_core_1.text)('name').notNull(),
    slug: (0, sqlite_core_1.text)('slug').notNull().unique(),
    plan: (0, sqlite_core_1.text)('plan').notNull().default('free'), // free, pro, enterprise
    status: (0, sqlite_core_1.text)('status').notNull().default('active'),
    maxUsers: (0, sqlite_core_1.integer)('max_users').notNull().default(5),
    maxJobs: (0, sqlite_core_1.integer)('max_jobs').notNull().default(50),
    maxStorageGb: (0, sqlite_core_1.integer)('max_storage_gb').notNull().default(1),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    slugIdx: (0, sqlite_core_1.index)('organizations_slug_idx').on(table.slug),
    planIdx: (0, sqlite_core_1.index)('organizations_plan_idx').on(table.plan),
}));
// Users table - for authentication and user management
exports.users = (0, sqlite_core_1.sqliteTable)('users', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: (0, sqlite_core_1.text)('organization_id').notNull().references(() => exports.organizations.id),
    email: (0, sqlite_core_1.text)('email').notNull().unique(),
    passwordHash: (0, sqlite_core_1.text)('password_hash').notNull(),
    firstName: (0, sqlite_core_1.text)('first_name').notNull(),
    lastName: (0, sqlite_core_1.text)('last_name').notNull(),
    role: (0, sqlite_core_1.text)('role').notNull().default('member'), // owner, admin, member
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).notNull().default(true),
    emailVerifiedAt: (0, sqlite_core_1.integer)('email_verified_at', { mode: 'timestamp' }),
    invitationToken: (0, sqlite_core_1.text)('invitation_token'),
    invitedByUserId: (0, sqlite_core_1.text)('invited_by_user_id'),
    lastLoginAt: (0, sqlite_core_1.integer)('last_login_at', { mode: 'timestamp' }),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    emailIdx: (0, sqlite_core_1.index)('users_email_idx').on(table.email),
    roleIdx: (0, sqlite_core_1.index)('users_role_idx').on(table.role),
    orgIdx: (0, sqlite_core_1.index)('users_org_idx').on(table.organizationId),
}));
// Companies table - for client companies (isolated per organization)
exports.companies = (0, sqlite_core_1.sqliteTable)('companies', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: (0, sqlite_core_1.text)('organization_id').notNull().references(() => exports.organizations.id),
    name: (0, sqlite_core_1.text)('name').notNull(),
    industry: (0, sqlite_core_1.text)('industry'),
    website: (0, sqlite_core_1.text)('website'),
    address: (0, sqlite_core_1.text)('address'),
    city: (0, sqlite_core_1.text)('city'),
    state: (0, sqlite_core_1.text)('state'),
    zipCode: (0, sqlite_core_1.text)('zip_code'),
    country: (0, sqlite_core_1.text)('country').default('US'),
    phone: (0, sqlite_core_1.text)('phone'),
    email: (0, sqlite_core_1.text)('email'),
    notes: (0, sqlite_core_1.text)('notes'),
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    nameIdx: (0, sqlite_core_1.index)('companies_name_idx').on(table.name),
    orgIdx: (0, sqlite_core_1.index)('companies_org_idx').on(table.organizationId),
}));
// Contacts table - for individual contacts within companies
exports.contacts = (0, sqlite_core_1.sqliteTable)('contacts', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: (0, sqlite_core_1.text)('organization_id').notNull().references(() => exports.organizations.id),
    companyId: (0, sqlite_core_1.text)('company_id').notNull().references(() => exports.companies.id),
    firstName: (0, sqlite_core_1.text)('first_name').notNull(),
    lastName: (0, sqlite_core_1.text)('last_name').notNull(),
    title: (0, sqlite_core_1.text)('title'),
    email: (0, sqlite_core_1.text)('email'),
    phone: (0, sqlite_core_1.text)('phone'),
    mobile: (0, sqlite_core_1.text)('mobile'),
    isPrimary: (0, sqlite_core_1.integer)('is_primary', { mode: 'boolean' }).notNull().default(false),
    notes: (0, sqlite_core_1.text)('notes'),
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    nameIdx: (0, sqlite_core_1.index)('contacts_name_idx').on(table.firstName, table.lastName),
    emailIdx: (0, sqlite_core_1.index)('contacts_email_idx').on(table.email),
    companyIdx: (0, sqlite_core_1.index)('contacts_company_idx').on(table.companyId),
    orgIdx: (0, sqlite_core_1.index)('contacts_org_idx').on(table.organizationId),
}));
// Jobs table - for construction projects/jobs
exports.jobs = (0, sqlite_core_1.sqliteTable)('jobs', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: (0, sqlite_core_1.text)('organization_id').notNull().references(() => exports.organizations.id),
    jobNumber: (0, sqlite_core_1.text)('job_number').notNull(),
    title: (0, sqlite_core_1.text)('title').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    companyId: (0, sqlite_core_1.text)('company_id').notNull().references(() => exports.companies.id),
    primaryContactId: (0, sqlite_core_1.text)('primary_contact_id').references(() => exports.contacts.id),
    assignedUserId: (0, sqlite_core_1.text)('assigned_user_id').references(() => exports.users.id),
    status: (0, sqlite_core_1.text)('status').notNull().default('quoted'), // quoted, scheduled, in_progress, completed, cancelled
    priority: (0, sqlite_core_1.text)('priority').notNull().default('medium'), // low, medium, high, urgent
    estimatedStartDate: (0, sqlite_core_1.text)('estimated_start_date'), // YYYY-MM-DD format
    estimatedEndDate: (0, sqlite_core_1.text)('estimated_end_date'),
    actualStartDate: (0, sqlite_core_1.text)('actual_start_date'),
    actualEndDate: (0, sqlite_core_1.text)('actual_end_date'),
    estimatedBudget: (0, sqlite_core_1.real)('estimated_budget'),
    actualCost: (0, sqlite_core_1.real)('actual_cost'),
    location: (0, sqlite_core_1.text)('location'),
    requirements: (0, sqlite_core_1.text)('requirements'),
    notes: (0, sqlite_core_1.text)('notes'),
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    jobNumberIdx: (0, sqlite_core_1.index)('jobs_job_number_idx').on(table.jobNumber),
    statusIdx: (0, sqlite_core_1.index)('jobs_status_idx').on(table.status),
    priorityIdx: (0, sqlite_core_1.index)('jobs_priority_idx').on(table.priority),
    companyIdx: (0, sqlite_core_1.index)('jobs_company_idx').on(table.companyId),
    assignedIdx: (0, sqlite_core_1.index)('jobs_assigned_idx').on(table.assignedUserId),
    orgIdx: (0, sqlite_core_1.index)('jobs_org_idx').on(table.organizationId),
}));
// Tasks table - for individual tasks within jobs
exports.tasks = (0, sqlite_core_1.sqliteTable)('tasks', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: (0, sqlite_core_1.text)('organization_id').notNull().references(() => exports.organizations.id),
    jobId: (0, sqlite_core_1.text)('job_id').notNull().references(() => exports.jobs.id),
    title: (0, sqlite_core_1.text)('title').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    assignedUserId: (0, sqlite_core_1.text)('assigned_user_id').references(() => exports.users.id),
    status: (0, sqlite_core_1.text)('status').notNull().default('pending'), // pending, in_progress, completed, cancelled
    priority: (0, sqlite_core_1.text)('priority').notNull().default('medium'), // low, medium, high, urgent
    estimatedHours: (0, sqlite_core_1.real)('estimated_hours'),
    actualHours: (0, sqlite_core_1.real)('actual_hours'),
    dueDate: (0, sqlite_core_1.text)('due_date'), // YYYY-MM-DD format
    completedAt: (0, sqlite_core_1.integer)('completed_at', { mode: 'timestamp' }),
    orderIndex: (0, sqlite_core_1.integer)('order_index').notNull().default(0),
    notes: (0, sqlite_core_1.text)('notes'),
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    statusIdx: (0, sqlite_core_1.index)('tasks_status_idx').on(table.status),
    priorityIdx: (0, sqlite_core_1.index)('tasks_priority_idx').on(table.priority),
    jobIdx: (0, sqlite_core_1.index)('tasks_job_idx').on(table.jobId),
    assignedIdx: (0, sqlite_core_1.index)('tasks_assigned_idx').on(table.assignedUserId),
    orderIdx: (0, sqlite_core_1.index)('tasks_order_idx').on(table.orderIndex),
    orgIdx: (0, sqlite_core_1.index)('tasks_org_idx').on(table.organizationId),
}));
// Documents table - for file management linked to jobs/contacts
exports.documents = (0, sqlite_core_1.sqliteTable)('documents', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: (0, sqlite_core_1.text)('organization_id').notNull().references(() => exports.organizations.id),
    jobId: (0, sqlite_core_1.text)('job_id').references(() => exports.jobs.id),
    contactId: (0, sqlite_core_1.text)('contact_id').references(() => exports.contacts.id),
    fileName: (0, sqlite_core_1.text)('file_name').notNull(),
    originalFileName: (0, sqlite_core_1.text)('original_file_name').notNull(),
    filePath: (0, sqlite_core_1.text)('file_path').notNull(),
    fileSize: (0, sqlite_core_1.integer)('file_size').notNull(), // in bytes
    mimeType: (0, sqlite_core_1.text)('mime_type').notNull(),
    fileType: (0, sqlite_core_1.text)('file_type').notNull(), // pdf, image, document, etc.
    category: (0, sqlite_core_1.text)('category'), // contract, invoice, photo, etc.
    title: (0, sqlite_core_1.text)('title'),
    description: (0, sqlite_core_1.text)('description'),
    uploadedByUserId: (0, sqlite_core_1.text)('uploaded_by_user_id').notNull().references(() => exports.users.id),
    status: (0, sqlite_core_1.text)('status').notNull().default('active'), // active, archived, deleted
    tags: (0, sqlite_core_1.text)('tags'), // JSON array of strings for tagging
    metadata: (0, sqlite_core_1.text)('metadata'), // JSON object for extracted data, dimensions, etc.
    isPublic: (0, sqlite_core_1.integer)('is_public', { mode: 'boolean' }).notNull().default(false),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    fileNameIdx: (0, sqlite_core_1.index)('documents_file_name_idx').on(table.fileName),
    fileTypeIdx: (0, sqlite_core_1.index)('documents_file_type_idx').on(table.fileType),
    categoryIdx: (0, sqlite_core_1.index)('documents_category_idx').on(table.category),
    jobIdx: (0, sqlite_core_1.index)('documents_job_idx').on(table.jobId),
    contactIdx: (0, sqlite_core_1.index)('documents_contact_idx').on(table.contactId),
    uploadedByIdx: (0, sqlite_core_1.index)('documents_uploaded_by_idx').on(table.uploadedByUserId),
    orgIdx: (0, sqlite_core_1.index)('documents_org_idx').on(table.organizationId),
}));
// Contractors table - for managing construction contractors
exports.contractors = (0, sqlite_core_1.sqliteTable)('contractors', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: (0, sqlite_core_1.text)('organization_id').notNull().references(() => exports.organizations.id),
    userId: (0, sqlite_core_1.text)('user_id').references(() => exports.users.id), // link to user if they have account
    firstName: (0, sqlite_core_1.text)('first_name').notNull(),
    lastName: (0, sqlite_core_1.text)('last_name').notNull(),
    email: (0, sqlite_core_1.text)('email'),
    phone: (0, sqlite_core_1.text)('phone'),
    skills: (0, sqlite_core_1.text)('skills'), // JSON array of skills/certifications
    hourlyRate: (0, sqlite_core_1.real)('hourly_rate'),
    payrollId: (0, sqlite_core_1.text)('payroll_id'), // external payroll system ID
    emergencyContact: (0, sqlite_core_1.text)('emergency_contact'), // JSON object: name, phone, relationship
    hireDate: (0, sqlite_core_1.text)('hire_date'), // YYYY-MM-DD format
    status: (0, sqlite_core_1.text)('status').notNull().default('active'), // active, inactive, terminated
    notes: (0, sqlite_core_1.text)('notes'),
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    nameIdx: (0, sqlite_core_1.index)('contractors_name_idx').on(table.firstName, table.lastName),
    emailIdx: (0, sqlite_core_1.index)('contractors_email_idx').on(table.email),
    statusIdx: (0, sqlite_core_1.index)('contractors_status_idx').on(table.status),
    userIdx: (0, sqlite_core_1.index)('contractors_user_idx').on(table.userId),
    orgIdx: (0, sqlite_core_1.index)('contractors_org_idx').on(table.organizationId),
}));
// Job Assignments table - for linking contractors to jobs
exports.jobAssignments = (0, sqlite_core_1.sqliteTable)('job_assignments', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: (0, sqlite_core_1.text)('organization_id').notNull().references(() => exports.organizations.id),
    jobId: (0, sqlite_core_1.text)('job_id').notNull().references(() => exports.jobs.id),
    contractorId: (0, sqlite_core_1.text)('contractor_id').notNull().references(() => exports.contractors.id),
    role: (0, sqlite_core_1.text)('role'), // foreman, laborer, specialist, etc.
    assignedDate: (0, sqlite_core_1.text)('assigned_date').notNull(), // YYYY-MM-DD format
    unassignedDate: (0, sqlite_core_1.text)('unassigned_date'), // YYYY-MM-DD format
    hourlyRate: (0, sqlite_core_1.real)('hourly_rate'), // can override default rate
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    jobIdx: (0, sqlite_core_1.index)('job_assignments_job_idx').on(table.jobId),
    contractorIdx: (0, sqlite_core_1.index)('job_assignments_contractor_idx').on(table.contractorId),
    roleIdx: (0, sqlite_core_1.index)('job_assignments_role_idx').on(table.role),
    orgIdx: (0, sqlite_core_1.index)('job_assignments_org_idx').on(table.organizationId),
    // Unique constraint for active assignments
    uniqueActiveAssignment: (0, sqlite_core_1.uniqueIndex)('job_assignments_unique_active').on(table.jobId, table.contractorId),
}));
// Define relationships (same as before)
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
    uploadedDocuments: many(exports.documents),
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
    documents: many(exports.documents),
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
    documents: many(exports.documents),
    jobAssignments: many(exports.jobAssignments),
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
