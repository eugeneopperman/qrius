import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BrandedUrlSettings,
  BrandedUrlProvider,
  RebrandlyConfig,
  ShortIoConfig,
  TrackingSettings,
} from '../types';

const defaultBrandedUrlSettings: BrandedUrlSettings = {
  provider: 'none',
  fallbackToGeneric: true,
};

const defaultTrackingSettings: TrackingSettings = {
  enabled: false,
  apiBaseUrl: '',
};

interface SettingsStore {
  // Branded URL Settings
  brandedUrlSettings: BrandedUrlSettings;
  setBrandedUrlProvider: (provider: BrandedUrlProvider) => void;
  setRebrandlyConfig: (config: Partial<RebrandlyConfig>) => void;
  setShortIoConfig: (config: Partial<ShortIoConfig>) => void;
  setFallbackToGeneric: (fallback: boolean) => void;
  clearBrandedUrlSettings: () => void;

  // QR Code Tracking Settings
  trackingSettings: TrackingSettings;
  setTrackingEnabled: (enabled: boolean) => void;
  setTrackingApiBaseUrl: (url: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // Branded URL Settings
      brandedUrlSettings: defaultBrandedUrlSettings,

      setBrandedUrlProvider: (provider) => {
        set((state) => ({
          brandedUrlSettings: { ...state.brandedUrlSettings, provider },
        }));
      },

      setRebrandlyConfig: (config) => {
        set((state) => ({
          brandedUrlSettings: {
            ...state.brandedUrlSettings,
            rebrandly: {
              apiKey: '',
              ...state.brandedUrlSettings.rebrandly,
              ...config,
            },
          },
        }));
      },

      setShortIoConfig: (config) => {
        set((state) => ({
          brandedUrlSettings: {
            ...state.brandedUrlSettings,
            shortio: {
              apiKey: '',
              domain: '',
              ...state.brandedUrlSettings.shortio,
              ...config,
            },
          },
        }));
      },

      setFallbackToGeneric: (fallback) => {
        set((state) => ({
          brandedUrlSettings: {
            ...state.brandedUrlSettings,
            fallbackToGeneric: fallback,
          },
        }));
      },

      clearBrandedUrlSettings: () => {
        set({ brandedUrlSettings: defaultBrandedUrlSettings });
      },

      // QR Code Tracking Settings
      trackingSettings: defaultTrackingSettings,

      setTrackingEnabled: (enabled) => {
        set((state) => ({
          trackingSettings: { ...state.trackingSettings, enabled },
        }));
      },

      setTrackingApiBaseUrl: (url) => {
        set((state) => ({
          trackingSettings: { ...state.trackingSettings, apiBaseUrl: url },
        }));
      },
    }),
    {
      name: 'qr-settings-storage',
    }
  )
);
