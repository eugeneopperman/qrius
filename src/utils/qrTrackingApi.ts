// API client functions for QR code scan tracking

import type {
  TrackableQRCode,
  TrackableQRCodeWithStats,
  QRData,
} from '@/types';

export interface CreateTrackableQRRequest {
  destinationUrl: string;
  qrType?: string;
  originalData?: QRData;
}

export interface CreateTrackableQRResult {
  success: boolean;
  qrCode?: TrackableQRCode;
  error?: string;
}

export interface GetTrackableQRResult {
  success: boolean;
  qrCode?: TrackableQRCodeWithStats;
  error?: string;
}

/**
 * Get the API base URL from settings or default to same-origin
 */
function getApiBaseUrl(customBaseUrl?: string): string {
  if (customBaseUrl) {
    return customBaseUrl.replace(/\/$/, ''); // Remove trailing slash
  }
  // In development, use the current origin
  // In production, this will be the same origin as the app
  return '';
}

/**
 * Create a new trackable QR code
 * @param request The create request with destination URL and optional metadata
 * @param apiBaseUrl Optional custom API base URL
 * @returns The created trackable QR code or error
 */
export async function createTrackableQR(
  request: CreateTrackableQRRequest,
  apiBaseUrl?: string
): Promise<CreateTrackableQRResult> {
  const baseUrl = getApiBaseUrl(apiBaseUrl);

  try {
    const response = await fetch(`${baseUrl}/api/qr-codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination_url: request.destinationUrl,
        qr_type: request.qrType || 'url',
        original_data: request.originalData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as { error?: string }).error || `API error: ${response.status}`;
      return { success: false, error: errorMessage };
    }

    const data = await response.json();
    return { success: true, qrCode: data as TrackableQRCode };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create trackable QR code',
    };
  }
}

/**
 * Get a trackable QR code with stats
 * @param id The QR code ID
 * @param apiBaseUrl Optional custom API base URL
 * @returns The QR code with stats or error
 */
export async function getTrackableQR(
  id: string,
  apiBaseUrl?: string
): Promise<GetTrackableQRResult> {
  const baseUrl = getApiBaseUrl(apiBaseUrl);

  try {
    const response = await fetch(`${baseUrl}/api/qr-codes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'QR code not found' };
      }
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as { error?: string }).error || `API error: ${response.status}`;
      return { success: false, error: errorMessage };
    }

    const data = await response.json();
    return { success: true, qrCode: data as TrackableQRCodeWithStats };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch trackable QR code',
    };
  }
}

/**
 * List all trackable QR codes
 * @param options Pagination options
 * @param apiBaseUrl Optional custom API base URL
 * @returns List of QR codes with pagination info
 */
export async function listTrackableQRCodes(
  options?: { limit?: number; offset?: number },
  apiBaseUrl?: string
): Promise<{
  success: boolean;
  qrCodes?: TrackableQRCode[];
  pagination?: { total: number; limit: number; offset: number; hasMore: boolean };
  error?: string;
}> {
  const baseUrl = getApiBaseUrl(apiBaseUrl);
  const params = new URLSearchParams();

  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));

  try {
    const url = `${baseUrl}/api/qr-codes${params.toString() ? `?${params}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as { error?: string }).error || `API error: ${response.status}`;
      return { success: false, error: errorMessage };
    }

    const data = await response.json();
    return {
      success: true,
      qrCodes: data.qrCodes as TrackableQRCode[],
      pagination: data.pagination,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list trackable QR codes',
    };
  }
}
