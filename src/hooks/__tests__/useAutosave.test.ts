import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutosave } from '../useAutosave';
import { useAuthStore } from '@/stores/authStore';
import { useQRStore } from '@/stores/qrStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWizardStore } from '@/stores/wizardStore';

// Mock getSession
vi.mock('@/lib/supabase', () => ({
  getSession: vi.fn().mockResolvedValue({ access_token: 'test-token' }),
  supabase: { auth: { getSession: vi.fn() } },
  isSupabaseMissing: false,
}));

// Mock TanStack Query
const mockInvalidateQueries = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

function setupAuthenticatedUser() {
  useAuthStore.setState({
    user: { id: 'user-1', email: 'test@example.com' } as never,
  });
}

function setupQRContent() {
  useQRStore.setState({
    activeType: 'url',
    urlData: { url: 'https://example.com', useShortened: false },
    campaignName: 'Test Campaign',
  });
}

function setupWizardStep(step: 1 | 2 | 3 | 4) {
  useWizardStore.setState({ currentStep: step });
}

describe('useAutosave', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockInvalidateQueries.mockReset();

    // Reset stores
    useAuthStore.setState({ user: null, profile: null, session: null });
    useQRStore.getState().resetToDefaults();
    useQRStore.setState({
      activeType: 'url',
      urlData: { url: '', useShortened: false },
    });
    useSettingsStore.setState({ autosaveEnabled: true });
    useWizardStore.setState({ currentStep: 1, completedSteps: new Set() });
  });

  afterEach(() => {
    // Don't use vi.restoreAllMocks() — it clears module-level mock implementations
  });

  // --- Tests using saveNow() directly (no timer complexity) ---

  it('does not save when user is unauthenticated', async () => {
    setupQRContent();
    setupWizardStep(2);

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not save when autosaveEnabled is false', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(3);
    useSettingsStore.setState({ autosaveEnabled: false });

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not save on step 1', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(1);

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not save on step 2 (below MIN_STEP=3)', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(2);

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not save when content is empty/default', async () => {
    setupAuthenticatedUser();
    setupWizardStep(3);
    // URL data is empty by default

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('POSTs on first save', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(3);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'qr-123', tracking_url: 'https://short.url/abc' }),
    });

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/qr-codes',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.current.savedQRCodeId).toBe('qr-123');
    expect(result.current.trackingUrl).toBe('https://short.url/abc');
  });

  it('PATCHes on subsequent saves', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(3);

    // First save — POST
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'qr-123', tracking_url: 'https://short.url/abc' }),
    });

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.savedQRCodeId).toBe('qr-123');

    // Change content for second save
    act(() => {
      useQRStore.setState({ urlData: { url: 'https://changed.com', useShortened: false } });
    });

    // Second save — PATCH
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'qr-123', tracking_url: 'https://short.url/abc' }),
    });

    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/qr-codes/qr-123',
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('skips save when payload hash is unchanged', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(3);

    // First save
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'qr-123' }),
    });

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second call — no content change
    await act(async () => {
      await result.current.saveNow();
    });

    // Should still be 1 — skipped because hash unchanged
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('saveNow() triggers immediate save', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(3);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'qr-now' }),
    });

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.current.savedQRCodeId).toBe('qr-now');
  });

  it('reset() clears all state', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(3);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'qr-reset', tracking_url: 'https://short.url/xyz' }),
    });

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.savedQRCodeId).toBe('qr-reset');
    expect(result.current.trackingUrl).toBe('https://short.url/xyz');
    expect(result.current.lastSavedAt).toBeInstanceOf(Date);

    act(() => {
      result.current.reset();
    });

    expect(result.current.savedQRCodeId).toBeNull();
    expect(result.current.trackingUrl).toBeNull();
    expect(result.current.lastSavedAt).toBeNull();
  });

  it('handles API errors gracefully', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(3);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow();
    });

    // Should not crash, no QR code ID set
    expect(result.current.savedQRCodeId).toBeNull();
    expect(result.current.isSaving).toBe(false);
    consoleSpy.mockRestore();
  });

  it('stops retrying on 403 (plan limit)', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(3);

    // First attempt — 403
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Change content and try again
    act(() => {
      useQRStore.setState({ urlData: { url: 'https://different.com', useShortened: false } });
    });

    await act(async () => {
      await result.current.saveNow();
    });

    // Should not have made another request — limit flag is set
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('invalidates query cache on successful save', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(3);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'qr-cache' }),
    });

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['qr-codes'] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['dashboard-stats'] });
  });

  it('saves on step 3 (>= MIN_STEP)', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(3);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'qr-step3' }),
    });

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('saveNow() includes status: "draft" in payload', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(3);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'qr-draft' }),
    });

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow();
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.status).toBe('draft');
  });

  it('saveNowAs("active") includes status: "active" in payload', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(3);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'qr-active' }),
    });

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNowAs('active');
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.status).toBe('active');
  });

  it('saveNowAs("active") prevents subsequent draft saves', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(3);

    // First save — finalize as active
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'qr-final' }),
    });

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNowAs('active');
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Change content
    act(() => {
      useQRStore.setState({ urlData: { url: 'https://changed.com', useShortened: false } });
    });

    // Attempt draft save — should be blocked
    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1); // still 1
  });

  it('sets lastSavedAt on successful save', async () => {
    setupAuthenticatedUser();
    setupQRContent();
    setupWizardStep(3);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'qr-time' }),
    });

    const { result } = renderHook(() => useAutosave());

    const before = new Date();
    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.lastSavedAt).not.toBeNull();
    expect(result.current.lastSavedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});
