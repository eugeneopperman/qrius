import { useState, useCallback } from 'react';
import {
  shortenUrl,
  shortenWithRebrandly,
  shortenWithShortIo,
  type ShortenerProvider,
} from '../utils/urlShorteners';
import { useSettingsStore } from '../stores/settingsStore';
import type { BrandedUrlProvider } from '../types';

interface UseUrlShortenerResult {
  shorten: (url: string, customSlug?: string) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
  provider: ShortenerProvider;
  setProvider: (provider: ShortenerProvider) => void;
  brandedProvider: BrandedUrlProvider;
  isBrandedConfigured: boolean;
  brandedDomain: string | undefined;
}

export function useUrlShortener(): UseUrlShortenerResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<ShortenerProvider>('tinyurl');

  const { brandedUrlSettings } = useSettingsStore();

  // Check if branded provider is properly configured
  const isBrandedConfigured = (() => {
    if (brandedUrlSettings.provider === 'rebrandly') {
      return !!brandedUrlSettings.rebrandly?.apiKey;
    }
    if (brandedUrlSettings.provider === 'shortio') {
      return !!(brandedUrlSettings.shortio?.apiKey && brandedUrlSettings.shortio?.domain);
    }
    return false;
  })();

  // Get the branded domain if configured
  const brandedDomain = (() => {
    if (brandedUrlSettings.provider === 'rebrandly') {
      return brandedUrlSettings.rebrandly?.domain;
    }
    if (brandedUrlSettings.provider === 'shortio') {
      return brandedUrlSettings.shortio?.domain;
    }
    return undefined;
  })();

  const shorten = useCallback(
    async (url: string, customSlug?: string): Promise<string | null> => {
      if (!url) {
        setError('No URL provided');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try branded provider first if configured
        if (isBrandedConfigured) {
          let result;

          if (brandedUrlSettings.provider === 'rebrandly' && brandedUrlSettings.rebrandly) {
            result = await shortenWithRebrandly(url, brandedUrlSettings.rebrandly, customSlug);
          } else if (brandedUrlSettings.provider === 'shortio' && brandedUrlSettings.shortio) {
            result = await shortenWithShortIo(url, brandedUrlSettings.shortio, customSlug);
          }

          if (result?.success && result.shortUrl) {
            return result.shortUrl;
          }

          // If branded failed and fallback is disabled, return error
          if (!brandedUrlSettings.fallbackToGeneric) {
            setError(result?.error || 'Failed to create branded short URL');
            return null;
          }

          // Continue to fallback with generic provider
          console.warn('Branded URL shortening failed, falling back to generic:', result?.error);
        }

        // Use generic provider (TinyURL or is.gd)
        const result = await shortenUrl(url, provider);

        if (result.success && result.shortUrl) {
          return result.shortUrl;
        }

        setError(result.error || 'Failed to shorten URL');
        return null;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [provider, brandedUrlSettings, isBrandedConfigured]
  );

  return {
    shorten,
    isLoading,
    error,
    provider,
    setProvider,
    brandedProvider: brandedUrlSettings.provider,
    isBrandedConfigured,
    brandedDomain,
  };
}
