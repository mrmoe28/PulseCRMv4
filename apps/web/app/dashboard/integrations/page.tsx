'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';
import { 
  Search, Filter, Check, X, Settings, ExternalLink, Zap, 
  ArrowRight, Activity, Shield, AlertCircle, TrendingUp,
  Clock, RefreshCw, ChevronRight, Star, Award, Sparkles,
  Link2, Workflow, Database, Globe, Lock, Unlock, 
  PlayCircle, PauseCircle, BarChart3, Cpu, Loader2
} from 'lucide-react';
import { useToast } from '../../../components/Toast';
import { trpc } from '../../../providers/trpc-provider';
import IntegrationConfigModal from '../../../components/integrations/IntegrationConfigModal';
import GoogleCalendarConnect from '../../../components/integrations/GoogleCalendarConnect';

interface Integration {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  iconEmoji: string;
  color: string;
  authType: 'oauth2' | 'api_key' | 'basic';
  features?: string[];
  isActive: boolean;
  isBeta?: boolean;
  isConnected?: boolean;
  lastSyncAt?: string;
  totalApiCalls?: number;
  config?: any;
}

const categories = [
  { id: 'all', name: 'All', icon: <Globe className="w-4 h-4" /> },
  { id: 'communication', name: 'Communication', icon: <ExternalLink className="w-4 h-4" /> },
  { id: 'storage', name: 'Storage', icon: <Database className="w-4 h-4" /> },
  { id: 'project-management', name: 'Projects', icon: <Workflow className="w-4 h-4" /> },
  { id: 'accounting', name: 'Finance', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'calendar', name: 'Calendar', icon: <Clock className="w-4 h-4" /> },
  { id: 'payment', name: 'Payments', icon: <Zap className="w-4 h-4" /> },
  { id: 'marketing', name: 'Marketing', icon: <TrendingUp className="w-4 h-4" /> },
];

export default function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [connectedFilter, setConnectedFilter] = useState<'all' | 'connected' | 'available'>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [organizationId, setOrganizationId] = useState<string>('');
  const { addToast, ToastContainer } = useToast();

  // Get organization ID from localStorage
  useEffect(() => {
    const user = localStorage.getItem('pulse_user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setOrganizationId(userData.organizationId || userData.organization?.id || 'default');
      } catch (e) {
        setOrganizationId('default');
      }
    }
  }, []);

  // Fetch available integrations
  const { data: availableIntegrations = [], isLoading: loadingAvailable } = trpc.integrations.getAvailableIntegrations.useQuery({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: searchTerm || undefined,
  });

  // Fetch organization's connected integrations
  const { data: connectedIntegrations = [], isLoading: loadingConnected, refetch: refetchConnected } = 
    trpc.integrations.getOrganizationIntegrations.useQuery({
      organizationId,
    }, {
      enabled: !!organizationId,
    });

  // Connect integration mutation
  const connectMutation = trpc.integrations.connectIntegration.useMutation({
    onSuccess: () => {
      addToast('Integration connected successfully', 'success');
      refetchConnected();
      setShowConfigModal(false);
    },
    onError: (error) => {
      addToast(error.message || 'Failed to connect integration', 'error');
    },
  });

  // Disconnect integration mutation
  const disconnectMutation = trpc.integrations.disconnectIntegration.useMutation({
    onSuccess: () => {
      addToast('Integration disconnected', 'success');
      refetchConnected();
    },
    onError: (error) => {
      addToast(error.message || 'Failed to disconnect integration', 'error');
    },
  });

  // Test integration mutation
  const testMutation = trpc.integrations.testIntegration.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        addToast('Connection test successful', 'success');
      } else {
        addToast(result.message || 'Connection test failed', 'error');
      }
    },
    onError: (error) => {
      addToast(error.message || 'Connection test failed', 'error');
    },
  });

  // Sync integration mutation
  const syncMutation = trpc.integrations.syncIntegration.useMutation({
    onSuccess: (result) => {
      addToast(`Synced ${result.recordsSynced} records successfully`, 'success');
      refetchConnected();
    },
    onError: (error) => {
      addToast(error.message || 'Sync failed', 'error');
    },
  });

  // Merge available and connected integrations
  const integrations: Integration[] = availableIntegrations.map(integration => {
    const connected = connectedIntegrations.find(c => c.integrationId === integration.id);
    return {
      ...integration,
      isConnected: !!connected,
      lastSyncAt: connected?.lastSyncAt,
      totalApiCalls: connected?.totalApiCalls,
      config: connected?.config,
    };
  });

  const filteredIntegrations = integrations.filter(integration => {
    const matchesConnection = connectedFilter === 'all' ||
                             (connectedFilter === 'connected' && integration.isConnected) ||
                             (connectedFilter === 'available' && !integration.isConnected);
    return matchesConnection;
  });

  const connectedCount = integrations.filter(i => i.isConnected).length;
  const totalApiCalls = connectedIntegrations.reduce((sum, i) => sum + (i.totalApiCalls || 0), 0);

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConfigModal(true);
  };

  const handleDisconnect = async (integration: Integration) => {
    if (confirm(`Are you sure you want to disconnect ${integration.displayName}?`)) {
      await disconnectMutation.mutateAsync({
        organizationId,
        integrationId: integration.id,
      });
    }
  };

  const handleTest = async (integration: Integration) => {
    await testMutation.mutateAsync({
      organizationId,
      integrationId: integration.id,
    });
  };

  const handleSync = async (integration: Integration) => {
    await syncMutation.mutateAsync({
      organizationId,
      integrationId: integration.id,
    });
  };

  const isLoading = loadingAvailable || loadingConnected;

  return (
    <DashboardLayout title="Integration Hub" subtitle="Connect, automate, and supercharge your workflow">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Connected</p>
                <p className="text-3xl font-bold">{connectedCount}</p>
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
                <p className="text-3xl font-bold">{totalApiCalls.toLocaleString()}</p>
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
                <p className="text-purple-100 text-sm">Available</p>
                <p className="text-3xl font-bold">{availableIntegrations.length}</p>
                <p className="text-purple-100 text-xs mt-1">Integrations</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Workflow className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Health Score</p>
                <p className="text-3xl font-bold">98%</p>
                <p className="text-orange-100 text-xs mt-1">All systems go</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Featured Integration - Google Calendar */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-1">
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Featured Integration</h2>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">NEW</span>
              </div>
            </div>
            <GoogleCalendarConnect 
              organizationId={organizationId}
              onSuccess={() => {
                refetchConnected();
                addToast('Google Calendar connected successfully', 'success');
              }}
            />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row gap-4">
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
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => {
              const count = category.id === 'all' 
                ? integrations.length 
                : integrations.filter(i => i.category === category.id).length;
              
              return (
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
                  <span className="text-xs opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-orange-500" />
            {selectedCategory === 'all' ? 'All Integrations' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : filteredIntegrations.length === 0 ? (
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
                  {integration.isConnected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {integration.isBeta && (
                      <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full font-medium">
                        BETA
                      </span>
                    )}
                  </div>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 mt-8">
                    <div className="flex items-center space-x-3">
                      <div className={`w-14 h-14 ${integration.color} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                        {integration.iconEmoji}
                      </div>
                      <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold text-lg">
                          {integration.displayName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {integration.authType === 'oauth2' ? 'OAuth 2.0' : 'API Key'}
                        </p>
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
                  {integration.isConnected && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">API Calls</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {(integration.totalApiCalls || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Last Sync</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleTimeString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {integration.isConnected ? (
                      <>
                        <button 
                          onClick={() => handleSync(integration)}
                          disabled={syncMutation.isLoading}
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${syncMutation.isLoading ? 'animate-spin' : ''}`} />
                          Sync
                        </button>
                        <button 
                          onClick={() => handleTest(integration)}
                          disabled={testMutation.isLoading}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Test
                        </button>
                        <button
                          onClick={() => handleDisconnect(integration)}
                          disabled={disconnectMutation.isLoading}
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
      </div>

      {/* Integration Config Modal */}
      {showConfigModal && selectedIntegration && (
        <IntegrationConfigModal
          integration={selectedIntegration}
          organizationId={organizationId}
          onClose={() => setShowConfigModal(false)}
          onSuccess={() => {
            refetchConnected();
            setShowConfigModal(false);
          }}
        />
      )}

      <ToastContainer />
    </DashboardLayout>
  );
}