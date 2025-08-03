'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/dashboard-layout';
import { trpc } from '../../../providers/trpc-provider';
import { useToast } from '../../../components/Toast';
import ApiKeyModal from '../../../components/integrations/ApiKeyModal';
import WebhookModal from '../../../components/integrations/WebhookModal';
import IntegrationConfigModal from '../../../components/integrations/IntegrationConfigModal';
import GoogleCalendarConnect from '../../../components/integrations/GoogleCalendarConnect';
import { Copy, Check, Loader2, Plus, ExternalLink, Key, Webhook, Activity, BarChart3 } from 'lucide-react';

export default function IntegrationsPage() {
  const router = useRouter();
  const { addToast, ToastContainer } = useToast();
  const [organizationId, setOrganizationId] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  const [copiedKeys, setCopiedKeys] = useState<{ [key: string]: boolean }>({});

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

  // Fetch API keys
  const { data: apiKeys = [], isLoading: loadingKeys, refetch: refetchKeys } = trpc.apiKeys.getApiKeys.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  // Fetch webhooks
  const { data: webhooks = [], isLoading: loadingWebhooks, refetch: refetchWebhooks } = trpc.webhooks.getWebhooks.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  // Fetch available integrations
  const { data: availableIntegrations = [], isLoading: loadingIntegrations } = trpc.integrations.getAvailableIntegrations.useQuery({});

  // Fetch connected integrations
  const { data: connectedIntegrations = [], refetch: refetchConnected } = trpc.integrations.getOrganizationIntegrations.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  // Mutations
  const revokeKeyMutation = trpc.apiKeys.revokeApiKey.useMutation({
    onSuccess: () => {
      addToast('API key revoked successfully', 'success');
      refetchKeys();
    },
    onError: (error) => {
      addToast(error.message || 'Failed to revoke API key', 'error');
    },
  });

  const regenerateKeyMutation = trpc.apiKeys.regenerateApiKey.useMutation({
    onSuccess: (result) => {
      addToast('API key regenerated successfully', 'success');
      // Show the new key in a modal or copy to clipboard
      navigator.clipboard.writeText(result.apiKey.key);
      addToast('New key copied to clipboard', 'info');
      refetchKeys();
    },
    onError: (error) => {
      addToast(error.message || 'Failed to regenerate API key', 'error');
    },
  });

  const deleteWebhookMutation = trpc.webhooks.deleteWebhook.useMutation({
    onSuccess: () => {
      addToast('Webhook deleted successfully', 'success');
      refetchWebhooks();
    },
    onError: (error) => {
      addToast(error.message || 'Failed to delete webhook', 'error');
    },
  });

  const testWebhookMutation = trpc.webhooks.testWebhook.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        addToast('Webhook test successful', 'success');
      } else {
        addToast(result.message || 'Webhook test failed', 'error');
      }
    },
    onError: (error) => {
      addToast(error.message || 'Failed to test webhook', 'error');
    },
  });

  const disconnectIntegrationMutation = trpc.integrations.disconnectIntegration.useMutation({
    onSuccess: () => {
      addToast('Integration disconnected', 'success');
      refetchConnected();
    },
    onError: (error) => {
      addToast(error.message || 'Failed to disconnect integration', 'error');
    },
  });

  // Merge integrations with connection status
  const integrationsWithStatus = availableIntegrations.slice(0, 4).map(integration => {
    const connected = connectedIntegrations.find(c => c.integrationId === integration.id);
    return {
      ...integration,
      status: connected ? 'Connected' : 'Disconnected',
      lastSync: connected?.lastSyncAt ? new Date(connected.lastSyncAt).toLocaleString() : 'Never',
      isConnected: !!connected,
    };
  });

  const handleCopyKey = (keyPrefix: string) => {
    navigator.clipboard.writeText(keyPrefix);
    setCopiedKeys({ ...copiedKeys, [keyPrefix]: true });
    setTimeout(() => {
      setCopiedKeys(prev => ({ ...prev, [keyPrefix]: false }));
    }, 2000);
  };

  const handleRevokeKey = async (keyId: string) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      const user = localStorage.getItem('pulse_user');
      let userId = 'system';
      if (user) {
        try {
          const userData = JSON.parse(user);
          userId = userData.id || 'system';
        } catch (e) {}
      }
      
      await revokeKeyMutation.mutateAsync({
        organizationId,
        keyId,
        userId,
      });
    }
  };

  const handleRegenerateKey = async (keyId: string) => {
    if (confirm('Are you sure you want to regenerate this API key? The old key will be revoked.')) {
      const user = localStorage.getItem('pulse_user');
      let userId = 'system';
      if (user) {
        try {
          const userData = JSON.parse(user);
          userId = userData.id || 'system';
        } catch (e) {}
      }
      
      await regenerateKeyMutation.mutateAsync({
        organizationId,
        keyId,
        userId,
      });
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      await deleteWebhookMutation.mutateAsync({
        organizationId,
        webhookId,
      });
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    await testWebhookMutation.mutateAsync({
      organizationId,
      webhookId,
    });
  };

  const handleEditWebhook = (webhook: any) => {
    setSelectedWebhook(webhook);
    setShowWebhookModal(true);
  };

  const handleConnectIntegration = (integration: any) => {
    setSelectedIntegration(integration);
    setShowIntegrationModal(true);
  };

  const handleDisconnectIntegration = async (integrationId: string) => {
    if (confirm('Are you sure you want to disconnect this integration?')) {
      await disconnectIntegrationMutation.mutateAsync({
        organizationId,
        integrationId,
      });
    }
  };

  const handleBrowseAppStore = () => {
    router.push('/dashboard/integrations');
  };

  const isLoading = loadingKeys || loadingWebhooks || loadingIntegrations;

  return (
    <DashboardLayout title="API & Integrations" subtitle="External service connections, webhooks, and API management">
      <div className="space-y-8">
        {/* Google Calendar Quick Connect */}
        <GoogleCalendarConnect 
          organizationId={organizationId} 
          onSuccess={() => {
            refetchConnected();
            addToast('Google Calendar connected successfully', 'success');
          }}
        />
        {/* API Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{apiKeys.length}</p>
                <p className="text-gray-400 text-sm">API Keys</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <ExternalLink className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{connectedIntegrations.length}</p>
                <p className="text-gray-400 text-sm">Integrations</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Webhook className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{webhooks.length}</p>
                <p className="text-gray-400 text-sm">Webhooks</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">
                  {connectedIntegrations.reduce((sum, i) => sum + (i.totalApiCalls || 0), 0).toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm">API Calls Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Third-party Integrations */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Third-party Integrations</h2>
            <button 
              onClick={handleBrowseAppStore}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Browse App Store
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrationsWithStatus.map((integration, index) => (
                <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{integration.iconEmoji}</span>
                      <div>
                        <h3 className="text-white font-semibold">{integration.displayName}</h3>
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
                          <button 
                            onClick={() => handleConnectIntegration(integration)}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            Configure
                          </button>
                          <button 
                            onClick={() => handleDisconnectIntegration(integration.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleConnectIntegration(integration)}
                          className="text-green-500 hover:text-green-400"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Keys Management */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">API Keys</h2>
            <button 
              onClick={() => setShowApiKeyModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
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
                {apiKeys.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No API keys yet. Generate your first key to get started.
                    </td>
                  </tr>
                ) : (
                  apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{key.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <code className="bg-gray-900 px-2 py-1 rounded text-gray-300 text-sm font-mono">
                            {key.keyPrefix}
                          </code>
                          <button 
                            onClick={() => handleCopyKey(key.keyPrefix)}
                            className="ml-2 text-gray-400 hover:text-white"
                          >
                            {copiedKeys[key.keyPrefix] ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {new Date(key.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          key.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {key.isActive ? 'Active' : 'Revoked'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleRegenerateKey(key.id)}
                            disabled={!key.isActive}
                            className="text-orange-500 hover:text-orange-400 disabled:text-gray-500 disabled:cursor-not-allowed"
                          >
                            Regenerate
                          </button>
                          <button 
                            onClick={() => handleRevokeKey(key.id)}
                            disabled={!key.isActive}
                            className="text-red-500 hover:text-red-400 disabled:text-gray-500 disabled:cursor-not-allowed"
                          >
                            {key.isActive ? 'Revoke' : 'Revoked'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Webhooks */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Webhooks</h2>
            <button 
              onClick={() => {
                setSelectedWebhook(null);
                setShowWebhookModal(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
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
                {webhooks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No webhooks configured. Create your first webhook to receive real-time updates.
                    </td>
                  </tr>
                ) : (
                  webhooks.map((webhook) => (
                    <tr key={webhook.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{webhook.name}</td>
                      <td className="px-6 py-4">
                        <code className="bg-gray-900 px-2 py-1 rounded text-gray-300 text-sm font-mono max-w-xs truncate block">
                          {webhook.url}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.slice(0, 2).map((event: string, index: number) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {event}
                            </span>
                          ))}
                          {webhook.events.length > 2 && (
                            <span className="text-gray-400 text-xs">+{webhook.events.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          webhook.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {webhook.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditWebhook(webhook)}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleTestWebhook(webhook.id)}
                            disabled={testWebhookMutation.isLoading}
                            className="text-purple-500 hover:text-purple-400 disabled:text-gray-500"
                          >
                            Test
                          </button>
                          <button 
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
              <button 
                onClick={() => window.open('/api-docs', '_blank')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors"
              >
                View Documentation
              </button>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">GraphQL</h3>
              <p className="text-gray-400 text-sm mb-4">GraphQL schema and query examples</p>
              <button 
                onClick={() => window.open('/graphql', '_blank')}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition-colors"
              >
                Explore Schema
              </button>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">SDKs</h3>
              <p className="text-gray-400 text-sm mb-4">Client libraries for popular languages</p>
              <button 
                onClick={() => window.open('/sdks', '_blank')}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition-colors"
              >
                Download SDKs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showApiKeyModal && (
        <ApiKeyModal
          organizationId={organizationId}
          onClose={() => setShowApiKeyModal(false)}
          onSuccess={() => {
            refetchKeys();
            setShowApiKeyModal(false);
          }}
        />
      )}

      {showWebhookModal && (
        <WebhookModal
          organizationId={organizationId}
          webhook={selectedWebhook}
          onClose={() => {
            setShowWebhookModal(false);
            setSelectedWebhook(null);
          }}
          onSuccess={() => {
            refetchWebhooks();
            setShowWebhookModal(false);
            setSelectedWebhook(null);
          }}
        />
      )}

      {showIntegrationModal && selectedIntegration && (
        <IntegrationConfigModal
          integration={selectedIntegration}
          organizationId={organizationId}
          onClose={() => {
            setShowIntegrationModal(false);
            setSelectedIntegration(null);
          }}
          onSuccess={() => {
            refetchConnected();
            setShowIntegrationModal(false);
            setSelectedIntegration(null);
          }}
        />
      )}

      <ToastContainer />
    </DashboardLayout>
  );
}