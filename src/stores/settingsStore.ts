import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BrandKit, QRStyleOptions } from '../types';

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
    }),
    {
      name: 'qr-settings-storage',
    }
  )
);
