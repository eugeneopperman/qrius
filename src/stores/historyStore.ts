import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HistoryEntry, QRCodeType, QRData } from '@/types';

const MAX_HISTORY_ENTRIES = 20;
const UNDO_TIMEOUT_MS = 10000; // 10 seconds to undo

interface HistoryStore {
  entries: HistoryEntry[];
  _clearedEntries: HistoryEntry[] | null;
  _undoTimeoutId: number | null;

  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  undoClear: () => boolean;
  canUndo: () => boolean;
  getEntry: (id: string) => HistoryEntry | undefined;

  updateThumbnail: (id: string, thumbnail: string) => void;
  updateEntry: (id: string, updates: Partial<HistoryEntry>) => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      entries: [],
      _clearedEntries: null,
      _undoTimeoutId: null,

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
        const state = get();

        // Clear any existing undo timeout
        if (state._undoTimeoutId) {
          clearTimeout(state._undoTimeoutId);
        }

        // Store current entries for undo
        const clearedEntries = [...state.entries];

        // Set timeout to clear the undo buffer
        const timeoutId = window.setTimeout(() => {
          set({ _clearedEntries: null, _undoTimeoutId: null });
        }, UNDO_TIMEOUT_MS);

        set({
          entries: [],
          _clearedEntries: clearedEntries,
          _undoTimeoutId: timeoutId,
        });
      },

      undoClear: () => {
        const state = get();
        if (!state._clearedEntries) return false;

        // Clear the undo timeout
        if (state._undoTimeoutId) {
          clearTimeout(state._undoTimeoutId);
        }

        set({
          entries: state._clearedEntries,
          _clearedEntries: null,
          _undoTimeoutId: null,
        });

        return true;
      },

      canUndo: () => {
        return get()._clearedEntries !== null;
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

      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        }));
      },
    }),
    {
      name: 'qr-history-storage',
      partialize: (state) => ({ entries: state.entries }), // Only persist entries
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
