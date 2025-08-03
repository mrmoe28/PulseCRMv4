'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';
import { 
  Search, Filter, Check, X, Settings, ExternalLink, Zap, 
  ArrowRight, Activity, Shield, AlertCircle, TrendingUp,
  Clock, RefreshCw, ChevronRight, Star, Award, Sparkles,
  Link2, Workflow, Database, Globe, Lock, Unlock, 
  PlayCircle, PauseCircle, BarChart3, Cpu
} from 'lucide-react';
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
  rating?: number;
  users?: number;
  status?: 'active' | 'syncing' | 'error' | 'paused';
  features?: string[];
  automations?: number;
  dataPoints?: number;
  syncInterval?: string;
  new?: boolean;
  beta?: boolean;
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
    color: 'bg-red-500',
    rating: 4.8,
    users: 15420,
    status: 'active',
    features: ['Email sync', 'Auto-reply', 'Templates', 'Attachments'],
    automations: 5,
    dataPoints: 3420,
    syncInterval: 'Every 15 minutes'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Professional email delivery service for transactional emails',
    category: 'communication',
    icon: '📮',
    connected: false,
    configRequired: true,
    color: 'bg-blue-500',
    rating: 4.6,
    users: 8930,
    features: ['Bulk emails', 'Analytics', 'Templates', 'API access']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    category: 'communication',
    icon: '💬',
    connected: true,
    configRequired: false,
    popular: true,
    color: 'bg-purple-600',
    rating: 4.9,
    users: 12500,
    status: 'active',
    lastSync: '5 minutes ago',
    apiCalls: 890,
    features: ['Notifications', 'Channels', 'Direct messages', 'File sharing'],
    automations: 8,
    new: true
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS notifications and two-way messaging',
    category: 'communication',
    icon: '📱',
    connected: false,
    configRequired: true,
    popular: true,
    color: 'bg-red-600',
    rating: 4.5,
    users: 6750,
    features: ['SMS', 'Voice calls', 'WhatsApp', 'Verification']
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Community engagement and support channels',
    category: 'communication',
    icon: '🎮',
    connected: false,
    configRequired: true,
    color: 'bg-indigo-600',
    rating: 4.7,
    users: 3200,
    beta: true,
    features: ['Voice channels', 'Webhooks', 'Bots', 'Rich embeds']
  },

  // Storage & Documents
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
    color: 'bg-blue-600',
    rating: 4.7,
    users: 18900,
    status: 'active',
    features: ['File sync', 'Folders', 'Sharing', 'Version control'],
    dataPoints: 1250,
    syncInterval: 'Real-time'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Sync files and documents with Dropbox',
    category: 'storage',
    icon: '📦',
    connected: false,
    configRequired: false,
    color: 'bg-blue-700',
    rating: 4.5,
    users: 9870,
    features: ['File sync', 'Paper docs', 'Comments', 'Smart sync']
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Enterprise-grade cloud storage solution',
    category: 'storage',
    icon: '🗄️',
    connected: false,
    configRequired: true,
    color: 'bg-orange-600',
    rating: 4.3,
    users: 2450,
    features: ['Unlimited storage', 'CDN', 'Encryption', 'Lifecycle policies']
  },
  {
    id: 'docusign',
    name: 'DocuSign',
    description: 'Electronic signatures and document workflows',
    category: 'storage',
    icon: '✍️',
    connected: true,
    configRequired: true,
    color: 'bg-yellow-600',
    rating: 4.8,
    users: 7650,
    status: 'active',
    lastSync: '1 hour ago',
    features: ['E-signatures', 'Templates', 'Workflows', 'Audit trail'],
    automations: 3,
    new: true
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
    color: 'bg-blue-500',
    rating: 4.6,
    users: 11200,
    features: ['Boards', 'Cards', 'Checklists', 'Power-ups']
  },
  {
    id: 'asana',
    name: 'Asana',
    description: 'Project tracking and team collaboration',
    category: 'project-management',
    icon: '🎯',
    connected: false,
    configRequired: true,
    color: 'bg-pink-500',
    rating: 4.5,
    users: 8900,
    features: ['Tasks', 'Projects', 'Timeline', 'Portfolios']
  },
  {
    id: 'monday',
    name: 'Monday.com',
    description: 'Visual project management platform',
    category: 'project-management',
    icon: '📊',
    connected: false,
    configRequired: true,
    color: 'bg-purple-500',
    rating: 4.7,
    users: 6780,
    features: ['Boards', 'Automations', 'Dashboards', 'Apps']
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Agile project management and issue tracking',
    category: 'project-management',
    icon: '🔧',
    connected: false,
    configRequired: true,
    color: 'bg-blue-800',
    rating: 4.4,
    users: 4560,
    features: ['Sprints', 'Backlogs', 'Reports', 'Workflows']
  },

  // Accounting & Finance
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
    color: 'bg-green-600',
    rating: 4.6,
    users: 14300,
    status: 'syncing',
    features: ['Invoices', 'Expenses', 'Reports', 'Payroll'],
    dataPoints: 890,
    syncInterval: 'Daily'
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Cloud-based accounting software',
    category: 'accounting',
    icon: '📈',
    connected: false,
    configRequired: true,
    color: 'bg-blue-400',
    rating: 4.5,
    users: 7890,
    features: ['Bank feeds', 'Invoicing', 'Inventory', 'Projects']
  },
  {
    id: 'freshbooks',
    name: 'FreshBooks',
    description: 'Simple invoicing and expense tracking',
    category: 'accounting',
    icon: '🧾',
    connected: false,
    configRequired: true,
    color: 'bg-green-500',
    rating: 4.4,
    users: 5670,
    features: ['Time tracking', 'Proposals', 'Payments', 'Reports']
  },
  {
    id: 'wave',
    name: 'Wave',
    description: 'Free accounting software for small businesses',
    category: 'accounting',
    icon: '🌊',
    connected: false,
    configRequired: false,
    color: 'bg-cyan-600',
    rating: 4.3,
    users: 3450,
    features: ['Invoicing', 'Accounting', 'Receipts', 'Payments'],
    new: true
  },

  // Calendar & Scheduling
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
    color: 'bg-blue-500',
    rating: 4.8,
    users: 21000,
    status: 'active',
    features: ['Events', 'Reminders', 'Availability', 'Meeting rooms'],
    automations: 6,
    syncInterval: 'Real-time'
  },
  {
    id: 'outlook-calendar',
    name: 'Outlook Calendar',
    description: 'Microsoft calendar integration',
    category: 'calendar',
    icon: '📆',
    connected: false,
    configRequired: true,
    color: 'bg-blue-600',
    rating: 4.5,
    users: 9870,
    features: ['Events', 'Teams integration', 'Room booking', 'Delegates']
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Automated scheduling and booking',
    category: 'calendar',
    icon: '🗓️',
    connected: false,
    configRequired: true,
    color: 'bg-indigo-500',
    rating: 4.7,
    users: 6540,
    features: ['Booking pages', 'Round robin', 'Payments', 'Workflows'],
    new: true
  },

  // Payment Processing
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept online payments and manage subscriptions',
    category: 'payment',
    icon: '💳',
    connected: false,
    configRequired: true,
    popular: true,
    color: 'bg-purple-600',
    rating: 4.9,
    users: 16800,
    features: ['Payments', 'Subscriptions', 'Invoices', 'Fraud protection']
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Process payments via PayPal',
    category: 'payment',
    icon: '💸',
    connected: false,
    configRequired: true,
    color: 'bg-blue-700',
    rating: 4.4,
    users: 12300,
    features: ['Checkout', 'Subscriptions', 'Payouts', 'Disputes']
  },
  {
    id: 'square',
    name: 'Square',
    description: 'In-person and online payment processing',
    category: 'payment',
    icon: '⬜',
    connected: false,
    configRequired: true,
    color: 'bg-gray-700',
    rating: 4.6,
    users: 8900,
    features: ['POS', 'Online payments', 'Invoices', 'Inventory']
  },

  // Marketing & Analytics
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing and automation',
    category: 'marketing',
    icon: '🐵',
    connected: false,
    configRequired: true,
    color: 'bg-yellow-500',
    rating: 4.5,
    users: 10500,
    features: ['Campaigns', 'Automations', 'Analytics', 'A/B testing'],
    new: true
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Website traffic and conversion tracking',
    category: 'marketing',
    icon: '📊',
    connected: false,
    configRequired: true,
    color: 'bg-orange-500',
    rating: 4.7,
    users: 15600,
    features: ['Traffic analysis', 'Goals', 'E-commerce', 'Custom reports']
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'CRM and marketing automation platform',
    category: 'marketing',
    icon: '🎯',
    connected: false,
    configRequired: true,
    color: 'bg-orange-600',
    rating: 4.6,
    users: 7890,
    features: ['CRM', 'Marketing', 'Sales', 'Service'],
    beta: true
  }
];

const categories = [
  { id: 'all', name: 'All', icon: <Globe className="w-4 h-4" />, count: integrations.length },
  { id: 'communication', name: 'Communication', icon: <ExternalLink className="w-4 h-4" />, count: integrations.filter(i => i.category === 'communication').length },
  { id: 'storage', name: 'Storage', icon: <Database className="w-4 h-4" />, count: integrations.filter(i => i.category === 'storage').length },
  { id: 'project-management', name: 'Projects', icon: <Workflow className="w-4 h-4" />, count: integrations.filter(i => i.category === 'project-management').length },
  { id: 'accounting', name: 'Finance', icon: <BarChart3 className="w-4 h-4" />, count: integrations.filter(i => i.category === 'accounting').length },
  { id: 'calendar', name: 'Calendar', icon: <Clock className="w-4 h-4" />, count: integrations.filter(i => i.category === 'calendar').length },
  { id: 'payment', name: 'Payments', icon: <Zap className="w-4 h-4" />, count: integrations.filter(i => i.category === 'payment').length },
  { id: 'marketing', name: 'Marketing', icon: <TrendingUp className="w-4 h-4" />, count: integrations.filter(i => i.category === 'marketing').length },
];

// Workflow templates
const workflowTemplates = [
  {
    id: '1',
    name: 'New Job Automation',
    description: 'When a new job is created, notify team and create project boards',
    triggers: ['PulseCRM'],
    actions: ['Slack', 'Trello', 'Google Calendar'],
    uses: 234,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Invoice Workflow',
    description: 'Generate and send invoices when job is completed',
    triggers: ['PulseCRM'],
    actions: ['QuickBooks', 'Gmail', 'DocuSign'],
    uses: 189,
    rating: 4.9
  },
  {
    id: '3',
    name: 'Customer Onboarding',
    description: 'Automate new customer setup and welcome sequence',
    triggers: ['PulseCRM'],
    actions: ['Mailchimp', 'Slack', 'Google Drive'],
    uses: 156,
    rating: 4.7
  },
  {
    id: '4',
    name: 'Document Backup',
    description: 'Automatically backup signed documents to cloud storage',
    triggers: ['DocuSign'],
    actions: ['Google Drive', 'Dropbox', 'AWS S3'],
    uses: 98,
    rating: 4.6
  }
];

export default function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [connectedFilter, setConnectedFilter] = useState<'all' | 'connected' | 'available'>('all');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({ connected: 0, apiCalls: 0 });
  const { addToast, ToastContainer } = useToast();

  // Animate stats on mount
  useEffect(() => {
    const connectedCount = integrations.filter(i => i.connected).length;
    const totalApiCalls = integrations.reduce((sum, i) => sum + (i.apiCalls || 0), 0);
    
    const animateValue = (start: number, end: number, duration: number, setter: (val: number) => void) => {
      const startTime = Date.now();
      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.floor(start + (end - start) * progress);
        setter(value);
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    };

    animateValue(0, connectedCount, 1000, (val) => 
      setAnimatedStats(prev => ({ ...prev, connected: val }))
    );
    animateValue(0, totalApiCalls, 1500, (val) => 
      setAnimatedStats(prev => ({ ...prev, apiCalls: val }))
    );
  }, []);

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
  const activeAutomations = integrations.reduce((sum, i) => sum + (i.automations || 0), 0);

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    if (integration.configRequired) {
      setShowWizard(true);
    } else {
      addToast(`Connected to ${integration.name}`, 'success');
    }
  };

  const handleDisconnect = (integration: Integration) => {
    addToast(`Disconnected from ${integration.name}`, 'success');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'syncing': return 'bg-blue-500 animate-pulse';
      case 'error': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <DashboardLayout title="Integration Hub" subtitle="Connect, automate, and supercharge your workflow">
      <div className="space-y-6">
        {/* Hero Stats with Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Connected</p>
                <p className="text-3xl font-bold">{animatedStats.connected}</p>
                <p className="text-green-100 text-xs mt-1">Services active</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Link2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">API Calls</p>
                <p className="text-3xl font-bold">{animatedStats.apiCalls.toLocaleString()}</p>
                <p className="text-blue-100 text-xs mt-1">Last 24 hours</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Automations</p>
                <p className="text-3xl font-bold">{activeAutomations}</p>
                <p className="text-purple-100 text-xs mt-1">Running workflows</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Workflow className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Data Synced</p>
                <p className="text-3xl font-bold">42.3K</p>
                <p className="text-orange-100 text-xs mt-1">Records today</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Database className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Health Score</p>
                <p className="text-3xl font-bold">98%</p>
                <p className="text-pink-100 text-xs mt-1">All systems go</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Workflow Automation Center
              </h2>
              <p className="text-white/80 mt-1">Create powerful automations with visual workflow builder</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWorkflowBuilder(true)}
                className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Workflow className="w-5 h-5" />
                Build Workflow
              </button>
              <button className="px-6 py-3 bg-white/20 backdrop-blur text-white rounded-lg font-semibold hover:bg-white/30 transition-colors">
                View Templates
              </button>
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
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Connection Filter */}
            <div className="flex gap-2">
              {['all', 'connected', 'available'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setConnectedFilter(filter as any)}
                  className={`px-6 py-3 rounded-lg font-medium capitalize transition-all ${
                    connectedFilter === filter 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                      : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {filter === 'all' ? (
                    <>All <span className="ml-1 text-xs opacity-75">({integrations.length})</span></>
                  ) : filter === 'connected' ? (
                    <>Connected <span className="ml-1 text-xs opacity-75">({connectedCount})</span></>
                  ) : (
                    <>Available <span className="ml-1 text-xs opacity-75">({integrations.length - connectedCount})</span></>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                {category.icon}
                {category.name}
                <span className="text-xs opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Templates */}
        {selectedCategory === 'all' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Popular Workflow Templates
              </h2>
              <button className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                View all templates
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {workflowTemplates.map((template) => (
                <div key={template.id} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{template.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Trigger:</span>
                      <div className="flex -space-x-2">
                        {template.triggers.map((trigger, i) => (
                          <div key={i} className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-800">
                            {trigger[0]}
                          </div>
                        ))}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div className="flex -space-x-2">
                        {template.actions.slice(0, 3).map((action, i) => (
                          <div key={i} className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-800">
                            {action[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{template.uses} uses</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integrations Grid */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-orange-500" />
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
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  {/* Status Indicator */}
                  {integration.connected && (
                    <div className="absolute top-3 right-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(integration.status)}`} />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {integration.new && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                        NEW
                      </span>
                    )}
                    {integration.beta && (
                      <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full font-medium">
                        BETA
                      </span>
                    )}
                    {integration.popular && (
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-medium">
                        POPULAR
                      </span>
                    )}
                  </div>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 mt-8">
                    <div className="flex items-center space-x-3">
                      <div className={`w-14 h-14 ${integration.color} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold text-lg">{integration.name}</h3>
                        {integration.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < Math.floor(integration.rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {integration.rating} ({integration.users?.toLocaleString()})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {integration.description}
                  </p>

                  {/* Features */}
                  {integration.features && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {integration.features.slice(0, 3).map((feature, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                        {integration.features.length > 3 && (
                          <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                            +{integration.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  {integration.connected && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {integration.apiCalls && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">API Calls</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {integration.apiCalls.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {integration.dataPoints && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Data Points</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {integration.dataPoints.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {integration.syncInterval && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 col-span-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Sync Interval</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            {integration.syncInterval}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {integration.connected ? (
                      <>
                        <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium">
                          <Settings className="w-4 h-4" />
                          Configure
                        </button>
                        <button
                          onClick={() => handleDisconnect(integration)}
                          className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(integration)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium"
                      >
                        <Zap className="w-4 h-4" />
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time Activity Feed */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Live Activity Feed
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </h2>
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { integration: 'Google Calendar', action: 'Synced 15 events', time: 'Just now', status: 'success', icon: '📅' },
              { integration: 'Slack', action: 'Sent notification to #general', time: '2 minutes ago', status: 'success', icon: '💬' },
              { integration: 'Gmail', action: 'Sent invoice to client', time: '5 minutes ago', status: 'success', icon: '📧' },
              { integration: 'QuickBooks', action: 'Sync in progress...', time: 'Running', status: 'syncing', icon: '💰' },
              { integration: 'DocuSign', action: 'Document signed by John Doe', time: '1 hour ago', status: 'success', icon: '✍️' },
              { integration: 'Google Drive', action: 'Uploaded 3 documents', time: '2 hours ago', status: 'success', icon: '☁️' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' : 
                    activity.status === 'syncing' ? 'bg-blue-500 animate-pulse' : 
                    'bg-red-500'
                  }`} />
                  <span className="text-2xl">{activity.icon}</span>
                  <div>
                    <span className="text-gray-900 dark:text-white font-medium">{activity.integration}</span>
                    <span className="text-gray-500 dark:text-gray-400 mx-2">•</span>
                    <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>
                  </div>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {activity.status === 'syncing' ? (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      {activity.time}
                    </span>
                  ) : (
                    activity.time
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration Setup Wizard Modal */}
      {showWizard && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className={`w-12 h-12 ${selectedIntegration.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {selectedIntegration.icon}
                </div>
                Connect {selectedIntegration.name}
              </h2>
              <button
                onClick={() => setShowWizard(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {['Authenticate', 'Configure', 'Test', 'Complete'].map((step, idx) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      idx === 0 ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {idx + 1}
                    </div>
                    {idx < 3 && (
                      <div className={`w-full h-1 mx-2 ${
                        idx === 0 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Step 1: Authentication
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Connect your {selectedIntegration.name} account to enable data synchronization.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your API key"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      API Secret
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your API secret"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      You can find your API credentials in your {selectedIntegration.name} dashboard under Settings → API
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => setShowWizard(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  Cancel
                </button>
                <div className="flex gap-3">
                  <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
                    Back
                  </button>
                  <button
                    onClick={() => {
                      addToast(`Successfully connected to ${selectedIntegration.name}!`, 'success');
                      setShowWizard(false);
                    }}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Builder Modal */}
      {showWorkflowBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Workflow className="w-6 h-6 text-purple-500" />
                Visual Workflow Builder
              </h2>
              <button
                onClick={() => setShowWorkflowBuilder(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Workflow Builder Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Create powerful automations by connecting triggers and actions from your integrated services.
                  Drag and drop to build complex workflows without code.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </DashboardLayout>
  );
}