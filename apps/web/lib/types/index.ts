// Core entity types
export interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
    companyId?: string;
    createdAt: Date;
    updatedAt: Date;
    isVerified?: boolean;
}

export interface Job {
    id: string;
    title: string;
    description: string;
    status: JobStatus;
    priority: JobPriority;
    assignedTo: string;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
    companyId: string;
    budget?: number;
    completedAt?: Date;
}

export interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    position?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    companyId: string;
}

export interface Document {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedBy: string;
    uploadedAt: Date;
    companyId: string;
    jobId?: string;
}

// Enum types
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';
export type UserRole = 'admin' | 'manager' | 'employee' | 'contractor';

// Component prop types
export interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export interface PageProps {
    params: { [key: string]: string | string[] | undefined };
    searchParams: { [key: string]: string | string[] | undefined };
}

// API response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface DashboardStats {
    totalUsers: number;
    activeJobs: number;
    completedJobs: number;
    verifiedUsers: number;
    totalRevenue: number;
    avgJobValue: number;
}

// Form types
export interface JobFormData {
    title: string;
    description: string;
    priority: JobPriority;
    assignedTo: string;
    dueDate: string;
    budget?: number;
}

export interface ContactFormData {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    position?: string;
    notes?: string;
}

// Auth types
export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    role?: UserRole;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData extends LoginCredentials {
    name: string;
    confirmPassword: string;
}

// Navigation types
export interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
}

// File upload types
export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
}

// Notification types
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
} 