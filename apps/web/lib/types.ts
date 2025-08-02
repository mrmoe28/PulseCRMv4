// =============================================================================
// CONTACT MANAGEMENT TYPES
// =============================================================================

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  type: ContactType;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ContactType = 'Client' | 'Supplier' | 'Contractor' | 'Employee';

export type CreateContactPayload = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>
export interface UpdateContactPayload extends Partial<CreateContactPayload> {
  id: string;
}

// =============================================================================
// JOB MANAGEMENT TYPES
// =============================================================================

export interface Job {
  id: string;
  title: string;
  description?: string;
  contactId: string;
  contact?: Contact; // Populated when needed
  status: JobStatus;
  priority: JobPriority;
  startDate: Date;
  endDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  budget?: number;
  actualCost?: number;
  location?: string;
  notes?: string;
  tags?: string[];
  assignedCrew?: CrewMember[];
  tasks?: Task[];
  documents?: Document[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  // Custom fields for UI compatibility
  address?: string;
  systemType?: string;
  contactPhone?: string;
  updates?: string;
  image?: string;
}

export type JobStatus = 
  | 'quoted'          // Quote has been sent to client
  | 'scheduled'       // Job has been scheduled
  | 'in_progress'     // Work has started
  | 'completed'       // Work is finished
  | 'cancelled'       // Job was cancelled
  | 'on_hold';        // Job is temporarily paused

export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export type CreateJobPayload = Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>
export interface UpdateJobPayload extends Partial<CreateJobPayload> {
  id: string;
}

// Job filtering and search
export interface JobFilters {
  status?: JobStatus[];
  priority?: JobPriority[];
  contactId?: string;
  assignedCrewId?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  tags?: string[];
  search?: string; // Search in title, description, location
}

export interface JobSortOptions {
  field: 'title' | 'startDate' | 'endDate' | 'status' | 'priority' | 'createdAt';
  direction: 'asc' | 'desc';
}

// =============================================================================
// TASK MANAGEMENT TYPES
// =============================================================================

export interface Task {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string; // CrewMember ID
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  completedAt?: Date;
  dependencies?: string[]; // Other task IDs that must be completed first
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Completed' | 'Blocked';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type CreateTaskPayload = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>
export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  id: string;
}

// =============================================================================
// CREW MANAGEMENT TYPES
// =============================================================================

export interface CrewMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: CrewRole;
  skills: string[];
  hourlyRate?: number;
  isActive: boolean;
  hireDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CrewRole = 
  | 'Foreman'
  | 'Supervisor'
  | 'Carpenter'
  | 'Electrician'
  | 'Plumber'
  | 'Painter'
  | 'Laborer'
  | 'Equipment Operator'
  | 'Safety Officer'
  | 'Other';

export interface CrewAssignment {
  id: string;
  jobId: string;
  crewMemberId: string;
  role: string; // Role on this specific job
  assignedDate: Date;
  unassignedDate?: Date;
  notes?: string;
}

// =============================================================================
// DOCUMENT MANAGEMENT TYPES
// =============================================================================

export interface Document {
  id: string;
  jobId?: string;
  contactId?: string;
  name: string;
  originalName: string;
  type: DocumentType;
  size: number; // File size in bytes
  mimeType: string;
  url: string; // Storage URL
  description?: string;
  tags?: string[];
  uploadedBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentType = 
  | 'Contract'
  | 'Quote'
  | 'Invoice'
  | 'Receipt'
  | 'Blueprint'
  | 'Photo'
  | 'Report'
  | 'Certificate'
  | 'Other';

// =============================================================================
// SCHEDULING TYPES
// =============================================================================

export interface ScheduleEntry {
  id: string;
  jobId: string;
  job?: Job; // Populated when needed
  crewMemberIds: string[];
  crewMembers?: CrewMember[]; // Populated when needed
  startDateTime: Date;
  endDateTime: Date;
  notes?: string;
  status: ScheduleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ScheduleStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface ScheduleFilters {
  startDate?: Date;
  endDate?: Date;
  crewMemberId?: string;
  jobId?: string;
  status?: ScheduleStatus[];
}

// =============================================================================
// ANALYTICS AND REPORTING TYPES
// =============================================================================

export interface DashboardMetrics {
  totalContacts: number;
  activeJobs: number;
  completedJobsThisMonth: number;
  totalRevenue: number;
  averageJobValue: number;
  conversionRate: number; // Quotes to jobs conversion
  completionRate: number; // On-time completion rate
  crewUtilization: number; // Percentage of crew time utilized
}

export interface JobMetrics {
  id: string;
  title: string;
  profitMargin: number;
  hoursVariance: number; // Actual vs estimated hours
  budgetVariance: number; // Actual vs budgeted cost
  daysToComplete: number;
  customerSatisfaction?: number; // Rating out of 5
}

export interface TimeframePeriod {
  label: string;
  value: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// =============================================================================
// FORM AND UI TYPES
// =============================================================================

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'date' | 'number' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    custom?: (value: unknown) => string | null;
  };
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type WithId<T> = T & { id: string };
export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

// =============================================================================
// STATUS BADGE MAPPINGS
// =============================================================================

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  'quoted': 'bg-blue-600',
  'scheduled': 'bg-purple-600',
  'in_progress': 'bg-orange-500',
  'on_hold': 'bg-yellow-600',
  'completed': 'bg-green-700',
  'cancelled': 'bg-red-600',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  'Todo': 'bg-gray-600',
  'In Progress': 'bg-blue-600',
  'Completed': 'bg-green-600',
  'Blocked': 'bg-red-600',
};

export const PRIORITY_COLORS: Record<JobPriority, string> = {
  'low': 'bg-green-600',
  'medium': 'bg-yellow-600',
  'high': 'bg-orange-600',
  'urgent': 'bg-red-600',
};

export const CONTACT_TYPE_COLORS: Record<ContactType, string> = {
  'Client': 'bg-blue-600',
  'Supplier': 'bg-green-600',
  'Contractor': 'bg-purple-600',
  'Employee': 'bg-orange-600',
}; 