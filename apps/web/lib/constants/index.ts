// App configuration
export const APP_CONFIG = {
    name: 'PulseCRM',
    description: 'Crew Management Dashboard',
    version: '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010',
    api: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
        timeout: 30000,
    },
} as const;

// Local storage keys
export const STORAGE_KEYS = {
    USER: 'pulse_user',
    SESSION: 'pulse_session_active',
    THEME: 'pulse_theme',
    PREFERENCES: 'pulse_preferences',
} as const;

// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        SIGNUP: '/auth/signup',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
    },
    USERS: '/users',
    JOBS: '/jobs',
    CONTACTS: '/contacts',
    DOCUMENTS: '/documents',
    DASHBOARD: '/dashboard/stats',
} as const;

// Job statuses and priorities
export const JOB_STATUSES = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    ON_HOLD: 'on_hold',
} as const;

export const JOB_PRIORITIES = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
} as const;

export const JOB_STATUS_LABELS = {
    [JOB_STATUSES.PENDING]: 'Pending',
    [JOB_STATUSES.IN_PROGRESS]: 'In Progress',
    [JOB_STATUSES.COMPLETED]: 'Completed',
    [JOB_STATUSES.CANCELLED]: 'Cancelled',
    [JOB_STATUSES.ON_HOLD]: 'On Hold',
} as const;

export const JOB_PRIORITY_LABELS = {
    [JOB_PRIORITIES.LOW]: 'Low',
    [JOB_PRIORITIES.MEDIUM]: 'Medium',
    [JOB_PRIORITIES.HIGH]: 'High',
    [JOB_PRIORITIES.URGENT]: 'Urgent',
} as const;

// User roles
export const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    EMPLOYEE: 'employee',
    CONTRACTOR: 'contractor',
} as const;

export const USER_ROLE_LABELS = {
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.MANAGER]: 'Manager',
    [USER_ROLES.EMPLOYEE]: 'Employee',
    [USER_ROLES.CONTRACTOR]: 'Contractor',
} as const;

// File upload configuration
export const FILE_UPLOAD = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: {
        IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        ALL: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    },
} as const;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
    MAX_PAGE_SIZE: 100,
} as const;

// Date formats
export const DATE_FORMATS = {
    DISPLAY: 'MMM d, yyyy',
    INPUT: 'yyyy-MM-dd',
    DATETIME: 'MMM d, yyyy h:mm a',
    TIME: 'h:mm a',
} as const;

// Theme colors
export const THEME_COLORS = {
    PRIMARY: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316', // Main orange
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
    },
    GRAY: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    },
} as const;

// Navigation items
export const NAVIGATION_ITEMS = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: 'Home',
    },
    {
        name: 'Jobs',
        href: '/dashboard/jobs',
        icon: 'Briefcase',
    },
    {
        name: 'Contacts',
        href: '/dashboard/contacts',
        icon: 'Users',
    },
    {
        name: 'Documents',
        href: '/dashboard/documents',
        icon: 'FileText',
    },
    {
        name: 'Crew',
        href: '/dashboard/crew',
        icon: 'UserCheck',
    },
    {
        name: 'Scheduling',
        href: '/dashboard/scheduling',
        icon: 'Calendar',
    },
    {
        name: 'Tasks',
        href: '/dashboard/tasks',
        icon: 'CheckSquare',
    },
    {
        name: 'Live Chat',
        href: '/dashboard/live-chat',
        icon: 'MessageCircle',
    },
    {
        name: 'Integrations',
        href: '/dashboard/integrations',
        icon: 'Zap',
    },
    {
        name: 'Settings',
        href: '/dashboard/settings',
        icon: 'Settings',
    },
] as const;

// Error messages
export const ERROR_MESSAGES = {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION: 'Please check your input and try again.',
    FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
    INVALID_FILE_TYPE: 'Invalid file type.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
    SAVED: 'Changes saved successfully.',
    CREATED: 'Created successfully.',
    UPDATED: 'Updated successfully.',
    DELETED: 'Deleted successfully.',
    UPLOADED: 'File uploaded successfully.',
    EMAIL_SENT: 'Email sent successfully.',
} as const;

// Validation rules
export const VALIDATION_RULES = {
    EMAIL: {
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        MESSAGE: 'Please enter a valid email address.',
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        MESSAGE: 'Password must be at least 8 characters with uppercase, lowercase, and number.',
    },
    PHONE: {
        PATTERN: /^\+?[\d\s-()]+$/,
        MIN_LENGTH: 10,
        MESSAGE: 'Please enter a valid phone number.',
    },
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 50,
        MESSAGE: 'Name must be between 2 and 50 characters.',
    },
} as const; 