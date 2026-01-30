import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HistoryEntry, QRCodeType, QRData, QRStyleOptions } from '../types';

const MAX_HISTORY_ENTRIES = 20;

interface HistoryStore {
  entries: HistoryEntry[];

  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  getEntry: (id: string) => HistoryEntry | undefined;

  updateThumbnail: (id: string, thumbnail: string) => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entry) => {
        const newEntry: HistoryEntry = {
          ...entry,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };

        set((state) => {
          // Add new entry at the beginning, limit to MAX_HISTORY_ENTRIES
          const updated = [newEntry, ...state.entries].slice(0, MAX_HISTORY_ENTRIES);
          return { entries: updated };
        });
      },

      removeEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },

      clearHistory: () => {
        set({ entries: [] });
      },

      getEntry: (id) => {
        return get().entries.find((entry) => entry.id === id);
      },

      updateThumbnail: (id, thumbnail) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, thumbnail } : entry
          ),
        }));
      },
    }),
    {
      name: 'qr-history-storage',
    }
  )
);

// Helper to get display label for a QR type
export function getTypeLabel(type: QRCodeType): string {
  const labels: Record<QRCodeType, string> = {
    url: 'URL',
    text: 'Text',
    email: 'Email',
    phone: 'Phone',
    sms: 'SMS',
    wifi: 'WiFi',
    vcard: 'vCard',
    event: 'Event',
    location: 'Location',
  };
  return labels[type];
}

// Helper to get a summary of the QR data
export function getDataSummary(data: QRData): string {
  switch (data.type) {
    case 'url':
      return data.data.url || 'Empty URL';
    case 'text':
      return data.data.text?.slice(0, 50) || 'Empty text';
    case 'email':
      return data.data.email || 'Empty email';
    case 'phone':
      return data.data.phone || 'Empty phone';
    case 'sms':
      return data.data.phone || 'Empty SMS';
    case 'wifi':
      return data.data.ssid || 'Empty SSID';
    case 'vcard':
      return `${data.data.firstName} ${data.data.lastName}`.trim() || 'Empty vCard';
    case 'event':
      return data.data.title || 'Empty event';
    case 'location':
      return data.data.latitude && data.data.longitude
        ? `${data.data.latitude}, ${data.data.longitude}`
        : 'Empty location';
    default:
      return 'Unknown';
  }
}
