import { useState, useCallback } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import { Button } from '../ui/Button';
import {
  Link2,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { shortenWithRebrandly, shortenWithShortIo } from '../../utils/urlShorteners';
import type { BrandedUrlProvider } from '../../types';

const providerOptions = [
  { value: 'none', label: 'None (use generic shorteners)' },
  { value: 'rebrandly', label: 'Rebrandly' },
  { value: 'shortio', label: 'Short.io' },
];

interface TestResult {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
  shortUrl?: string;
}

export function BrandedUrlSettings() {
  const {
    brandedUrlSettings,
    setBrandedUrlProvider,
    setRebrandlyConfig,
    setShortIoConfig,
    setFallbackToGeneric,
  } = useSettingsStore();

  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<TestResult>({ status: 'idle' });

  const handleProviderChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setBrandedUrlProvider(e.target.value as BrandedUrlProvider);
      setTestResult({ status: 'idle' });
    },
    [setBrandedUrlProvider]
  );

  const handleTestConnection = useCallback(async () => {
    setTestResult({ status: 'testing' });

    const testUrl = 'https://example.com/test-branded-url-' + Date.now();

    try {
      let result;

      if (brandedUrlSettings.provider === 'rebrandly' && brandedUrlSettings.rebrandly) {
        result = await shortenWithRebrandly(testUrl, brandedUrlSettings.rebrandly);
      } else if (brandedUrlSettings.provider === 'shortio' && brandedUrlSettings.shortio) {
        result = await shortenWithShortIo(testUrl, brandedUrlSettings.shortio);
      } else {
        setTestResult({ status: 'error', message: 'No provider configured' });
        return;
      }

      if (result.success && result.shortUrl) {
        setTestResult({
          status: 'success',
          message: 'Connection successful!',
          shortUrl: result.shortUrl,
        });
      } else {
        setTestResult({
          status: 'error',
          message: result.error || 'Failed to create test link',
        });
      }
    } catch (err) {
      setTestResult({
        status: 'error',
        message: err instanceof Error ? err.message : 'Connection failed',
      });
    }
  }, [brandedUrlSettings]);

  const isConfigured = (() => {
    if (brandedUrlSettings.provider === 'rebrandly') {
      return !!brandedUrlSettings.rebrandly?.apiKey;
    }
    if (brandedUrlSettings.provider === 'shortio') {
      return !!(brandedUrlSettings.shortio?.apiKey && brandedUrlSettings.shortio?.domain);
    }
    return false;
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <Link2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Branded Short URLs
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Use your own custom domain for shortened URLs
          </p>
        </div>
      </div>

      {/* Provider Selection */}
      <Select
        label="URL Shortening Provider"
        options={providerOptions}
        value={brandedUrlSettings.provider}
        onChange={handleProviderChange}
      />

      {/* Rebrandly Configuration */}
      {brandedUrlSettings.provider === 'rebrandly' && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Rebrandly Configuration
            </h4>
            <a
              href="https://app.rebrandly.com/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Get API Key
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <Input
              label="API Key"
              type={showApiKey ? 'text' : 'password'}
              value={brandedUrlSettings.rebrandly?.apiKey || ''}
              onChange={(e) => setRebrandlyConfig({ apiKey: e.target.value })}
              placeholder="Enter your Rebrandly API key"
              hint="Required. Found in your Rebrandly account settings."
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Input
            label="Custom Domain"
            type="text"
            value={brandedUrlSettings.rebrandly?.domain || ''}
            onChange={(e) => setRebrandlyConfig({ domain: e.target.value })}
            placeholder="e.g., acme.link"
            hint="Optional. Leave empty to use rebrand.ly domain."
          />

          <Input
            label="Workspace ID"
            type="text"
            value={brandedUrlSettings.rebrandly?.workspaceId || ''}
            onChange={(e) => setRebrandlyConfig({ workspaceId: e.target.value })}
            placeholder="Optional workspace ID"
            hint="Optional. Only needed for team workspaces."
          />
        </div>
      )}

      {/* Short.io Configuration */}
      {brandedUrlSettings.provider === 'shortio' && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Short.io Configuration
            </h4>
            <a
              href="https://short.io/features/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Get API Key
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <Input
              label="API Key"
              type={showApiKey ? 'text' : 'password'}
              value={brandedUrlSettings.shortio?.apiKey || ''}
              onChange={(e) => setShortIoConfig({ apiKey: e.target.value })}
              placeholder="Enter your Short.io API key"
              hint="Required. Found in your Short.io account integrations."
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Input
            label="Domain"
            type="text"
            value={brandedUrlSettings.shortio?.domain || ''}
            onChange={(e) => setShortIoConfig({ domain: e.target.value })}
            placeholder="e.g., acme.link"
            hint="Required. Your custom domain registered with Short.io."
          />
        </div>
      )}

      {/* Fallback Toggle */}
      {brandedUrlSettings.provider !== 'none' && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <Toggle
            checked={brandedUrlSettings.fallbackToGeneric}
            onChange={setFallbackToGeneric}
            label="Fallback to generic shorteners"
            description="If branded URL creation fails, use TinyURL or is.gd instead"
          />
        </div>
      )}

      {/* Test Connection */}
      {brandedUrlSettings.provider !== 'none' && (
        <div className="space-y-3">
          <Button
            onClick={handleTestConnection}
            disabled={!isConfigured || testResult.status === 'testing'}
            variant="secondary"
          >
            {testResult.status === 'testing' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>

          {/* Test Result */}
          {testResult.status === 'success' && (
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {testResult.message}
                </p>
                {testResult.shortUrl && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-mono mt-1">
                    Test URL: {testResult.shortUrl}
                  </p>
                )}
              </div>
            </div>
          )}

          {testResult.status === 'error' && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Connection Failed
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {testResult.message}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div
        className={cn(
          'p-4 rounded-lg border text-sm',
          'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        )}
      >
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          About Branded Short URLs
        </h4>
        <ul className="space-y-1 text-blue-700 dark:text-blue-300 list-disc list-inside">
          <li>Branded URLs like <code className="text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded">acme.link/promo</code> increase trust and click-through rates</li>
          <li>You need an account with Rebrandly or Short.io</li>
          <li>Custom domains require DNS configuration on the provider's platform</li>
          <li>API keys are stored locally in your browser</li>
        </ul>
      </div>
    </div>
  );
}
