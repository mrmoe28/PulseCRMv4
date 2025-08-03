'use client';

import { useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { trpc } from '../../lib/trpc-client';

interface IntegrationConfigModalProps {
  integration: {
    id: string;
    displayName: string;
    description: string;
    authType: 'oauth2' | 'api_key' | 'basic';
    iconEmoji: string;
    color: string;
  };
  organizationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function IntegrationConfigModal({
  integration,
  organizationId,
  onClose,
  onSuccess,
}: IntegrationConfigModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
    syncInterval: '15',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (integration.authType === 'oauth2') {
        // Initiate OAuth flow
        const oauthUrl = `/api/oauth/${integration.id}/authorize?org=${organizationId}`;
        window.location.href = oauthUrl;
      } else if (integration.authType === 'api_key') {
        // Connect with API key
        await trpc.integrations.connectIntegration.mutate({
          organizationId,
          integrationId: integration.id,
          authType: 'api_key',
          credentials: {
            apiKey: formData.apiKey,
            apiSecret: formData.apiSecret || undefined,
          },
          config: {
            syncInterval: parseInt(formData.syncInterval),
            webhookUrl: formData.webhookUrl || undefined,
          },
        });
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect integration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await trpc.integrations.testIntegration.mutate({
        organizationId,
        integrationId: integration.id,
      });

      if (result.success) {
        setError(null);
      } else {
        setError(result.message || 'Connection test failed');
      }
    } catch (err: any) {
      setError(err.message || 'Connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${integration.color} rounded-xl flex items-center justify-center text-2xl`}>
              {integration.iconEmoji}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Connect {integration.displayName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {integration.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {integration.authType === 'oauth2' ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                OAuth Authentication
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You'll be redirected to {integration.displayName} to authorize the connection.
                Make sure you have admin access to your {integration.displayName} account.
              </p>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <CheckCircle className="w-5 h-5" />
                <span>Secure OAuth 2.0 authentication</span>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your API key"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Find your API key in {integration.displayName} settings
                </p>
              </div>

              {integration.id === 'sendgrid' || integration.id === 'stripe' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Secret
                  </label>
                  <input
                    type="password"
                    value={formData.apiSecret}
                    onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your API secret (if required)"
                  />
                </div>
              ) : null}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sync Interval (minutes)
            </label>
            <select
              value={formData.syncInterval}
              onChange={(e) => setFormData({ ...formData, syncInterval: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="5">Every 5 minutes</option>
              <option value="15">Every 15 minutes</option>
              <option value="30">Every 30 minutes</option>
              <option value="60">Every hour</option>
              <option value="360">Every 6 hours</option>
              <option value="1440">Daily</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Webhook URL (optional)
            </label>
            <input
              type="url"
              value={formData.webhookUrl}
              onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://your-domain.com/webhooks/integration"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Receive real-time updates when data changes
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              {integration.authType === 'api_key' && (
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={!formData.apiKey || isLoading}
                  className="px-6 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test Connection
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || (integration.authType === 'api_key' && !formData.apiKey)}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Integration'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}