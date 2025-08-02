import DashboardLayout from '../../../components/dashboard-layout';

const apiKeys = [
  { id: 1, name: 'Mobile App API', key: 'pk_live_51H...', created: '2025-06-15', lastUsed: '2 hours ago', status: 'Active' },
  { id: 2, name: 'Webhook Integration', key: 'pk_test_4eC3...', created: '2025-06-10', lastUsed: '1 day ago', status: 'Active' },
  { id: 3, name: 'External CRM Sync', key: 'pk_live_27X...', created: '2025-05-28', lastUsed: 'Never', status: 'Inactive' },
];

const integrations = [
  { 
    name: 'Slack', 
    description: 'Real-time notifications and crew communication',
    status: 'Connected',
    lastSync: '5 minutes ago',
    icon: '💬'
  },
  { 
    name: 'QuickBooks', 
    description: 'Automated invoicing and financial tracking',
    status: 'Connected',
    lastSync: '2 hours ago',
    icon: '💰'
  },
  { 
    name: 'Google Calendar', 
    description: 'Sync schedules and appointments',
    status: 'Disconnected',
    lastSync: 'Never',
    icon: '📅'
  },
  { 
    name: 'Dropbox', 
    description: 'Cloud storage for documents and files',
    status: 'Connected',
    lastSync: '1 hour ago',
    icon: '📁'
  },
];

const webhooks = [
  { id: 1, name: 'Job Status Updates', url: 'https://api.external.com/webhooks/jobs', events: ['job.created', 'job.updated'], status: 'Active' },
  { id: 2, name: 'Crew Notifications', url: 'https://slack.company.com/hooks/xyz', events: ['crew.assigned'], status: 'Active' },
  { id: 3, name: 'Client Portal Sync', url: 'https://portal.client.com/api/sync', events: ['job.completed'], status: 'Inactive' },
];

export default function IntegrationsPage() {
  return (
    <DashboardLayout title="API & Integrations" subtitle="External service connections, webhooks, and API management">
      <div className="space-y-8">
        {/* API Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6c-3 0-5.5-1.5-5.5-4a3.5 3.5 0 00-7 0c0 2.5 2.5 4 5.5 4a6 6 0 016-6z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-gray-400 text-sm">API Keys</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">4</p>
                <p className="text-gray-400 text-sm">Integrations</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-gray-400 text-sm">Webhooks</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">1.2k</p>
                <p className="text-gray-400 text-sm">API Calls Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Third-party Integrations */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Third-party Integrations</h2>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Browse App Store
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{integration.icon}</span>
                    <div>
                      <h3 className="text-white font-semibold">{integration.name}</h3>
                      <p className="text-gray-400 text-sm">{integration.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    integration.status === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {integration.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Last sync: {integration.lastSync}</span>
                  <div className="flex space-x-2">
                    {integration.status === 'Connected' ? (
                      <>
                        <button className="text-blue-500 hover:text-blue-400">Configure</button>
                        <button className="text-red-500 hover:text-red-400">Disconnect</button>
                      </>
                    ) : (
                      <button className="text-green-500 hover:text-green-400">Connect</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Keys Management */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">API Keys</h2>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Generate New Key
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">API Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{key.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <code className="bg-gray-900 px-2 py-1 rounded text-gray-300 text-sm font-mono">
                          {key.key}
                        </code>
                        <button className="ml-2 text-gray-400 hover:text-white">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{key.created}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{key.lastUsed}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        key.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {key.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button className="text-blue-500 hover:text-blue-400">Edit</button>
                        <button className="text-orange-500 hover:text-orange-400">Regenerate</button>
                        <button className="text-red-500 hover:text-red-400">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Webhooks */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Webhooks</h2>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Create Webhook
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Events</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {webhooks.map((webhook) => (
                  <tr key={webhook.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{webhook.name}</td>
                    <td className="px-6 py-4">
                      <code className="bg-gray-900 px-2 py-1 rounded text-gray-300 text-sm font-mono max-w-xs truncate block">
                        {webhook.url}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {event}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        webhook.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {webhook.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button className="text-blue-500 hover:text-blue-400">Edit</button>
                        <button className="text-purple-500 hover:text-purple-400">Test</button>
                        <button className="text-red-500 hover:text-red-400">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* API Documentation */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">API Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">REST API</h3>
              <p className="text-gray-400 text-sm mb-4">Complete REST API documentation with examples</p>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors">
                View Documentation
              </button>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">GraphQL</h3>
              <p className="text-gray-400 text-sm mb-4">GraphQL schema and query examples</p>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition-colors">
                Explore Schema
              </button>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">SDKs</h3>
              <p className="text-gray-400 text-sm mb-4">Client libraries for popular languages</p>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition-colors">
                Download SDKs
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}