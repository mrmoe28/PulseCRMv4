import {
  CONTACT_TYPE_COLORS,
  ContactType,
  JOB_STATUS_COLORS,
  JobPriority,
  JobStatus,
  PRIORITY_COLORS,
  TASK_STATUS_COLORS,
  TaskStatus
} from '../lib/types';

interface StatusBadgeProps {
  variant: 'job-status' | 'task-status' | 'priority' | 'contact-type';
  value: JobStatus | TaskStatus | JobPriority | ContactType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StatusBadge({
  variant,
  value,
  size = 'md',
  className = ''
}: StatusBadgeProps) {
  const getColorClass = () => {
    switch (variant) {
      case 'job-status':
        return JOB_STATUS_COLORS[value as JobStatus];
      case 'task-status':
        return TASK_STATUS_COLORS[value as TaskStatus];
      case 'priority':
        return PRIORITY_COLORS[value as JobPriority];
      case 'contact-type':
        return CONTACT_TYPE_COLORS[value as ContactType];
      default:
        return 'bg-gray-600';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-3 py-1.5 text-base';
      default:
        return 'px-2 py-1 text-sm';
    }
  };

  const getIcon = () => {
    if (variant === 'job-status') {
      const status = value as JobStatus;
      switch (status) {
        case 'quoted':
          return '📝';
        case 'scheduled':
          return '📅';
        case 'in_progress':
          return '🔧';
        case 'completed':
          return '✨';
        case 'cancelled':
          return '❌';
        case 'on_hold':
          return '⏸️';
        default:
          return null;
      }
    }

    if (variant === 'task-status') {
      const status = value as TaskStatus;
      switch (status) {
        case 'Todo':
          return '⏳';
        case 'In Progress':
          return '🔄';
        case 'Completed':
          return '✅';
        case 'Blocked':
          return '🚫';
        default:
          return null;
      }
    }

    if (variant === 'priority') {
      const priority = value as JobPriority;
      switch (priority) {
        case 'low':
          return '🟢';
        case 'medium':
          return '🟡';
        case 'high':
          return '🟠';
        case 'urgent':
          return '🔴';
        default:
          return null;
      }
    }

    if (variant === 'contact-type') {
      const type = value as ContactType;
      switch (type) {
        case 'Client':
          return '👤';
        case 'Supplier':
          return '📦';
        case 'Contractor':
          return '🔨';
        case 'Employee':
          return '👷';
        default:
          return null;
      }
    }

    return null;
  };

  const icon = getIcon();

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full text-white
        ${getColorClass()}
        ${getSizeClass()}
        ${className}
      `}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {value}
    </span>
  );
}

// Convenience components for specific badge types
export function JobStatusBadge({
  status,
  size = 'md',
  className = ''
}: {
  status: JobStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <StatusBadge
      variant="job-status"
      value={status}
      size={size}
      className={className}
    />
  );
}

export function TaskStatusBadge({
  status,
  size = 'md',
  className = ''
}: {
  status: TaskStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <StatusBadge
      variant="task-status"
      value={status}
      size={size}
      className={className}
    />
  );
}

export function PriorityBadge({
  priority,
  size = 'md',
  className = ''
}: {
  priority: JobPriority;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <StatusBadge
      variant="priority"
      value={priority}
      size={size}
      className={className}
    />
  );
}

export function ContactTypeBadge({
  type,
  size = 'md',
  className = ''
}: {
  type: ContactType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <StatusBadge
      variant="contact-type"
      value={type}
      size={size}
      className={className}
    />
  );
} 