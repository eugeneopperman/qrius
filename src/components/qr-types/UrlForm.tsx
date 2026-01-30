import { useState } from 'react';
import { useQRStore } from '../../stores/qrStore';
import { useUrlShortener } from '../../hooks/useUrlShortener';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Link, Shrink, Loader2, Check, AlertCircle, Copy } from 'lucide-react';
import { cn } from '../../utils/cn';

export function UrlForm() {
  const { urlData, setUrlData } = useQRStore();
  const { shorten, isLoading, error } = useUrlShortener();
  const [copied, setCopied] = useState(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setUrlData({ url, shortened: undefined, useShortened: false });
  };

  const handleUrlBlur = () => {
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
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeUrl = urlData.useShortened && urlData.shortened ? urlData.shortened : urlData.url;
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
        hint="Enter the full URL including https://"
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
                variant="secondary"
                size="sm"
                onClick={handleShorten}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Shortening...
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
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Check className="w-4 h-4" />
                <span className="font-medium">URL Shortened!</span>
                <span className="text-xs bg-green-200 dark:bg-green-800 px-2 py-0.5 rounded-full">
                  {characterReduction}% shorter
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={urlData.shortened}
                  readOnly
                  className="flex-1 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg px-3 py-2 text-sm font-mono"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyShortened}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
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
                  className="w-4 h-4 rounded border-green-400 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-green-700 dark:text-green-400">
                  Use shortened URL for QR code
                </span>
              </label>
            </div>
          )}

          {/* Active URL indicator */}
          <div
            className={cn(
              'p-3 rounded-lg text-sm',
              urlData.useShortened && urlData.shortened
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
            )}
          >
            <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
              QR Code will encode:
            </span>
            <p className="font-mono text-sm mt-1 break-all text-gray-900 dark:text-gray-100">
              {activeUrl || 'Enter a URL above'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
