import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';

// Mock Supabase before importing the store
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      refreshSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
  checkSupabaseConnection: vi.fn(),
  isSupabaseMissing: false,
}));

import { useAuthStore } from '../authStore';
import { supabase } from '../../lib/supabase';
import type { Organization, OrganizationMember } from '../../types/database';

// Helper to build a mock organization
function makeOrganization(overrides: Partial<Organization> = {}): Organization {
  return {
    id: 'org-1',
    name: 'Test Org',
    slug: 'test-org',
    logo_url: null,
    plan: 'free',
    stripe_customer_id: null,
    stripe_subscription_id: null,
    settings: {},
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// Helper to build a mock membership with nested organization
function makeMembership(
  org: Organization,
  role: OrganizationMember['role'] = 'owner'
): OrganizationMember & { organization: Organization } {
  return {
    id: `mem-${org.id}`,
    organization_id: org.id,
    user_id: 'user-123',
    role,
    invited_by: null,
    invited_at: null,
    joined_at: '2026-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    organization: org,
  };
}

const DEFAULT_FREE_PLAN_LIMITS = {
  plan: 'free' as const,
  qr_codes_limit: 10,
  scans_per_month: 1000,
  scan_history_days: 30,
  team_members: 1,
  api_requests_per_day: 0,
  custom_branding: false,
  white_label: false,
  priority_support: false,
};

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      session: null,
      user: null,
      profile: null,
      isLoading: true,
      isInitialized: false,
      connectionError: null,
      hasCompletedOnboarding: false,
      organizations: [],
      currentOrganization: null,
      currentRole: null,
      planLimits: null,
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      const state = useAuthStore.getState();

      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.isLoading).toBe(true);
      expect(state.isInitialized).toBe(false);
      expect(state.connectionError).toBeNull();
      expect(state.hasCompletedOnboarding).toBe(false);
      expect(state.organizations).toEqual([]);
      expect(state.currentOrganization).toBeNull();
      expect(state.currentRole).toBeNull();
      expect(state.planLimits).toBeNull();
    });
  });

  describe('setOnboardingComplete', () => {
    it('sets hasCompletedOnboarding to true', () => {
      expect(useAuthStore.getState().hasCompletedOnboarding).toBe(false);

      useAuthStore.getState().setOnboardingComplete();

      expect(useAuthStore.getState().hasCompletedOnboarding).toBe(true);
    });
  });

  describe('signIn', () => {
    it('returns no error on success', async () => {
      (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
        error: null,
        data: { user: {}, session: {} },
      });

      const result = await useAuthStore.getState().signIn('test@example.com', 'password123');

      expect(result.error).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('returns error on authentication failure', async () => {
      (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
        error: { message: 'Invalid login credentials' },
        data: { user: null, session: null },
      });

      const result = await useAuthStore.getState().signIn('test@example.com', 'wrong');

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error!.message).toBe('Invalid login credentials');
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('returns user-friendly message on network TypeError', async () => {
      (supabase.auth.signInWithPassword as Mock).mockRejectedValue(
        new TypeError('Failed to fetch')
      );

      const result = await useAuthStore.getState().signIn('test@example.com', 'password123');

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error!.message).toContain('Cannot reach the authentication server');
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('signUp', () => {
    it('returns no error on success', async () => {
      (supabase.auth.signUp as Mock).mockResolvedValue({
        error: null,
        data: { user: {}, session: {} },
      });

      const result = await useAuthStore.getState().signUp('new@example.com', 'password123', 'New User');

      expect(result.error).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: { name: 'New User' },
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      });
    });

    it('returns error on failure', async () => {
      (supabase.auth.signUp as Mock).mockResolvedValue({
        error: { message: 'User already registered' },
        data: { user: null, session: null },
      });

      const result = await useAuthStore.getState().signUp('existing@example.com', 'password123');

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error!.message).toBe('User already registered');
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('returns user-friendly message on network TypeError', async () => {
      (supabase.auth.signUp as Mock).mockRejectedValue(
        new TypeError('Failed to fetch')
      );

      const result = await useAuthStore.getState().signUp('new@example.com', 'password123');

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error!.message).toContain('Cannot reach the authentication server');
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('signOut', () => {
    it('clears all auth state', async () => {
      // Pre-populate state to verify it gets cleared
      const org = makeOrganization();
      useAuthStore.setState({
        session: { access_token: 'token' } as never,
        user: { id: 'user-123' } as never,
        profile: { id: 'user-123', email: 'test@example.com' } as never,
        organizations: [makeMembership(org)],
        currentOrganization: org,
        currentRole: 'owner',
        planLimits: DEFAULT_FREE_PLAN_LIMITS,
        isLoading: false,
      });

      (supabase.auth.signOut as Mock).mockResolvedValue({ error: null });

      await useAuthStore.getState().signOut();

      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.organizations).toEqual([]);
      expect(state.currentOrganization).toBeNull();
      expect(state.currentRole).toBeNull();
      expect(state.planLimits).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('returns no error on success', async () => {
      (supabase.auth.resetPasswordForEmail as Mock).mockResolvedValue({
        error: null,
        data: {},
      });

      const result = await useAuthStore.getState().resetPassword('test@example.com');

      expect(result.error).toBeNull();
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: expect.stringContaining('/auth/reset-password') }
      );
    });

    it('returns error on failure', async () => {
      (supabase.auth.resetPasswordForEmail as Mock).mockResolvedValue({
        error: { message: 'Email not found' },
        data: null,
      });

      const result = await useAuthStore.getState().resetPassword('unknown@example.com');

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error!.message).toBe('Email not found');
    });

    it('returns "Request was interrupted" on AbortError', async () => {
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      (supabase.auth.resetPasswordForEmail as Mock).mockRejectedValue(abortError);

      const result = await useAuthStore.getState().resetPassword('test@example.com');

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error!.message).toContain('Request was interrupted');
    });

    it('returns connection error on TypeError', async () => {
      (supabase.auth.resetPasswordForEmail as Mock).mockRejectedValue(
        new TypeError('Failed to fetch')
      );

      const result = await useAuthStore.getState().resetPassword('test@example.com');

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error!.message).toContain('Cannot reach the authentication server');
    });
  });

  describe('updatePassword', () => {
    it('returns no error on success', async () => {
      (supabase.auth.updateUser as Mock).mockResolvedValue({
        error: null,
        data: { user: {} },
      });

      const result = await useAuthStore.getState().updatePassword('newPassword123');

      expect(result.error).toBeNull();
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newPassword123',
      });
    });

    it('returns error on failure', async () => {
      (supabase.auth.updateUser as Mock).mockResolvedValue({
        error: { message: 'Password too short' },
        data: { user: null },
      });

      const result = await useAuthStore.getState().updatePassword('short');

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error!.message).toBe('Password too short');
    });
  });

  describe('setCurrentOrganization', () => {
    it('sets currentOrganization and currentRole from organizations list', async () => {
      const org1 = makeOrganization({ id: 'org-1', name: 'Org One' });
      const org2 = makeOrganization({ id: 'org-2', name: 'Org Two', plan: 'pro' });
      const membership1 = makeMembership(org1, 'owner');
      const membership2 = makeMembership(org2, 'editor');

      useAuthStore.setState({
        organizations: [membership1, membership2],
      });

      // Mock supabase.from('plan_limits').select('*').eq('plan', 'pro').single()
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          plan: 'pro',
          qr_codes_limit: 100,
          scans_per_month: 50000,
          scan_history_days: 365,
          team_members: 5,
          api_requests_per_day: 1000,
          custom_branding: true,
          white_label: false,
          priority_support: false,
        },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as Mock).mockReturnValue({ select: mockSelect });

      await useAuthStore.getState().setCurrentOrganization('org-2');

      const state = useAuthStore.getState();
      expect(state.currentOrganization).toEqual(org2);
      expect(state.currentRole).toBe('editor');
      expect(state.planLimits?.plan).toBe('pro');
      expect(state.planLimits?.qr_codes_limit).toBe(100);
    });

    it('falls back to DEFAULT_FREE_PLAN_LIMITS when plan_limits query returns null', async () => {
      const org = makeOrganization({ id: 'org-1', plan: 'free' });
      const membership = makeMembership(org, 'owner');

      useAuthStore.setState({
        organizations: [membership],
      });

      // Mock plan_limits returning null data
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as Mock).mockReturnValue({ select: mockSelect });

      await useAuthStore.getState().setCurrentOrganization('org-1');

      const state = useAuthStore.getState();
      expect(state.currentOrganization).toEqual(org);
      expect(state.currentRole).toBe('owner');
      expect(state.planLimits).toEqual(DEFAULT_FREE_PLAN_LIMITS);
    });

    it('does nothing if orgId is not found in organizations', async () => {
      const org = makeOrganization({ id: 'org-1' });
      useAuthStore.setState({
        organizations: [makeMembership(org)],
        currentOrganization: null,
        currentRole: null,
      });

      await useAuthStore.getState().setCurrentOrganization('nonexistent-org');

      const state = useAuthStore.getState();
      expect(state.currentOrganization).toBeNull();
      expect(state.currentRole).toBeNull();
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });
});
