import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BrandKit,
  QRStyleOptions,
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
  // Brand Kits
  brandKits: BrandKit[];
  addBrandKit: (name: string, style: Partial<QRStyleOptions>) => void;
  updateBrandKit: (id: string, updates: Partial<BrandKit>) => void;
  deleteBrandKit: (id: string) => void;
  getBrandKit: (id: string) => BrandKit | undefined;

  // Import/Export
  exportBrandKits: () => string;
  importBrandKits: (json: string) => boolean;

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
    (set, get) => ({
      brandKits: [],

      addBrandKit: (name, style) => {
        const newKit: BrandKit = {
          id: crypto.randomUUID(),
          name,
          createdAt: Date.now(),
          style,
        };
        set((state) => ({
          brandKits: [...state.brandKits, newKit],
        }));
      },

      updateBrandKit: (id, updates) => {
        set((state) => ({
          brandKits: state.brandKits.map((kit) =>
            kit.id === id ? { ...kit, ...updates } : kit
          ),
        }));
      },

      deleteBrandKit: (id) => {
        set((state) => ({
          brandKits: state.brandKits.filter((kit) => kit.id !== id),
        }));
      },

      getBrandKit: (id) => {
        return get().brandKits.find((kit) => kit.id === id);
      },

      exportBrandKits: () => {
        return JSON.stringify(get().brandKits, null, 2);
      },

      importBrandKits: (json) => {
        try {
          const kits = JSON.parse(json) as BrandKit[];
          if (!Array.isArray(kits)) return false;

          // Validate and add kits
          const validKits = kits.filter(
            (kit) =>
              typeof kit.id === 'string' &&
              typeof kit.name === 'string' &&
              typeof kit.style === 'object'
          );

          if (validKits.length === 0) return false;

          set((state) => ({
            brandKits: [
              ...state.brandKits,
              ...validKits.map((kit) => ({
                ...kit,
                id: crypto.randomUUID(), // Generate new IDs to avoid conflicts
                createdAt: Date.now(),
              })),
            ],
          }));

          return true;
        } catch {
          return false;
        }
      },

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
