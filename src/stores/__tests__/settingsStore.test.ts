import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '../settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    // Reset store state
    useSettingsStore.setState({
      autosaveEnabled: true,
      brandedUrlSettings: {
        provider: 'none',
        fallbackToGeneric: true,
      },
      trackingSettings: {
        enabled: false,
        apiBaseUrl: '',
      },
    });
  });

  describe('autosave', () => {
    it('defaults autosaveEnabled to true', () => {
      expect(useSettingsStore.getState().autosaveEnabled).toBe(true);
    });

    it('toggles autosaveEnabled to false', () => {
      useSettingsStore.getState().setAutosaveEnabled(false);
      expect(useSettingsStore.getState().autosaveEnabled).toBe(false);
    });

    it('toggles autosaveEnabled back to true', () => {
      useSettingsStore.getState().setAutosaveEnabled(false);
      useSettingsStore.getState().setAutosaveEnabled(true);
      expect(useSettingsStore.getState().autosaveEnabled).toBe(true);
    });
  });

  describe('branded URL settings', () => {
    it('defaults to no provider', () => {
      expect(useSettingsStore.getState().brandedUrlSettings.provider).toBe('none');
    });

    it('sets branded URL provider', () => {
      useSettingsStore.getState().setBrandedUrlProvider('rebrandly');
      expect(useSettingsStore.getState().brandedUrlSettings.provider).toBe('rebrandly');
    });

    it('clears branded URL settings', () => {
      useSettingsStore.getState().setBrandedUrlProvider('rebrandly');
      useSettingsStore.getState().clearBrandedUrlSettings();
      expect(useSettingsStore.getState().brandedUrlSettings.provider).toBe('none');
    });
  });

  describe('tracking settings', () => {
    it('defaults to disabled', () => {
      expect(useSettingsStore.getState().trackingSettings.enabled).toBe(false);
    });

    it('enables tracking', () => {
      useSettingsStore.getState().setTrackingEnabled(true);
      expect(useSettingsStore.getState().trackingSettings.enabled).toBe(true);
    });

    it('sets tracking API base URL', () => {
      useSettingsStore.getState().setTrackingApiBaseUrl('https://api.example.com');
      expect(useSettingsStore.getState().trackingSettings.apiBaseUrl).toBe('https://api.example.com');
    });
  });
});
