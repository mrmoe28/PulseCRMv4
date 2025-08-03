'use client';

import { useState } from 'react';
import { X, Copy, Check, AlertCircle, Key, Shield, Clock } from 'lucide-react';
import { trpc } from '../../providers/trpc-provider';

interface ApiKeyModalProps {
  organizationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApiKeyModal({ organizationId, onClose, onSuccess }: ApiKeyModalProps) {
  const [step, setStep] = useState<'config' | 'generated'>('config');
  const [generatedKey, setGeneratedKey] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    permissions: ['read'],
    rateLimitPerHour: 1000,
    expiresIn: 0, // 0 means never expires
  });

  const createKeyMutation = trpc.apiKeys.createApiKey.useMutation({
    onSuccess: (result) => {
      setGeneratedKey(result.apiKey.key);
      setStep('generated');
    },
  });

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

    await createKeyMutation.mutateAsync({
      organizationId,
      name: formData.name,
      permissions: formData.permissions,
      rateLimitPerHour: formData.rateLimitPerHour,
      expiresIn: formData.expiresIn || undefined,
      userId,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    if (step === 'generated') {
      onSuccess();
    }
    onClose();
  };

  const permissionOptions = [
    { value: 'read', label: 'Read', description: 'View data only' },
    { value: 'write', label: 'Write', description: 'Create and update data' },
    { value: 'delete', label: 'Delete', description: 'Remove data' },
    { value: 'admin', label: 'Admin', description: 'Full access' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {step === 'config' ? 'Generate API Key' : 'API Key Generated'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {step === 'config' ? 'Configure your new API key settings' : 'Save this key securely - you won\'t see it again'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 'config' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Key Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Production API Key"
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                A descriptive name to identify this key
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permissions
              </label>
              <div className="space-y-2">
                {permissionOptions.map((option) => (
                  <label key={option.value} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={formData.permissions.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, permissions: [...formData.permissions, option.value] });
                        } else {
                          setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== option.value) });
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rate Limit (requests per hour)
              </label>
              <select
                value={formData.rateLimitPerHour}
                onChange={(e) => setFormData({ ...formData, rateLimitPerHour: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="100">100 requests/hour</option>
                <option value="500">500 requests/hour</option>
                <option value="1000">1,000 requests/hour</option>
                <option value="5000">5,000 requests/hour</option>
                <option value="10000">10,000 requests/hour</option>
                <option value="50000">50,000 requests/hour</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiration
              </label>
              <select
                value={formData.expiresIn}
                onChange={(e) => setFormData({ ...formData, expiresIn: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="0">Never expires</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-400">
                <p className="font-medium">Security Notice</p>
                <p className="mt-1">API keys provide full access to your organization's data based on the permissions you grant. Keep them secure and never share them publicly.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.name || formData.permissions.length === 0 || createKeyMutation.isLoading}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate API Key
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">API key created successfully!</p>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  Copy and save this key now. For security reasons, you won't be able to see it again.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your API Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={generatedKey}
                  readOnly
                  className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700 dark:text-yellow-400">
                <p className="font-medium">Important</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Store this key in a secure location</li>
                  <li>Never commit API keys to version control</li>
                  <li>Rotate keys regularly for better security</li>
                  <li>You can revoke this key anytime from the settings</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}