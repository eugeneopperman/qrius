import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore, resolveAutoTheme } from '../themeStore';
import type { AutoSchedule } from '../themeStore';

const DEFAULT_SCHEDULE: AutoSchedule = {
  timezone: 'UTC',
  morningWarm: 6,
  dayCool: 9,
  eveningWarm: 17,
  nightDark: 20,
};

describe('themeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({
      theme: 'warm',
      resolvedTheme: 'warm',
      autoSchedule: DEFAULT_SCHEDULE,
    });
    document.documentElement.classList.remove('dark', 'cool');
    // Ensure a meta theme-color element exists
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', '#f7e4d5');
      document.head.appendChild(meta);
    }
  });

  describe('setTheme', () => {
    it('sets warm — no classes, resolvedTheme is warm', () => {
      useThemeStore.getState().setTheme('warm');
      expect(useThemeStore.getState().theme).toBe('warm');
      expect(useThemeStore.getState().resolvedTheme).toBe('warm');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.classList.contains('cool')).toBe(false);
    });

    it('sets cool — .cool class, no .dark', () => {
      useThemeStore.getState().setTheme('cool');
      expect(useThemeStore.getState().theme).toBe('cool');
      expect(useThemeStore.getState().resolvedTheme).toBe('cool');
      expect(document.documentElement.classList.contains('cool')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('sets dark — .dark class, no .cool', () => {
      useThemeStore.getState().setTheme('dark');
      expect(useThemeStore.getState().theme).toBe('dark');
      expect(useThemeStore.getState().resolvedTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('cool')).toBe(false);
    });

    it('cleans up classes when switching dark → cool', () => {
      useThemeStore.getState().setTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      useThemeStore.getState().setTheme('cool');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.classList.contains('cool')).toBe(true);
    });

    it('cleans up classes when switching cool → warm', () => {
      useThemeStore.getState().setTheme('cool');
      expect(document.documentElement.classList.contains('cool')).toBe(true);

      useThemeStore.getState().setTheme('warm');
      expect(document.documentElement.classList.contains('cool')).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('cycleTheme', () => {
    it('cycles warm → cool → dark → warm', () => {
      useThemeStore.setState({ resolvedTheme: 'warm' });

      useThemeStore.getState().cycleTheme();
      expect(useThemeStore.getState().theme).toBe('cool');
      expect(useThemeStore.getState().resolvedTheme).toBe('cool');

      useThemeStore.getState().cycleTheme();
      expect(useThemeStore.getState().theme).toBe('dark');
      expect(useThemeStore.getState().resolvedTheme).toBe('dark');

      useThemeStore.getState().cycleTheme();
      expect(useThemeStore.getState().theme).toBe('warm');
      expect(useThemeStore.getState().resolvedTheme).toBe('warm');
    });

    it('applies correct classes at each step', () => {
      useThemeStore.setState({ resolvedTheme: 'warm' });

      useThemeStore.getState().cycleTheme(); // → cool
      expect(document.documentElement.classList.contains('cool')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      useThemeStore.getState().cycleTheme(); // → dark
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('cool')).toBe(false);

      useThemeStore.getState().cycleTheme(); // → warm
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.classList.contains('cool')).toBe(false);
    });
  });

  describe('resolveAutoTheme', () => {
    const schedule = DEFAULT_SCHEDULE;

    it('returns dark for night hours (22)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-25T22:00:00Z'));
      expect(resolveAutoTheme(schedule)).toBe('dark');
      vi.useRealTimers();
    });

    it('returns dark for early morning (3)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-25T03:00:00Z'));
      expect(resolveAutoTheme(schedule)).toBe('dark');
      vi.useRealTimers();
    });

    it('returns warm for morning golden hour (7)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-25T07:00:00Z'));
      expect(resolveAutoTheme(schedule)).toBe('warm');
      vi.useRealTimers();
    });

    it('returns cool for daytime (12)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-25T12:00:00Z'));
      expect(resolveAutoTheme(schedule)).toBe('cool');
      vi.useRealTimers();
    });

    it('returns warm for evening golden hour (18)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-25T18:00:00Z'));
      expect(resolveAutoTheme(schedule)).toBe('warm');
      vi.useRealTimers();
    });

    it('returns correct theme at exact boundaries', () => {
      vi.useFakeTimers();

      // Exactly at morningWarm (6) → warm
      vi.setSystemTime(new Date('2026-02-25T06:00:00Z'));
      expect(resolveAutoTheme(schedule)).toBe('warm');

      // Exactly at dayCool (9) → cool
      vi.setSystemTime(new Date('2026-02-25T09:00:00Z'));
      expect(resolveAutoTheme(schedule)).toBe('cool');

      // Exactly at eveningWarm (17) → warm
      vi.setSystemTime(new Date('2026-02-25T17:00:00Z'));
      expect(resolveAutoTheme(schedule)).toBe('warm');

      // Exactly at nightDark (20) → dark
      vi.setSystemTime(new Date('2026-02-25T20:00:00Z'));
      expect(resolveAutoTheme(schedule)).toBe('dark');

      vi.useRealTimers();
    });

    it('returns dark at midnight (0)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-25T00:00:00Z'));
      expect(resolveAutoTheme(schedule)).toBe('dark');
      vi.useRealTimers();
    });
  });

  describe('setAutoSchedule', () => {
    it('updates schedule values', () => {
      useThemeStore.getState().setAutoSchedule({ morningWarm: 5, nightDark: 21 });
      const s = useThemeStore.getState().autoSchedule;
      expect(s.morningWarm).toBe(5);
      expect(s.nightDark).toBe(21);
      // Unchanged values preserved
      expect(s.dayCool).toBe(9);
      expect(s.eveningWarm).toBe(17);
    });

    it('re-resolves when in auto mode', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-25T08:00:00Z'));

      useThemeStore.getState().setTheme('auto');
      // Default schedule: 8am → warm
      expect(useThemeStore.getState().resolvedTheme).toBe('warm');

      // Change morningWarm to 9, dayCool to 7 → 8am is now in cool range
      useThemeStore.getState().setAutoSchedule({ morningWarm: 5, dayCool: 7 });
      expect(useThemeStore.getState().resolvedTheme).toBe('cool');

      vi.useRealTimers();
    });
  });

  describe('meta theme-color', () => {
    it('updates meta tag for warm', () => {
      useThemeStore.getState().setTheme('warm');
      const meta = document.querySelector('meta[name="theme-color"]');
      expect(meta?.getAttribute('content')).toBe('#f7e4d5');
    });

    it('updates meta tag for cool', () => {
      useThemeStore.getState().setTheme('cool');
      const meta = document.querySelector('meta[name="theme-color"]');
      expect(meta?.getAttribute('content')).toBe('#dce4ed');
    });

    it('updates meta tag for dark', () => {
      useThemeStore.getState().setTheme('dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      expect(meta?.getAttribute('content')).toBe('#141413');
    });
  });

  describe('persist migration', () => {
    it('migrates light → warm', () => {
      // Simulate old persisted state
      localStorage.setItem('qr-generator-theme', JSON.stringify({
        state: { theme: 'light', resolvedTheme: 'light' },
        version: 0,
      }));
      // Force rehydration
      useThemeStore.persist.rehydrate();
      expect(useThemeStore.getState().theme).toBe('warm');
    });

    it('migrates system → auto', () => {
      localStorage.setItem('qr-generator-theme', JSON.stringify({
        state: { theme: 'system', resolvedTheme: 'light' },
        version: 0,
      }));
      useThemeStore.persist.rehydrate();
      expect(useThemeStore.getState().theme).toBe('auto');
    });

    it('migrates dark → dark', () => {
      localStorage.setItem('qr-generator-theme', JSON.stringify({
        state: { theme: 'dark', resolvedTheme: 'dark' },
        version: 0,
      }));
      useThemeStore.persist.rehydrate();
      expect(useThemeStore.getState().theme).toBe('dark');
    });
  });
});
