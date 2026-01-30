import { useState, useCallback } from 'react';
import { shortenUrl, type ShortenerProvider } from '../utils/urlShorteners';

interface UseUrlShortenerResult {
  shorten: (url: string) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
  provider: ShortenerProvider;
  setProvider: (provider: ShortenerProvider) => void;
}

export function useUrlShortener(): UseUrlShortenerResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<ShortenerProvider>('tinyurl');

  const shorten = useCallback(
    async (url: string): Promise<string | null> => {
      if (!url) {
        setError('No URL provided');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
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
    [provider]
  );

  return {
    shorten,
    isLoading,
    error,
    provider,
    setProvider,
  };
}
