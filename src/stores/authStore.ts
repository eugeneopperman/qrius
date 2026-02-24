// Authentication store using Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User as SupabaseUser, Session, Subscription } from '@supabase/supabase-js';
import type { User, Organization, OrganizationMember, PlanLimits } from '@/types/database';
import { supabase, checkSupabaseConnection } from '@/lib/supabase';

// Track the auth listener subscription to clean up on re-init
let authSubscription: Subscription | null = null;

const DEFAULT_FREE_PLAN_LIMITS: PlanLimits = {
  plan: 'free',
  qr_codes_limit: 15,
  scans_per_month: 5000,
  scan_history_days: 30,
  team_members: 1,
  api_requests_per_day: 0,
  custom_branding: false,
  white_label: false,
  priority_support: false,
};

export interface AuthState {
  // Auth state
  session: Session | null;
  user: SupabaseUser | null;
  profile: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  connectionError: string | null;

  // Onboarding state
  hasCompletedOnboarding: boolean;
  setOnboardingComplete: () => void;

  // Organization state
  organizations: (OrganizationMember & { organization: Organization })[];
  currentOrganization: Organization | null;
  currentRole: OrganizationMember['role'] | null;
  planLimits: PlanLimits | null;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;

  // Profile actions
  updateProfile: (updates: Partial<User>) => Promise<{ error: Error | null }>;
  fetchProfile: () => Promise<void>;

  // Organization actions
  fetchOrganizations: () => Promise<void>;
  setCurrentOrganization: (orgId: string) => Promise<void>;
  createOrganization: (name: string) => Promise<{ data: Organization | null; error: Error | null }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
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

      setOnboardingComplete: () => {
        set({ hasCompletedOnboarding: true });
      },

      // Initialize auth state
      initialize: async () => {
        try {
          set({ isLoading: true, connectionError: null });

          // Check if Supabase is reachable
          const connectionCheck = await checkSupabaseConnection();
          if (!connectionCheck.ok) {
            if (import.meta.env.DEV) console.warn('Supabase connection issue:', connectionCheck.message);
            set({ isLoading: false, isInitialized: true, connectionError: connectionCheck.message ?? 'Connection failed' });
            return;
          }

          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            set({ isLoading: false, isInitialized: true });
            return;
          }

          if (session) {
            set({ session, user: session.user });
            await get().fetchProfile();
            await get().fetchOrganizations();
          }

          // Clean up previous listener if initialize() is called multiple times
          if (authSubscription) {
            authSubscription.unsubscribe();
            authSubscription = null;
          }

          // Listen for auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            set({ session, user: session?.user ?? null });

            if (event === 'SIGNED_IN' && session) {
              await get().fetchProfile();
              await get().fetchOrganizations();
            } else if (event === 'SIGNED_OUT') {
              set({
                profile: null,
                organizations: [],
                currentOrganization: null,
                currentRole: null,
                planLimits: null,
              });
            }
          });
          authSubscription = subscription;

          set({ isLoading: false, isInitialized: true });
        } catch (error) {
          if (import.meta.env.DEV) console.error('Error initializing auth:', error);
          set({ isLoading: false, isInitialized: true });
        }
      },

      // Sign in with email/password
      signIn: async (email, password) => {
        try {
          set({ isLoading: true });
          const { error } = await supabase.auth.signInWithPassword({ email, password });

          if (error) {
            set({ isLoading: false });
            return { error: new Error(error.message) };
          }

          set({ isLoading: false });
          return { error: null };
        } catch (error) {
          set({ isLoading: false });
          if (error instanceof TypeError) {
            return { error: new Error('Cannot reach the authentication server. Check your internet connection, or the Supabase project may be paused.') };
          }
          return { error: error as Error };
        }
      },

      // Sign up with email/password
      signUp: async (email, password, name) => {
        try {
          set({ isLoading: true });
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) {
            set({ isLoading: false });
            return { error: new Error(error.message) };
          }

          set({ isLoading: false });
          return { error: null };
        } catch (error) {
          set({ isLoading: false });
          if (error instanceof TypeError) {
            return { error: new Error('Cannot reach the authentication server. Check your internet connection, or the Supabase project may be paused.') };
          }
          return { error: error as Error };
        }
      },

      // Sign in with OAuth provider
      signInWithOAuth: async (provider) => {
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) {
            return { error: new Error(error.message) };
          }

          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },

      // Sign out
      signOut: async () => {
        try {
          set({ isLoading: true });
          await supabase.auth.signOut();
          set({
            session: null,
            user: null,
            profile: null,
            organizations: [],
            currentOrganization: null,
            currentRole: null,
            planLimits: null,
            isLoading: false,
          });
        } catch (error) {
          if (import.meta.env.DEV) console.error('Error signing out:', error);
          set({ isLoading: false });
        }
      },

      // Reset password
      resetPassword: async (email) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          });

          if (error) {
            return { error: new Error(error.message) };
          }

          return { error: null };
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return { error: new Error('Request was interrupted. Please try again.') };
          }
          if (error instanceof TypeError) {
            return { error: new Error('Cannot reach the authentication server. Check your internet connection, or the Supabase project may be paused.') };
          }
          return { error: error as Error };
        }
      },

      // Update password
      updatePassword: async (password) => {
        try {
          const { error } = await supabase.auth.updateUser({ password });

          if (error) {
            return { error: new Error(error.message) };
          }

          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },

      // Refresh session
      refreshSession: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.refreshSession();

          if (error) {
            if (import.meta.env.DEV) console.error('Error refreshing session:', error);
            return;
          }

          set({ session, user: session?.user ?? null });
        } catch (error) {
          if (import.meta.env.DEV) console.error('Error refreshing session:', error);
        }
      },

      // Fetch user profile (auto-provisions if missing — mirrors the handle_new_user trigger)
      fetchProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data) {
            set({ profile: data });
            return;
          }

          // Profile not found — auto-provision (handles cases where the DB trigger isn't set up)
          if (error && error.code === 'PGRST116') {

            const userName =
              user.user_metadata?.name ??
              user.user_metadata?.full_name ??
              user.email?.split('@')[0] ??
              'User';

            // 1. Create user profile
            const { error: insertError } = await supabase.from('users').insert({
              id: user.id,
              email: user.email!,
              name: userName,
              avatar_url: user.user_metadata?.avatar_url ?? null,
            });

            if (insertError) {
              if (import.meta.env.DEV) console.error('Error auto-provisioning user profile:', insertError);
              return;
            }

            // 2. Create personal organization
            const orgId = crypto.randomUUID();
            const { error: orgError } = await supabase.from('organizations').insert({
              id: orgId,
              name: `${userName}'s Workspace`,
              slug: `personal-${user.id.slice(0, 8)}`,
            });

            if (orgError) {
              if (import.meta.env.DEV) console.error('Error auto-provisioning organization:', orgError);
              // Profile was created, continue — org can be created later
            }

            // 3. Add user as owner of their personal org
            if (!orgError) {
              const { error: memberError } = await supabase.from('organization_members').insert({
                organization_id: orgId,
                user_id: user.id,
                role: 'owner',
              });

              if (memberError) {
                if (import.meta.env.DEV) console.error('Error auto-provisioning org membership:', memberError);
              }
            }

            // 4. Re-fetch the newly created profile
            const { data: newProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();

            if (newProfile) {
              set({ profile: newProfile });
            }
            return;
          }

          // Other error
          if (error) {
            if (import.meta.env.DEV) console.error('Error fetching profile:', error);
          }
        } catch (error) {
          if (import.meta.env.DEV) console.error('Error fetching profile:', error);
        }
      },

      // Update user profile
      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return { error: new Error('Not authenticated') };

        try {
          const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id);

          if (error) {
            return { error: new Error(error.message) };
          }

          await get().fetchProfile();
          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },

      // Fetch user's organizations
      fetchOrganizations: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('organization_members')
            .select(`
              *,
              organization:organizations(*)
            `)
            .eq('user_id', user.id);

          if (error) {
            if (import.meta.env.DEV) console.error('Error fetching organizations:', error);
            return;
          }

          const organizations = data as (OrganizationMember & { organization: Organization })[];
          set({ organizations });

          // Set or refresh current organization (always update to pick up plan changes)
          const { currentOrganization } = get();
          if (organizations.length > 0) {
            // If we already have a current org, find the fresh version; otherwise default to first
            const match = currentOrganization
              ? organizations.find((m) => m.organization.id === currentOrganization.id)
              : null;
            const activeOrg = match || organizations[0];

            // Fetch plan limits for the active organization
            const { data: limits } = await supabase
              .from('plan_limits')
              .select('*')
              .eq('plan', activeOrg.organization.plan)
              .single();

            set({
              currentOrganization: activeOrg.organization,
              currentRole: activeOrg.role,
              planLimits: limits || DEFAULT_FREE_PLAN_LIMITS,
            });
          }
        } catch (error) {
          if (import.meta.env.DEV) console.error('Error fetching organizations:', error);
        }
      },

      // Set current organization
      setCurrentOrganization: async (orgId) => {
        const { organizations } = get();
        const membership = organizations.find((m) => m.organization.id === orgId);

        if (!membership) return;

        // Fetch plan limits
        const { data: limits } = await supabase
          .from('plan_limits')
          .select('*')
          .eq('plan', membership.organization.plan)
          .single();

        set({
          currentOrganization: membership.organization,
          currentRole: membership.role,
          planLimits: limits || DEFAULT_FREE_PLAN_LIMITS,
        });
      },

      // Create new organization
      createOrganization: async (name) => {
        const { user } = get();
        if (!user) return { data: null, error: new Error('Not authenticated') };

        // Generate ID client-side so we can reference it without a SELECT
        // (the organizations_select RLS policy requires membership, which
        // doesn't exist yet at INSERT time, so .select() would fail)
        const orgId = crypto.randomUUID();
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          + '-' + Math.random().toString(36).substring(2, 8);

        try {
          // Create organization (no .select() — RLS blocks reading before membership exists)
          const { error: orgError } = await supabase
            .from('organizations')
            .insert({ id: orgId, name, slug });

          if (orgError) {
            return { data: null, error: new Error(orgError.message) };
          }

          // Add user as owner
          const { error: memberError } = await supabase
            .from('organization_members')
            .insert({
              organization_id: orgId,
              user_id: user.id,
              role: 'owner',
            });

          if (memberError) {
            // Rollback org creation with retry and error logging
            const rollbackOrg = async (attempts = 3): Promise<void> => {
              for (let i = 0; i < attempts; i++) {
                const { error: deleteError } = await supabase
                  .from('organizations')
                  .delete()
                  .eq('id', orgId);

                if (!deleteError) return;

                if (import.meta.env.DEV) console.error(
                  `Failed to rollback organization ${orgId} (attempt ${i + 1}/${attempts}):`,
                  deleteError.message
                );

                // Wait before retry (exponential backoff)
                if (i < attempts - 1) {
                  await new Promise((r) => setTimeout(r, 100 * Math.pow(2, i)));
                }
              }
              if (import.meta.env.DEV) console.error(
                `CRITICAL: Orphaned organization ${orgId} created but owner membership failed. Manual cleanup required.`
              );
            };

            await rollbackOrg();
            return { data: null, error: new Error(memberError.message) };
          }

          // Refresh organizations list (now readable since membership exists)
          await get().fetchOrganizations();

          // Construct org object (matches what fetchOrganizations will return)
          const org = {
            id: orgId,
            name,
            slug,
            logo_url: null,
            plan: 'free' as const,
            stripe_customer_id: null,
            stripe_subscription_id: null,
            settings: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          return { data: org, error: null };
        } catch (error) {
          // Attempt cleanup if org was created but something else failed
          if (import.meta.env.DEV) console.error('Unexpected error during org creation, attempting cleanup:', error);
          const { error: cleanupError } = await supabase
            .from('organizations')
            .delete()
            .eq('id', orgId);

          if (cleanupError) {
            if (import.meta.env.DEV) console.error(
              `CRITICAL: Failed to cleanup organization ${orgId}:`,
              cleanupError.message
            );
          }
          return { data: null, error: error as Error };
        }
      },
    }),
    {
      name: 'qrius-auth',
      partialize: (state) => ({
        currentOrganization: state.currentOrganization
          ? { id: state.currentOrganization.id }
          : null,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);
