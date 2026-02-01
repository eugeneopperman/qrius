import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '../themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useThemeStore.setState({
      theme: 'system',
      resolvedTheme: 'light',
    });
    // Clear dark class from document
    document.documentElement.classList.remove('dark');
  });

  describe('initial state', () => {
    it('defaults to system theme', () => {
      expect(useThemeStore.getState().theme).toBe('system');
    });
  });

  describe('setTheme', () => {
    it('sets theme to light', () => {
      useThemeStore.getState().setTheme('light');

      expect(useThemeStore.getState().theme).toBe('light');
      expect(useThemeStore.getState().resolvedTheme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('sets theme to dark and adds dark class', () => {
      useThemeStore.getState().setTheme('dark');

      expect(useThemeStore.getState().theme).toBe('dark');
      expect(useThemeStore.getState().resolvedTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('sets theme to system and resolves based on preference', () => {
      // Our mock matchMedia returns false for dark mode by default
      useThemeStore.getState().setTheme('system');

      expect(useThemeStore.getState().theme).toBe('system');
      expect(useThemeStore.getState().resolvedTheme).toBe('light');
    });
  });

  describe('toggleTheme', () => {
    it('toggles from light to dark', () => {
      useThemeStore.setState({ resolvedTheme: 'light' });

      useThemeStore.getState().toggleTheme();

      expect(useThemeStore.getState().theme).toBe('dark');
      expect(useThemeStore.getState().resolvedTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('toggles from dark to light', () => {
      useThemeStore.setState({ resolvedTheme: 'dark' });
      document.documentElement.classList.add('dark');

      useThemeStore.getState().toggleTheme();

      expect(useThemeStore.getState().theme).toBe('light');
      expect(useThemeStore.getState().resolvedTheme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});
