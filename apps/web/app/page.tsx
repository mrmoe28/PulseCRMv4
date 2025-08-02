'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('pulse_user');
    const sessionActive = localStorage.getItem('pulse_session_active');

    console.log('Homepage auth check:', { userData: !!userData, sessionActive });

    if (userData && sessionActive === 'true') {
      try {
        const user = JSON.parse(userData);
        console.log('Parsed user:', { id: user.id, email: user.email });

        // Check if user has valid credentials with proper property names
        if (user && user.id && user.email) {
          console.log('Valid user found, redirecting to dashboard');
          router.replace('/dashboard');
          return;
        } else {
          console.log('Invalid user data, clearing localStorage');
          // Invalid user data, clear and show landing
          localStorage.removeItem('pulse_user');
          localStorage.removeItem('pulse_session_active');
        }
      } catch (error) {
        console.log('Error parsing user data:', error);
        // Invalid JSON, clear and show landing
        localStorage.removeItem('pulse_user');
        localStorage.removeItem('pulse_session_active');
      }
    }

    // Show landing page for 2 seconds, then redirect to auth
    setShowLanding(true);
    const timer = setTimeout(() => {
      router.replace('/auth');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!showLanding) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo & Branding */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-3xl">P</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Pulse<span className="text-orange-500">CRM</span>
          </h1>
          <p className="text-xl text-gray-300 mb-2">Crew Management Dashboard</p>
          <p className="text-gray-400">Next-generation construction CRM platform</p>
        </div>

        {/* Quick Access */}
        <div className="mb-12">
          <Link href="/auth" className="group inline-block">
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-8 hover:border-orange-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 max-w-md mx-auto">
              <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Get Started</h3>
              <p className="text-gray-300">Sign in to your workspace or create a new account</p>
            </div>
          </Link>
        </div>

        {/* Manual Login */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">Need manual login?</p>
          <Link
            href="/auth"
            className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Go to login page
          </Link>
        </div>

        {/* Auto-redirect notice */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">Automatically redirecting to login in a few seconds...</p>
        </div>
      </div>
    </div>
  );
}
