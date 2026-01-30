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
