'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetLink('');

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/simple-auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
        // In development, show the reset link
        if (data.developmentLink) {
          setResetLink(data.developmentLink);
        }
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setError('Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message after email is sent
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="text-3xl font-bold text-white">
                Pulse<span className="text-orange-500">CRM</span>
              </h1>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Check Your Email!</h2>
            <p className="text-gray-300 mb-6">
              We&apos;ve sent password reset instructions to <strong className="text-white">{email}</strong>
            </p>

            {/* Development mode: Show reset link */}
            {resetLink && (
              <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-300 mb-2">
                  <strong>Development Mode - Reset Link:</strong>
                </p>
                <a
                  href={resetLink}
                  className="text-xs text-yellow-400 hover:text-yellow-300 break-all underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resetLink}
                </a>
                <p className="text-xs text-yellow-300 mt-2">
                  This link is only shown in development mode. In production, it would be sent via email.
                </p>
              </div>
            )}

            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-300 mb-2">
                <strong>Next steps:</strong>
              </p>
              <ol className="text-sm text-gray-400 space-y-1 text-left">
                <li>1. Check your email inbox (and spam folder)</li>
                <li>2. Click the password reset link</li>
                <li>3. Create a new password</li>
              </ol>
            </div>

            <div className="space-y-3">
              <Link
                href="/auth"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 inline-block"
              >
                Back to Sign In
              </Link>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                  setResetLink('');
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Try Another Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show the forgot password form
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Pulse<span className="text-orange-500">CRM</span>
            </h1>
          </div>
          <h2 className="text-xl text-gray-300 mb-2">Forgot your password?</h2>
          <p className="text-gray-400">No worries! Enter your email and we&apos;ll send you reset instructions.</p>
        </div>

        {/* Forgot Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Enter your email address"
            />
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending Instructions...
              </div>
            ) : (
              'Send Reset Instructions'
            )}
          </button>
        </form>

        {/* Back to login link */}
        <div className="text-center">
          <p className="text-gray-400">
            Remember your password?{' '}
            <Link href="/auth" className="text-orange-500 hover:text-orange-400 font-semibold">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
