'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FeatureNotification from './notifications/FeatureNotification';
import TopNavigation from './top-navigation';
import MobileNavigation from './mobile-navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  // TEST MODE: Authentication bypassed for theme testing
  // TODO: Remove this before production
  const [user, setUser] = useState<any>({
    id: 'test-user-123',
    email: 'test@pulsecrm.com',
    name: 'Test User',
    username: 'testuser',
    role: 'Administrator',
    avatar: 'T',
    organizationId: 'test-org-123',
    organizationName: 'Test Organization'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(true);
  const router = useRouter();

  // COMMENTED OUT FOR TESTING - Uncomment for production
  /*
  useEffect(() => {
    // Prevent multiple auth checks
    if (authChecked) return;

    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('pulse_user');
        const sessionActive = localStorage.getItem('pulse_session_active');

        console.log('Dashboard auth check:', {
          userData: !!userData,
          sessionActive,
          userDataLength: userData?.length
        });

        // If no session or user data, redirect to auth
        if (!userData || sessionActive !== 'true') {
          console.log('No valid session, redirecting to auth');
          setAuthChecked(true);
          setIsLoading(false);
          router.replace('/auth');
          return;
        }

        // Try to parse user data
        const parsedUser = JSON.parse(userData);

        // Validate user data structure
        if (!parsedUser || !parsedUser.email) {
          console.log('Invalid user data, clearing session');
          localStorage.removeItem('pulse_user');
          localStorage.removeItem('pulse_session_active');
          setAuthChecked(true);
          setIsLoading(false);
          router.replace('/auth');
          return;
        }

        console.log('Dashboard user loaded:', { id: parsedUser.id, email: parsedUser.email });
        setUser(parsedUser);
        setAuthChecked(true);
        setIsLoading(false);

      } catch (error) {
        console.error('Error during auth check:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('pulse_user');
        localStorage.removeItem('pulse_session_active');
        setAuthChecked(true);
        setIsLoading(false);
        router.replace('/auth');
      }
    };

    // Small delay to prevent flash of loading screen
    const timeoutId = setTimeout(checkAuth, 100);

    return () => clearTimeout(timeoutId);
  }, [router, authChecked]);
  */

  // Show loading only if we haven't checked auth yet
  if (isLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is checked but no user, don't render anything (redirect is happening)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <TopNavigation user={{
          name: user.name || `${user.firstName} ${user.lastName}` || 'User',
          username: user.email,
          avatar: user.avatar,
          role: user.role || 'User'
        }} />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNavigation user={{
          name: user.name || `${user.firstName} ${user.lastName}` || 'User',
          username: user.email,
          avatar: user.avatar,
          role: user.role || 'User'
        }} />
      </div>

      <main className="p-4 sm:p-6 lg:p-8 max-w-[100vw] overflow-x-hidden">
        {(title || subtitle) && (
          <div className="mb-4 sm:mb-6">
            {title && (
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        )}
        <div className="w-full">
          {children}
        </div>
      </main>

      {/* Feature Notification Popup */}
      <FeatureNotification />
    </div>
  );
}
