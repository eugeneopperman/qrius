import { useState, useRef, useEffect } from 'react';
import { useQRStore } from '../../stores/qrStore';
import { useUrlShortener } from '../../hooks/useUrlShortener';
import { useQRTracking } from '../../hooks/useQRTracking';
import { useSettingsStore } from '../../stores/settingsStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { Link, Shrink, Loader2, Check, AlertCircle, Copy, Link2, Sparkles, BarChart3 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { validateUrl } from '../../utils/validators';
import { useFormField } from '../../hooks/useFormField';

export function UrlForm() {
  const { urlData, setUrlData } = useQRStore();
  const { shorten, isLoading, error, isBrandedConfigured, brandedDomain } = useUrlShortener();
  const { createTracked, isLoading: isTrackingLoading, error: trackingError } = useQRTracking();
  const { trackingSettings } = useSettingsStore();
  const [copied, setCopied] = useState(false);
  const [trackingCopied, setTrackingCopied] = useState(false);
  const urlField = useFormField(urlData.url, validateUrl);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackingCopiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
      if (trackingCopiedTimeoutRef.current) {
        clearTimeout(trackingCopiedTimeoutRef.current);
      }
    };
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setUrlData({
      url,
      shortened: undefined,
      useShortened: false,
      trackingUrl: undefined,
      trackingId: undefined,
      trackingShortCode: undefined,
    });
  };

  const handleUrlBlur = () => {
    urlField.handleBlur();
    let url = urlData.url.trim();
    if (url && !url.match(/^https?:\/\//i) && !url.startsWith('//')) {
      url = 'https://' + url;
      setUrlData({ url });
    }
  };

  const handleShorten = async () => {
    if (!urlData.url) return;

    const shortUrl = await shorten(urlData.url);
    if (shortUrl) {
      setUrlData({ shortened: shortUrl, useShortened: true });
    }
  };

  const handleToggleShortened = () => {
    setUrlData({ useShortened: !urlData.useShortened });
  };

  const handleCopyShortened = async () => {
    if (urlData.shortened) {
      await navigator.clipboard.writeText(urlData.shortened);
      setCopied(true);
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleTracking = async (enabled: boolean) => {
    if (!enabled) {
      // Disable tracking - clear tracking data
      setUrlData({
        trackingEnabled: false,
        trackingUrl: undefined,
        trackingId: undefined,
        trackingShortCode: undefined,
      });
      return;
    }

    // Enable tracking - create trackable QR code
    if (!urlData.url) return;

    const result = await createTracked({
      destinationUrl: urlData.url,
      qrType: 'url',
    });

    if (result) {
      setUrlData({
        trackingEnabled: true,
        trackingUrl: result.trackingUrl,
        trackingId: result.id,
        trackingShortCode: result.shortCode,
      });
    }
  };

  const handleCopyTrackingUrl = async () => {
    if (urlData.trackingUrl) {
      await navigator.clipboard.writeText(urlData.trackingUrl);
      setTrackingCopied(true);
      if (trackingCopiedTimeoutRef.current) {
        clearTimeout(trackingCopiedTimeoutRef.current);
      }
      trackingCopiedTimeoutRef.current = setTimeout(() => setTrackingCopied(false), 2000);
    }
  };

  // Determine the active URL - tracking URL takes priority, then shortened, then original
  const activeUrl = urlData.trackingEnabled && urlData.trackingUrl
    ? urlData.trackingUrl
    : urlData.useShortened && urlData.shortened
      ? urlData.shortened
      : urlData.url;

  const characterReduction = urlData.shortened
    ? Math.round((1 - urlData.shortened.length / urlData.url.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Link className="w-5 h-5" />
        <h3 className="font-medium">Website URL</h3>
      </div>

      <Input
        label="Enter URL"
        type="url"
        value={urlData.url}
        onChange={handleUrlChange}
        onBlur={handleUrlBlur}
        placeholder="https://example.com"
        hint={urlField.isValid ? "Enter the full URL including https://" : undefined}
        error={urlField.error}
      />

      {urlData.url && (
        <>
          {/* URL Stats */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              <span className="font-medium">Characters:</span> {urlData.url.length}
            </span>

            {!urlData.shortened && urlData.url.length > 30 && (
              <Button
                variant={isBrandedConfigured ? 'primary' : 'secondary'}
                size="sm"
                onClick={handleShorten}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Shortening...
                  </>
                ) : isBrandedConfigured ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {brandedDomain ? `Shorten to ${brandedDomain}` : 'Create Branded URL'}
                  </>
                ) : (
                  <>
                    <Shrink className="w-4 h-4" />
                    Shorten URL
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Shortened URL Result */}
          {urlData.shortened && (
            <div className={cn(
              'p-4 rounded-lg space-y-3 border',
              isBrandedConfigured && urlData.shortened.includes(brandedDomain || '')
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            )}>
              <div className={cn(
                'flex items-center gap-2',
                isBrandedConfigured && urlData.shortened.includes(brandedDomain || '')
                  ? 'text-indigo-700 dark:text-indigo-400'
                  : 'text-green-700 dark:text-green-400'
              )}>
                {isBrandedConfigured && urlData.shortened.includes(brandedDomain || '') ? (
                  <Link2 className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {isBrandedConfigured && urlData.shortened.includes(brandedDomain || '')
                    ? 'Branded URL Created!'
                    : 'URL Shortened!'}
                </span>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  isBrandedConfigured && urlData.shortened.includes(brandedDomain || '')
                    ? 'bg-indigo-200 dark:bg-indigo-800'
                    : 'bg-green-200 dark:bg-green-800'
                )}>
                  {characterReduction}% shorter
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={urlData.shortened}
                  readOnly
                  className={cn(
                    'flex-1 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm font-mono border',
                    isBrandedConfigured && urlData.shortened.includes(brandedDomain || '')
                      ? 'border-indigo-300 dark:border-indigo-700'
                      : 'border-green-300 dark:border-green-700'
                  )}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyShortened}
                >
                  {copied ? (
                    <Check className={cn(
                      'w-4 h-4',
                      isBrandedConfigured && urlData.shortened.includes(brandedDomain || '')
                        ? 'text-indigo-500'
                        : 'text-green-500'
                    )} />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={urlData.useShortened}
                  onChange={handleToggleShortened}
                  className={cn(
                    'w-4 h-4 rounded',
                    isBrandedConfigured && urlData.shortened.includes(brandedDomain || '')
                      ? 'border-indigo-400 text-indigo-600 focus:ring-indigo-500'
                      : 'border-green-400 text-green-600 focus:ring-green-500'
                  )}
                />
                <span className={cn(
                  'text-sm',
                  isBrandedConfigured && urlData.shortened.includes(brandedDomain || '')
                    ? 'text-indigo-700 dark:text-indigo-400'
                    : 'text-green-700 dark:text-green-400'
                )}>
                  Use {isBrandedConfigured && urlData.shortened.includes(brandedDomain || '') ? 'branded' : 'shortened'} URL for QR code
                </span>
              </label>
            </div>
          )}

          {/* Scan Tracking Section */}
          {trackingSettings?.enabled && (
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Scan Tracking
                  </span>
                </div>
                <Toggle
                  checked={urlData.trackingEnabled || false}
                  onChange={handleToggleTracking}
                  disabled={isTrackingLoading || !urlData.url}
                  size="sm"
                />
              </div>

              {isTrackingLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating trackable link...
                </div>
              )}

              {trackingError && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  {trackingError}
                </div>
              )}

              {urlData.trackingEnabled && urlData.trackingUrl && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-400">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">Tracking Enabled</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50">
                      {urlData.trackingShortCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={urlData.trackingUrl}
                      readOnly
                      className="flex-1 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm font-mono border border-purple-300 dark:border-purple-700"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyTrackingUrl}
                    >
                      {trackingCopied ? (
                        <Check className="w-4 h-4 text-purple-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This QR code will redirect through our tracking system. View scan analytics in History.
                  </p>
                </div>
              )}

              {!urlData.trackingEnabled && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enable tracking to see how many times your QR code is scanned.
                </p>
              )}
            </div>
          )}

          {/* Active URL indicator */}
          <div
            className={cn(
              'p-3 rounded-lg text-sm',
              urlData.trackingEnabled && urlData.trackingUrl
                ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                : urlData.useShortened && urlData.shortened
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                QR Code will encode:
              </span>
              {urlData.trackingEnabled && urlData.trackingUrl && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300">
                  Tracked
                </span>
              )}
            </div>
            <p className="font-mono text-sm mt-1 break-all text-gray-900 dark:text-gray-100">
              {activeUrl || 'Enter a URL above'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
