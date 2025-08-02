import DashboardLayout from '../../../components/dashboard-layout';
import Link from 'next/link';

const settingsSections = [
  {
    title: 'System Settings',
    description: 'Configure application preferences, data retention, and system-wide defaults',
    href: '/settings/system',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    items: ['General Settings', 'Data Retention', 'Default Values', 'System Preferences']
  },
  {
    title: 'User Management',
    description: 'Manage crew members, administrators, and access permissions',
    href: '/settings/users',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    items: ['Add Users', 'Role Management', 'Active Sessions', 'User Profiles']
  },
  {
    title: 'Permissions',
    description: 'Configure role-based access control and feature permissions',
    href: '/settings/permissions',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    items: ['Role Definitions', 'Feature Access', 'Data Permissions', 'API Access']
  },
  {
    title: 'Backup & Security',
    description: 'Data backup schedules, security policies, and audit logs',
    href: '/settings/backup',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    items: ['Automated Backups', 'Security Policies', 'Audit Logs', 'Data Recovery']
  },
  {
    title: 'API & Integrations',
    description: 'External service connections, webhooks, and API management',
    href: '/settings/integrations',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    items: ['API Keys', 'Webhooks', 'Third-party Services', 'Integration Status']
  }
];

const quickActions = [
  {
    title: 'Add New User',
    description: 'Invite crew members to the platform',
    action: 'Add User',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    title: 'Backup Data',
    description: 'Create manual backup of all data',
    action: 'Start Backup',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    title: 'System Status',
    description: 'View current system health and performance',
    action: 'View Status',
    color: 'bg-purple-500 hover:bg-purple-600'
  }
];

export default function SettingsPage() {
  return (
    <DashboardLayout title="Settings" subtitle="Manage system configuration and administrative options">
      <div className="space-y-8">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">{action.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{action.description}</p>
                <button className={`w-full px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${action.color}`}>
                  {action.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Administrative Sections */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Administrative Settings</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {settingsSections.map((section, index) => (
              <Link key={index} href={section.href} className="group">
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 transition-all duration-200 group-hover:border-orange-500 group-hover:bg-gray-800">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-orange-500 group-hover:text-orange-400 transition-colors">
                        {section.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg group-hover:text-orange-500 transition-colors">
                          {section.title}
                        </h3>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                    {section.description}
                  </p>

                  {/* Items */}
                  <div className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center text-sm text-gray-500">
                        <div className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">5</div>
              <div className="text-gray-400 text-sm">Active Users</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-500 mb-1">Online</div>
              <div className="text-gray-400 text-sm">System Status</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-1">847</div>
              <div className="text-gray-400 text-sm">Total Jobs</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-500 mb-1">98%</div>
              <div className="text-gray-400 text-sm">Uptime</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Administrative Activity</h2>
          <div className="space-y-3">
            {[
              { action: 'User "john.doe" was added to system', time: '2 hours ago', type: 'user' },
              { action: 'Backup completed successfully', time: '6 hours ago', type: 'backup' },
              { action: 'Permission updated for "Project Managers" role', time: '1 day ago', type: 'permission' },
              { action: 'API key regenerated for external integration', time: '2 days ago', type: 'api' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'backup' ? 'bg-green-500' :
                    activity.type === 'permission' ? 'bg-yellow-500' :
                    'bg-purple-500'
                  }`}></div>
                  <span className="text-gray-300">{activity.action}</span>
                </div>
                <span className="text-gray-500 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}