'use client';

import { useState, useEffect } from 'react';

const themes = [
  { id: 'default', name: 'Claude Elegant', icon: '✨', colors: { primary: '#D97F3E', secondary: '#E6E2DD' } },
  { id: 'chatgpt', name: 'ChatGPT Modern', icon: '🤖', colors: { primary: '#74AA9C', secondary: '#AB68FF' } },
  { id: 'monochrome', name: 'Monochrome Pro', icon: '⚫', colors: { primary: '#000000', secondary: '#FFFFFF' } },
  { id: 'notion', name: 'Notion Clean', icon: '📝', colors: { primary: '#6B7C8F', secondary: '#F7F6F3' } },
];

type Theme = 'default' | 'chatgpt' | 'monochrome' | 'notion';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('default');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('ThemeSwitcher mounting...');
    setMounted(true);
    // Load saved preferences
    const savedTheme = localStorage.getItem('pulse_color_theme') as Theme;
    
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Remove all theme classes
    root.removeAttribute('data-theme');
    
    // Apply selected theme
    if (theme !== 'default') {
      root.setAttribute('data-theme', theme);
    }
    
    // Save preferences
    localStorage.setItem('pulse_color_theme', theme);
  }, [theme, mounted]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.theme-switcher-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!mounted) {
    return null;
  }

  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  return (
    <div className="relative theme-switcher-container">
      <button
        onClick={() => {
          console.log('Theme button clicked!');
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="Change color theme"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span className="hidden sm:inline">{currentTheme.icon}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-1">
              Color Theme
            </div>
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id as Theme);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md transition-colors ${
                  theme === t.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{t.name}</div>
                  <div className="flex gap-1 mt-1">
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: t.colors.primary }}
                    />
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: t.colors.secondary }}
                    />
                  </div>
                </div>
                {theme === t.id && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}