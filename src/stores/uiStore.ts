import { create } from 'zustand';

interface UIState {
  isShortcutsOpen: boolean;
  isSettingsOpen: boolean;

  openShortcuts: () => void;
  closeShortcuts: () => void;
  openSettings: () => void;
  closeSettings: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isShortcutsOpen: false,
  isSettingsOpen: false,

  openShortcuts: () => set({ isShortcutsOpen: true }),
  closeShortcuts: () => set({ isShortcutsOpen: false }),
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
}));
