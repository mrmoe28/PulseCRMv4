'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, Bell, Search, Plus, ChevronDown, Home, Users, Briefcase, CheckSquare, Calendar, FileText, BarChart, Settings, LogOut, Sun, Moon } from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { name: 'Contractors', href: '/dashboard/contractors', icon: Users },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Scheduling', href: '/dashboard/scheduling', icon: Calendar },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
];

const moreItems = [
  { name: 'Reports', href: '/reports', icon: BarChart },
  { name: 'Integrations', href: '/integrations', icon: Settings },
  { name: 'Organization', href: '/dashboard/organization', icon: Settings },
];

interface User {
  name?: string;
  username?: string;
  avatar?: string;
  role?: string;
}

interface MobileNavigationProps {
  user: User;
}

export default function MobileNavigation({ user }: MobileNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New job assigned', read: false },
    { id: 2, text: 'Document approved', read: false },
  ]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('pulse_theme');
    const isDark = savedTheme ? savedTheme === 'dark' : true;
    setIsDarkMode(isDark);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('pulse_user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.profileImage) {
          setProfileImage(parsedUser.profileImage);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('pulse_session_active');
    localStorage.removeItem('pulse_user');
    document.cookie = 'pulse_session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'pulse_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/auth');
  };

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('pulse_theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const renderAvatar = () => {
    if (profileImage) {
      return (
        <img
          src={profileImage}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border-2 border-orange-500"
        />
      );
    }

    return (
      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
        <span className="text-white font-medium text-sm">
          {(user.avatar ?? user.name ?? 'U').slice(0, 1).toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Pulse<span className="text-orange-500">CRM</span>
                </h1>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* New Job Button */}
              <button
                onClick={() => router.push('/dashboard/jobs')}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="New Job"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Search */}
              <button
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-orange-500" />
                )}
              </button>

              {/* Profile */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-1"
              >
                {renderAvatar()}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute right-4 top-16 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            <div className="p-4 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
              Notifications
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
                  No notifications
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 ${
                      n.read ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className={`text-sm ${n.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {n.text}
                      </p>
                      {!n.read && (
                        <button
                          onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                          className="text-xs text-orange-500 hover:underline ml-2"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Slide-out Menu */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Menu Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {renderAvatar()}
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {user.name || 'User'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user.username || 'user@example.com'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* More Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  More
                </p>
                <div className="space-y-1">
                  {moreItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Settings & Support */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Account
                </p>
                <div className="space-y-1">
                  <Link
                    href="/settings/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}