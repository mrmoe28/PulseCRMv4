import {
    Home,
    Briefcase,
    Users,
    FileText,
    UserCheck,
    Calendar,
    CheckSquare,
    MessageCircle,
    Zap,
    Settings,
    Plus,
    Search,
    Bell,
    User,
    LogOut,
    Edit,
    Trash2,
    Download,
    Upload,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    X,
    Check,
    AlertCircle,
    Info,
    Loader2,
    Menu,
    Mail,
    Phone,
    MapPin,
    Clock,
    DollarSign,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Filter,
    SortAsc,
    SortDesc,
    MoreHorizontal,
    MoreVertical,
    ExternalLink,
    Copy,
    Share,
    Star,
    Heart,
    Bookmark,
    Flag,
    Tag,
    Paperclip,
    Image,
    Video,
    Mic,
    Camera,
    Lock,
    Unlock,
    Shield,
    Key,
    RefreshCw,
    RotateCcw,
    Save,
    Archive,
    Folder,
    FolderOpen,
    File,
    FileImage,
    FileText as FilePdf,
    FileSpreadsheet,
    FileText as FileWord,
    Database,
    Server,
    Cloud,
    Wifi,
    WifiOff,
    Globe,
    Link,
    Unlink,
    ZoomIn,
    ZoomOut,
    Maximize,
    type LucideIcon,
} from 'lucide-react';

// Export all icons with consistent naming
export const Icons = {
    // Navigation
    Home,
    Briefcase,
    Users,
    FileText,
    UserCheck,
    Calendar,
    CheckSquare,
    MessageCircle,
    Zap,
    Settings,

    // Actions
    Plus,
    Search,
    Bell,
    User,
    LogOut,
    Edit,
    Trash2,
    Download,
    Upload,
    Eye,
    EyeOff,

    // Navigation arrows
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,

    // UI
    X,
    Check,
    AlertCircle,
    Info,
    Loader2,
    Menu,

    // Contact & Communication
    Mail,
    Phone,
    MapPin,

    // Time & Money
    Clock,
    DollarSign,

    // Analytics
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,

    // Data manipulation
    Filter,
    SortAsc,
    SortDesc,
    MoreHorizontal,
    MoreVertical,

    // External actions
    ExternalLink,
    Copy,
    Share,

    // Favorites & bookmarks
    Star,
    Heart,
    Bookmark,
    Flag,
    Tag,

    // Media & files
    Paperclip,
    Image,
    Video,
    Mic,
    Camera,

    // Security
    Lock,
    Unlock,
    Shield,
    Key,

    // System actions
    RefreshCw,
    RotateCcw,
    Save,
    Archive,

    // File system
    Folder,
    FolderOpen,
    File,
    FileImage,
    FilePdf,
    FileSpreadsheet,
    FileWord,

    // Infrastructure
    Database,
    Server,
    Cloud,

    // Network
    Wifi,
    WifiOff,
    Globe,
    Link,
    Unlink,

    // PDF Controls
    ZoomIn,
    ZoomOut,
    Maximize,
} as const;

// Icon component with consistent styling
export interface IconProps {
    name: keyof typeof Icons;
    size?: number;
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, className = '' }) => {
    const IconComponent = Icons[name] as LucideIcon;

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    return <IconComponent size={size} className={className} />;
};

// Specific icon components for common use cases
export const LoadingIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Loader2 className={`animate-spin ${className}`} />
);

export const StatusIcon: React.FC<{
    status: 'success' | 'error' | 'warning' | 'info';
    className?: string;
}> = ({ status, className }) => {
    const iconMap = {
        success: Check,
        error: X,
        warning: AlertCircle,
        info: Info,
    };

    const IconComponent = iconMap[status];
    return <IconComponent className={className} />;
};

// Export the type for use in other components
export type IconName = keyof typeof Icons; 