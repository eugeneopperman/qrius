import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'warm' | 'cool' | 'dark' | 'auto';
export type ResolvedTheme = 'warm' | 'cool' | 'dark';

export interface AutoSchedule {
  timezone: string;
  morningWarm: number;  // hour 0-23, default 6
  dayCool: number;      // default 9
  eveningWarm: number;  // default 17
  nightDark: number;    // default 20
}

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  autoSchedule: AutoSchedule;
  setTheme: (theme: ThemeMode) => void;
  cycleTheme: () => void;
  setAutoSchedule: (partial: Partial<AutoSchedule>) => void;
}

const THEME_COLORS: Record<ResolvedTheme, string> = {
  warm: '#f7e4d5',
  cool: '#dce4ed',
  dark: '#141413',
};

let autoInterval: ReturnType<typeof setInterval> | null = null;

function getDefaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

const DEFAULT_SCHEDULE: AutoSchedule = {
  timezone: getDefaultTimezone(),
  morningWarm: 6,
  dayCool: 9,
  eveningWarm: 17,
  nightDark: 20,
};

function applyTheme(resolved: ResolvedTheme) {
  const cl = document.documentElement.classList;
  cl.remove('dark', 'cool');
  if (resolved === 'dark') cl.add('dark');
  else if (resolved === 'cool') cl.add('cool');
  // warm = no class

  // Update meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[resolved]);
}

export function resolveAutoTheme(schedule: AutoSchedule): ResolvedTheme {
  let hour: number;
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: schedule.timezone,
      hour: 'numeric',
      hour12: false,
    });
    hour = parseInt(formatter.format(new Date()), 10);
    // Intl may return 24 for midnight in some locales
    if (hour === 24) hour = 0;
  } catch {
    hour = new Date().getHours();
  }

  const { morningWarm, dayCool, eveningWarm, nightDark } = schedule;

  // Four time windows (assuming morningWarm < dayCool < eveningWarm < nightDark):
  // [nightDark..24) and [0..morningWarm) → dark
  // [morningWarm..dayCool) → warm
  // [dayCool..eveningWarm) → cool
  // [eveningWarm..nightDark) → warm
  if (hour >= nightDark || hour < morningWarm) return 'dark';
  if (hour >= morningWarm && hour < dayCool) return 'warm';
  if (hour >= dayCool && hour < eveningWarm) return 'cool';
  return 'warm'; // eveningWarm..nightDark
}

function startAutoInterval() {
  stopAutoInterval();
  autoInterval = setInterval(() => {
    const state = useThemeStore.getState();
    if (state.theme !== 'auto') return;
    const resolved = resolveAutoTheme(state.autoSchedule);
    if (resolved !== state.resolvedTheme) {
      applyTheme(resolved);
      useThemeStore.setState({ resolvedTheme: resolved });
    }
  }, 60_000);
}

function stopAutoInterval() {
  if (autoInterval !== null) {
    clearInterval(autoInterval);
    autoInterval = null;
  }
}

function resolveAndApply(theme: ThemeMode, schedule: AutoSchedule): ResolvedTheme {
  const resolved = theme === 'auto' ? resolveAutoTheme(schedule) : theme;
  applyTheme(resolved);
  if (theme === 'auto') startAutoInterval();
  else stopAutoInterval();
  return resolved;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'warm',
      resolvedTheme: 'warm',
      autoSchedule: DEFAULT_SCHEDULE,

      setTheme: (theme) => {
        const schedule = get().autoSchedule;
        const resolved = resolveAndApply(theme, schedule);
        set({ theme, resolvedTheme: resolved });
      },

      cycleTheme: () => {
        const current = get().resolvedTheme;
        const next: ResolvedTheme =
          current === 'warm' ? 'cool' :
          current === 'cool' ? 'dark' : 'warm';
        applyTheme(next);
        stopAutoInterval();
        set({ theme: next, resolvedTheme: next });
      },

      setAutoSchedule: (partial) => {
        const current = get().autoSchedule;
        const updated = { ...current, ...partial };
        set({ autoSchedule: updated });
        if (get().theme === 'auto') {
          const resolved = resolveAutoTheme(updated);
          applyTheme(resolved);
          startAutoInterval();
          set({ resolvedTheme: resolved });
        }
      },
    }),
    {
      name: 'qr-generator-theme',
      version: 2,
      migrate: (persisted, version) => {
        if (version === 0 || version === 1) {
          const old = persisted as Record<string, unknown>;
          const oldTheme = old.theme as string | undefined;
          let newTheme: ThemeMode = 'warm';
          if (oldTheme === 'dark') newTheme = 'dark';
          else if (oldTheme === 'system') newTheme = 'auto';
          else if (oldTheme === 'light') newTheme = 'warm';
          return {
            ...old,
            theme: newTheme,
            resolvedTheme: newTheme === 'auto' ? 'warm' : newTheme === 'dark' ? 'dark' : 'warm',
            autoSchedule: DEFAULT_SCHEDULE,
          };
        }
        return persisted as ThemeState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = resolveAndApply(state.theme, state.autoSchedule);
          state.resolvedTheme = resolved;
        }
      },
    }
  )
);

// FOUC prevention: apply theme immediately from localStorage before React hydrates
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('qr-generator-theme');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const theme: ThemeMode = parsed.state?.theme || 'warm';
      const schedule: AutoSchedule = parsed.state?.autoSchedule || DEFAULT_SCHEDULE;
      const resolved = theme === 'auto' ? resolveAutoTheme(schedule) : theme === 'cool' ? 'cool' : theme === 'dark' ? 'dark' : 'warm';
      const cl = document.documentElement.classList;
      cl.remove('dark', 'cool');
      if (resolved === 'dark') cl.add('dark');
      else if (resolved === 'cool') cl.add('cool');
    } catch {
      // No flash — warm (default) has no class
    }
  }
}
