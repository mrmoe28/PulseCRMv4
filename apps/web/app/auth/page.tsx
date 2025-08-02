'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Icons, LoadingIcon } from '../../components/ui/icons';
import { Input } from '../../components/ui/input';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user is already logged in (localStorage or cookies)
    const userData = localStorage.getItem('pulse_user');
    const sessionActive = localStorage.getItem('pulse_session_active');

    // Also check cookies as fallback
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const sessionCookie = getCookie('pulse_session_active');
    const userCookie = getCookie('pulse_user');

    if ((userData && sessionActive === 'true') || (sessionCookie === 'true' && userCookie)) {
      console.log('User already logged in, redirecting to dashboard');
      router.replace('/dashboard');
      return;
    }

    // Check for registration success message
    const message = searchParams.get('message');
    if (message === 'registration-success') {
      setSuccessMessage('Account created successfully! Please sign in with your new credentials.');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/simple-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Login successful, storing user data:', data.user);

        // Store user data in localStorage
        localStorage.setItem('pulse_user', JSON.stringify(data.user));
        localStorage.setItem('pulse_session_active', 'true');

        // Set cookies for middleware validation
        document.cookie = `pulse_session_active=true; path=/; max-age=2592000`; // 30 days
        document.cookie = `pulse_user=${JSON.stringify(data.user)}; path=/; max-age=2592000`; // 30 days

        console.log('Redirecting to dashboard...');

        // Use window.location for a hard redirect to ensure it works
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pulse<span className="text-orange-500">CRM</span>
            </h1>
          </div>
          <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-2">Welcome back</h2>
          <p className="text-gray-500 dark:text-gray-400">Sign in to your workspace</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm">
            <div className="flex items-center">
              <Icons.Check size={16} className="mr-2" />
              {successMessage}
            </div>
          </div>
        )}

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign in to PulseCRM</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                  <div className="flex items-center">
                    <Icons.AlertCircle size={16} className="mr-2" />
                    {error}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </label>
                </div>
                <Link href="/auth/forgot-password" className="text-sm text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <LoadingIcon className="mr-2 h-4 w-4" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Icons.User size={16} className="mr-2" />
                    Sign in
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>



        {/* Signup Link */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 font-semibold">
              Create your workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
