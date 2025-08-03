'use client';

import { useState } from 'react';
import { X, Plus, Trash2, AlertCircle, Webhook, Copy, Check, TestTube } from 'lucide-react';
import { trpc } from '../../providers/trpc-provider';

interface WebhookModalProps {
  organizationId: string;
  webhook?: any; // For editing existing webhook
  onClose: () => void;
  onSuccess: () => void;
}

export default function WebhookModal({ organizationId, webhook, onClose, onSuccess }: WebhookModalProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [formData, setFormData] = useState({
    name: webhook?.name || '',
    url: webhook?.url || '',
    events: webhook?.events || [],
    headers: webhook?.headers || {},
    isActive: webhook?.isActive ?? true,
    retryOnFailure: webhook?.retryOnFailure ?? true,
    maxRetries: webhook?.maxRetries || 3,
    timeoutSeconds: webhook?.timeoutSeconds || 30,
  });
  const [customHeader, setCustomHeader] = useState({ key: '', value: '' });
  const [webhookSecret, setWebhookSecret] = useState('');

  // Fetch available events
  const { data: eventData } = trpc.webhooks.getAvailableEvents.useQuery();

  // Create webhook mutation
  const createMutation = trpc.webhooks.createWebhook.useMutation({
    onSuccess: (result) => {
      setWebhookSecret(result.webhook.secret);
      setShowSecret(true);
    },
  });

  // Update webhook mutation
  const updateMutation = trpc.webhooks.updateWebhook.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  // Test webhook mutation
  const testMutation = trpc.webhooks.testWebhook.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = localStorage.getItem('pulse_user');
    let userId = 'system';
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        userId = userData.id || 'system';
      } catch (e) {}
    }

    if (webhook) {
      // Update existing webhook
      await updateMutation.mutateAsync({
        organizationId,
        webhookId: webhook.id,
        updates: formData,
      });
    } else {
      // Create new webhook
      await createMutation.mutateAsync({
        organizationId,
        ...formData,
        userId,
      });
    }
  };

  const handleAddHeader = () => {
    if (customHeader.key && customHeader.value) {
      setFormData({
        ...formData,
        headers: { ...formData.headers, [customHeader.key]: customHeader.value },
      });
      setCustomHeader({ key: '', value: '' });
    }
  };

  const handleRemoveHeader = (key: string) => {
    const newHeaders = { ...formData.headers };
    delete newHeaders[key];
    setFormData({ ...formData, headers: newHeaders });
  };

  const handleEventToggle = (event: string) => {
    if (formData.events.includes(event)) {
      setFormData({
        ...formData,
        events: formData.events.filter(e => e !== event),
      });
    } else {
      setFormData({
        ...formData,
        events: [...formData.events, event],
      });
    }
  };

  const handleTestWebhook = async () => {
    if (webhook) {
      const result = await testMutation.mutateAsync({
        organizationId,
        webhookId: webhook.id,
      });
      
      alert(result.success ? 'Webhook test successful!' : 'Webhook test failed: ' + result.message);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(webhookSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleClose = () => {
    if (showSecret) {
      onSuccess();
    }
    onClose();
  };

  if (showSecret) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Webhook Created Successfully
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Save the webhook secret below for payload verification
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Webhook Secret
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={webhookSecret}
                  readOnly
                  className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleCopySecret}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {copiedSecret ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Use this secret to verify webhook payloads using HMAC-SHA256
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Verification:</strong> All webhook payloads include an X-Webhook-Signature header with the HMAC-SHA256 signature of the payload using this secret.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Webhook className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {webhook ? 'Edit Webhook' : 'Create Webhook'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Receive real-time notifications when events occur
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Webhook Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Job Updates"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Webhook URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://your-domain.com/webhooks/pulsecr"
              required
            />
          </div>

          {/* Events Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Events <span className="text-red-500">*</span>
            </label>
            {eventData?.categories.map((category) => (
              <div key={category.id} className="mb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                  {category.name}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {eventData.events
                    .filter(e => e.resource === category.id)
                    .map((event) => (
                      <label key={event.id} className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.events.includes(event.id)}
                          onChange={() => handleEventToggle(event.id)}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {event.action}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Headers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Headers
            </label>
            <div className="space-y-2">
              {Object.entries(formData.headers).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={key}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={value as string}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveHeader(key)}
                    className="p-2 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customHeader.key}
                  onChange={(e) => setCustomHeader({ ...customHeader, key: e.target.value })}
                  placeholder="Header name"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="text"
                  value={customHeader.value}
                  onChange={(e) => setCustomHeader({ ...customHeader, value: e.target.value })}
                  placeholder="Header value"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddHeader}
                  disabled={!customHeader.key || !customHeader.value}
                  className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Retry on Failure
              </label>
              <select
                value={formData.retryOnFailure ? 'yes' : 'no'}
                onChange={(e) => setFormData({ ...formData, retryOnFailure: e.target.value === 'yes' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Retries
              </label>
              <input
                type="number"
                value={formData.maxRetries}
                onChange={(e) => setFormData({ ...formData, maxRetries: parseInt(e.target.value) })}
                min="0"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeout (seconds)
              </label>
              <input
                type="number"
                value={formData.timeoutSeconds}
                onChange={(e) => setFormData({ ...formData, timeoutSeconds: parseInt(e.target.value) })}
                min="5"
                max="60"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {webhook && (
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={testMutation.isLoading}
                  className="px-6 py-2 border border-purple-500 text-purple-500 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-2"
                >
                  <TestTube className="w-4 h-4" />
                  Test Webhook
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.name || !formData.url || formData.events.length === 0 || createMutation.isLoading || updateMutation.isLoading}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {webhook ? 'Update Webhook' : 'Create Webhook'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}