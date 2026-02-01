import type { RebrandlyConfig, ShortIoConfig } from '../types';

export interface ShortenResult {
  success: boolean;
  shortUrl?: string;
  error?: string;
}

export async function shortenWithTinyUrl(url: string): Promise<ShortenResult> {
  try {
    const response = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      throw new Error('TinyURL API error');
    }

    const shortUrl = await response.text();

    if (shortUrl.startsWith('http')) {
      return { success: true, shortUrl };
    }

    throw new Error('Invalid response from TinyURL');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to shorten URL',
    };
  }
}

export async function shortenWithIsGd(url: string): Promise<ShortenResult> {
  try {
    const response = await fetch(
      `https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      throw new Error('is.gd API error');
    }

    const shortUrl = await response.text();

    if (shortUrl.startsWith('http')) {
      return { success: true, shortUrl };
    }

    throw new Error('Invalid response from is.gd');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to shorten URL',
    };
  }
}

export type ShortenerProvider = 'tinyurl' | 'isgd';
export type BrandedShortenerProvider = 'rebrandly' | 'shortio';

// Rebrandly API integration
// Docs: https://developers.rebrandly.com/docs/api-endpoints
export async function shortenWithRebrandly(
  url: string,
  config: RebrandlyConfig,
  customSlug?: string
): Promise<ShortenResult> {
  if (!config.apiKey) {
    return { success: false, error: 'Rebrandly API key is required' };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': config.apiKey,
    };

    if (config.workspaceId) {
      headers['workspace'] = config.workspaceId;
    }

    const body: Record<string, unknown> = {
      destination: url,
    };

    if (config.domain) {
      body.domain = { fullName: config.domain };
    }

    if (customSlug) {
      body.slashtag = customSlug;
    }

    const response = await fetch('https://api.rebrandly.com/v1/links', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as { message?: string }).message || `Rebrandly API error: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json() as { shortUrl?: string };

    if (data.shortUrl) {
      return { success: true, shortUrl: data.shortUrl };
    }

    throw new Error('Invalid response from Rebrandly');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to shorten URL with Rebrandly',
    };
  }
}

// Short.io API integration
// Docs: https://developers.short.io/reference/linkspost
export async function shortenWithShortIo(
  url: string,
  config: ShortIoConfig,
  customSlug?: string
): Promise<ShortenResult> {
  if (!config.apiKey) {
    return { success: false, error: 'Short.io API key is required' };
  }

  if (!config.domain) {
    return { success: false, error: 'Short.io domain is required' };
  }

  try {
    const body: Record<string, unknown> = {
      originalURL: url,
      domain: config.domain,
    };

    if (customSlug) {
      body.path = customSlug;
    }

    const response = await fetch('https://api.short.io/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': config.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as { error?: string }).error || `Short.io API error: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json() as { shortURL?: string };

    if (data.shortURL) {
      return { success: true, shortUrl: data.shortURL };
    }

    throw new Error('Invalid response from Short.io');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to shorten URL with Short.io',
    };
  }
}

export async function shortenUrl(
  url: string,
  provider: ShortenerProvider = 'tinyurl'
): Promise<ShortenResult> {
  // Validate URL
  try {
    new URL(url);
  } catch {
    return { success: false, error: 'Invalid URL' };
  }

  switch (provider) {
    case 'tinyurl':
      return shortenWithTinyUrl(url);
    case 'isgd':
      return shortenWithIsGd(url);
    default:
      return { success: false, error: 'Unknown provider' };
  }
}
