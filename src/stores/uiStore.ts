import { create } from 'zustand';

interface UIState {
  isShortcutsOpen: boolean;
  isHistoryOpen: boolean;
  isSettingsOpen: boolean;

  openShortcuts: () => void;
  closeShortcuts: () => void;
  openHistory: () => void;
  closeHistory: () => void;
  openSettings: () => void;
  closeSettings: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isShortcutsOpen: false,
  isHistoryOpen: false,
  isSettingsOpen: false,

  openShortcuts: () => set({ isShortcutsOpen: true }),
  closeShortcuts: () => set({ isShortcutsOpen: false }),
  openHistory: () => set({ isHistoryOpen: true }),
  closeHistory: () => set({ isHistoryOpen: false }),
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
}));
