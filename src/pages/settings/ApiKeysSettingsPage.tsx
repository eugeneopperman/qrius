import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { toast } from '@/stores/toastStore';
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from '@/hooks/queries/useApiKeys';
import {
  Loader2,
  Plus,
  Key,
  Copy,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';

export function ApiKeysSettingsContent() {
  const { currentRole, planLimits } = useAuthStore(useShallow((s) => ({ currentRole: s.currentRole, planLimits: s.planLimits })));
  const { data: apiKeys = [], isLoading } = useApiKeys();
  const createApiKey = useCreateApiKey();
  const deleteApiKey = useDeleteApiKey();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const canManageKeys = currentRole === 'owner' || currentRole === 'admin';
  const hasApiAccess = planLimits && planLimits.api_requests_per_day > 0;

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success('API key copied to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      await deleteApiKey.mutateAsync(keyId);
      toast.success('API key deleted');
    } catch {
      toast.error('Failed to delete API key');
    }
  };

  const handleCreateKey = async (name: string) => {
    try {
      const result = await createApiKey.mutateAsync(name);
      setNewKey(result.fullKey);
      toast.success('API key created');
    } catch {
      toast.error('Failed to create API key');
    }
  };

  if (!hasApiAccess) {
    return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h1>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Key className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            API Access Required
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Upgrade to Pro or Business to access the Qrius API and integrate QR code
            generation into your applications.
          </p>
          <Link to="/settings" search={{ tab: 'billing' }}>
            <Button>Upgrade to Pro</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage API keys for programmatic access
            </p>
          </div>
          {canManageKeys && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              Create API Key
            </Button>
          )}
        </div>
      </div>

      {/* Rate limit info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Your plan includes{' '}
          <strong>{planLimits?.api_requests_per_day.toLocaleString()}</strong> API requests per
          day.
        </p>
      </div>

      {/* New key display */}
      {newKey && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-800 dark:text-green-200 mb-2">
                Save your API key now - you won't be able to see it again!
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 rounded border border-green-300 dark:border-green-700 text-sm font-mono break-all">
                  {newKey}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopyKey(newKey)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <button
                onClick={() => setNewKey(null)}
                className="mt-2 text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                I've saved my key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API keys list */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Key className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No API keys yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Create an API key to integrate QR code generation into your applications.
            </p>
            {canManageKeys && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4" />
                Create your first API key
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{key.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {key.key_prefix}...
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-gray-500 dark:text-gray-400">
                        Created {new Date(key.created_at).toLocaleDateString()}
                      </p>
                      {key.last_used_at && (
                        <p className="text-gray-400 dark:text-gray-500">
                          Last used {new Date(key.last_used_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {canManageKeys && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteKey(key.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API documentation link */}
      <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          API Documentation
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Learn how to integrate Qrius into your applications with our comprehensive API
          documentation.
        </p>
        <Button variant="secondary">View Documentation</Button>
      </div>

      {/* Create key modal */}
      {showCreateModal && (
        <CreateKeyModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateKey}
        />
      )}
    </div>
  );
}

export default function ApiKeysSettingsPage() {
  return <ApiKeysSettingsContent />;
}

function CreateKeyModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    await onCreate(name);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Create API Key
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Key name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Production, Development"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Give your key a descriptive name to identify its purpose
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create key'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
