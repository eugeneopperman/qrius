import { useState, useCallback } from 'react';
import {
  createTrackableQR,
  getTrackableQR,
  type CreateTrackableQRRequest,
} from '../utils/qrTrackingApi';
import { useSettingsStore } from '../stores/settingsStore';
import type { TrackableQRCode, TrackableQRCodeWithStats } from '../types';

interface UseQRTrackingResult {
  // Create a tracked QR code
  createTracked: (request: CreateTrackableQRRequest) => Promise<TrackableQRCode | null>;
  // Fetch a tracked QR code with stats
  fetchTracked: (id: string) => Promise<TrackableQRCodeWithStats | null>;
  // Loading state
  isLoading: boolean;
  // Error state
  error: string | null;
  // Clear error
  clearError: () => void;
  // Check if tracking is enabled in settings
  isTrackingEnabled: boolean;
  // The API base URL being used
  apiBaseUrl: string;
}

export function useQRTracking(): UseQRTrackingResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { trackingSettings } = useSettingsStore();

  const isTrackingEnabled = trackingSettings?.enabled ?? false;
  const apiBaseUrl = trackingSettings?.apiBaseUrl ?? '';

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createTracked = useCallback(
    async (request: CreateTrackableQRRequest): Promise<TrackableQRCode | null> => {
      if (!isTrackingEnabled) {
        setError('Tracking is not enabled');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await createTrackableQR(request, apiBaseUrl || undefined);

        if (result.success && result.qrCode) {
          return result.qrCode;
        }

        setError(result.error || 'Failed to create tracked QR code');
        return null;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isTrackingEnabled, apiBaseUrl]
  );

  const fetchTracked = useCallback(
    async (id: string): Promise<TrackableQRCodeWithStats | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getTrackableQR(id, apiBaseUrl || undefined);

        if (result.success && result.qrCode) {
          return result.qrCode;
        }

        setError(result.error || 'Failed to fetch tracked QR code');
        return null;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBaseUrl]
  );

  return {
    createTracked,
    fetchTracked,
    isLoading,
    error,
    clearError,
    isTrackingEnabled,
    apiBaseUrl,
  };
}
