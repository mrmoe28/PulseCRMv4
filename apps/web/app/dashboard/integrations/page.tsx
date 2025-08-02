'use client';

import { useState } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';
import { Search, Filter, Check, X, Settings, ExternalLink, Zap } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  connected: boolean;
  configRequired: boolean;
  popular?: boolean;
  lastSync?: string;
  apiCalls?: number;
  color: string;
}

const integrations: Integration[] = [
  // Communication
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send and receive emails directly from PulseCRM',
    category: 'communication',
    icon: '📧',
    connected: true,
    configRequired: true,
    popular: true,
    lastSync: '2 hours ago',
    apiCalls: 1250,
    color: 'bg-red-500'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Professional email delivery service for transactional emails',
    category: 'communication',
    icon: '📮',
    connected: false,
    configRequired: true,
    color: 'bg-blue-500'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS notifications and two-way messaging',
    category: 'communication',
    icon: '💬',
    connected: false,
    configRequired: true,
    popular: true,
    color: 'bg-red-600'
  },

  // Storage
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Store and sync documents with Google Drive',
    category: 'storage',
    icon: '☁️',
    connected: true,
    configRequired: false,
    popular: true,
    lastSync: '30 minutes ago',
    apiCalls: 450,
    color: 'bg-blue-600'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Sync files and documents with Dropbox',
    category: 'storage',
    icon: '📦',
    connected: false,
    configRequired: false,
    color: 'bg-blue-700'
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Enterprise-grade cloud storage solution',
    category: 'storage',
    icon: '🗄️',
    connected: false,
    configRequired: true,
    color: 'bg-orange-600'
  },

  // Project Management
  {
    id: 'trello',
    name: 'Trello',
    description: 'Sync jobs and tasks with Trello boards',
    category: 'project-management',
    icon: '📋',
    connected: false,
    configRequired: false,
    popular: true,
    color: 'bg-blue-500'
  },
  {
    id: 'asana',
    name: 'Asana',
    description: 'Project tracking and team collaboration',
    category: 'project-management',
    icon: '🎯',
    connected: false,
    configRequired: true,
    color: 'bg-pink-500'
  },
  {
    id: 'monday',
    name: 'Monday.com',
    description: 'Visual project management platform',
    category: 'project-management',
    icon: '📊',
    connected: false,
    configRequired: true,
    color: 'bg-purple-500'
  },

  // Accounting
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync invoices and financial data',
    category: 'accounting',
    icon: '💰',
    connected: true,
    configRequired: true,
    popular: true,
    lastSync: '1 day ago',
    apiCalls: 320,
    color: 'bg-green-600'
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Cloud-based accounting software',
    category: 'accounting',
    icon: '📈',
    connected: false,
    configRequired: true,
    color: 'bg-blue-400'
  },
  {
    id: 'freshbooks',
    name: 'FreshBooks',
    description: 'Simple invoicing and expense tracking',
    category: 'accounting',
    icon: '🧾',
    connected: false,
    configRequired: true,
    color: 'bg-green-500'
  },

  // Calendar
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync schedules and appointments',
    category: 'calendar',
    icon: '📅',
    connected: true,
    configRequired: false,
    popular: true,
    lastSync: '5 minutes ago',
    apiCalls: 890,
    color: 'bg-blue-500'
  },
  {
    id: 'outlook-calendar',
    name: 'Outlook Calendar',
    description: 'Microsoft calendar integration',
    category: 'calendar',
    icon: '📆',
    connected: false,
    configRequired: true,
    color: 'bg-blue-600'
  },

  // Payment
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept online payments and manage subscriptions',
    category: 'payment',
    icon: '💳',
    connected: false,
    configRequired: true,
    popular: true,
    color: 'bg-purple-600'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Process payments via PayPal',
    category: 'payment',
    icon: '💸',
    connected: false,
    configRequired: true,
    color: 'bg-blue-700'
  },
  {
    id: 'square',
    name: 'Square',
    description: 'In-person and online payment processing',
    category: 'payment',
    icon: '⬜',
    connected: false,
    configRequired: true,
    color: 'bg-gray-700'
  }
];

const categories = [
  { id: 'all', name: 'All Integrations', count: integrations.length },
  { id: 'communication', name: 'Communication', count: integrations.filter(i => i.category === 'communication').length },
  { id: 'storage', name: 'Storage', count: integrations.filter(i => i.category === 'storage').length },
  { id: 'project-management', name: 'Project Management', count: integrations.filter(i => i.category === 'project-management').length },
  { id: 'accounting', name: 'Accounting', count: integrations.filter(i => i.category === 'accounting').length },
  { id: 'calendar', name: 'Calendar', count: integrations.filter(i => i.category === 'calendar').length },
  { id: 'payment', name: 'Payment', count: integrations.filter(i => i.category === 'payment').length },
];

export default function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [connectedFilter, setConnectedFilter] = useState<'all' | 'connected' | 'available'>('all');
  const { addToast } = useToast();

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesConnection = connectedFilter === 'all' ||
                             (connectedFilter === 'connected' && integration.connected) ||
                             (connectedFilter === 'available' && !integration.connected);
    
    return matchesSearch && matchesCategory && matchesConnection;
  });

  const connectedCount = integrations.filter(i => i.connected).length;
  const totalApiCalls = integrations.reduce((sum, i) => sum + (i.apiCalls || 0), 0);

  const handleConnect = (integration: Integration) => {
    if (integration.configRequired) {
      addToast(`Configuration required for ${integration.name}`, 'info');
    } else {
      addToast(`Connected to ${integration.name}`, 'success');
    }
  };

  const handleDisconnect = (integration: Integration) => {
    addToast(`Disconnected from ${integration.name}`, 'success');
  };

  return (
    <DashboardLayout title="Integrations" subtitle="Connect third-party services and tools">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Connected</p>
                <p className="text-2xl font-bold text-white">{connectedCount}</p>
              </div>
              <Zap className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Available</p>
                <p className="text-2xl font-bold text-white">{integrations.length - connectedCount}</p>
              </div>
              <ExternalLink className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">API Calls (24h)</p>
                <p className="text-2xl font-bold text-white">{totalApiCalls.toLocaleString()}</p>
              </div>
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Categories</p>
                <p className="text-2xl font-bold text-white">{categories.length - 1}</p>
              </div>
              <Filter className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Connection Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setConnectedFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  connectedFilter === 'all' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setConnectedFilter('connected')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  connectedFilter === 'connected' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                Connected
              </button>
              <button
                onClick={() => setConnectedFilter('available')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  connectedFilter === 'available' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                Available
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-gray-700 text-orange-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                {category.name}
                <span className="ml-2 text-sm text-gray-500">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Integrations */}
        {selectedCategory === 'all' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Popular Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {integrations.filter(i => i.popular).slice(0, 4).map((integration) => (
                <div key={integration.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{integration.icon}</span>
                    {integration.connected ? (
                      <span className="flex items-center text-green-500 text-sm">
                        <Check className="w-4 h-4 mr-1" />
                        Connected
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">Available</span>
                    )}
                  </div>
                  <h3 className="text-white font-medium mb-1">{integration.name}</h3>
                  <p className="text-gray-400 text-sm">{integration.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integrations Grid */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            {selectedCategory === 'all' ? 'All Integrations' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          
          {filteredIntegrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No integrations found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-orange-500 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${integration.color} rounded-lg flex items-center justify-center text-2xl`}>
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{integration.name}</h3>
                        {integration.connected && integration.lastSync && (
                          <p className="text-gray-500 text-xs">Last sync: {integration.lastSync}</p>
                        )}
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4">{integration.description}</p>

                  {/* Stats */}
                  {integration.connected && integration.apiCalls && (
                    <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">API Calls (24h)</span>
                        <span className="text-white font-medium">{integration.apiCalls.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {integration.connected ? (
                    <button
                      onClick={() => handleDisconnect(integration)}
                      className="w-full px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors flex items-center justify-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration)}
                      className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Integration Activity */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { integration: 'Google Calendar', action: 'Synced 15 events', time: '5 minutes ago', status: 'success' },
              { integration: 'Gmail', action: 'Sent 3 emails', time: '2 hours ago', status: 'success' },
              { integration: 'QuickBooks', action: 'Updated invoice #1234', time: '1 day ago', status: 'success' },
              { integration: 'Google Drive', action: 'Uploaded 2 documents', time: '2 days ago', status: 'success' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <span className="text-white font-medium">{activity.integration}</span>
                    <span className="text-gray-400 mx-2">•</span>
                    <span className="text-gray-400">{activity.action}</span>
                  </div>
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