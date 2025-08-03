'use client';

import React from 'react';
import { ArrowLeft, Link2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/dashboard-layout';

export default function IntegrationsPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integrations</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your external service connections</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Connected</h3>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active integrations</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Available</h3>
                <Link2 className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ready to connect</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Health</h3>
                <div className="w-5 h-5 rounded-full bg-green-500"></div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">100%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">System operational</p>
            </div>
          </div>

          {/* Coming Soon Message */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Integrations Coming Soon
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                We're working on bringing you powerful integrations to enhance your workflow. 
                Check back soon for updates!
              </p>
              
              <div className="mt-8 space-y-2">
                <p className="text-sm text-gray-400 dark:text-gray-500">Planned integrations:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Email', 'Calendar', 'Slack', 'QuickBooks', 'Stripe'].map((integration) => (
                    <span
                      key={integration}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm"
                    >
                      {integration}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}