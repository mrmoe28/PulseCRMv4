import { Suspense, ReactNode } from 'react';
import { LoadingIcon } from '../ui/icons';

interface DashboardLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Main Content */}
            <main className="p-6">
                {/* Page Header */}
                {(title || subtitle) && (
                    <div className="mb-8">
                        {title && (
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="text-gray-600 dark:text-gray-400">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                {/* Page Content */}
                <Suspense fallback={<LoadingFallback />}>
                    {children}
                </Suspense>
            </main>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center h-64">
            <LoadingIcon className="w-8 h-8 text-orange-500" />
        </div>
    );
} 