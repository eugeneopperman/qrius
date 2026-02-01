// Authentication store using Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { User, Organization, OrganizationMember, PlanLimits } from '../types/database';
import { supabase } from '../lib/supabase';

export interface AuthState {
  // Auth state
  session: Session | null;
  user: SupabaseUser | null;
  profile: User | null;
  isLoading: boolean;
  isInitialized: boolean;

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
      organizations: [],
      currentOrganization: null,
      currentRole: null,
      planLimits: null,

      // Initialize auth state
      initialize: async () => {
        try {
          set({ isLoading: true });

          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Error getting session:', error);
            set({ isLoading: false, isInitialized: true });
            return;
          }

          if (session) {
            set({ session, user: session.user });
            await get().fetchProfile();
            await get().fetchOrganizations();
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
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

          set({ isLoading: false, isInitialized: true });
        } catch (error) {
          console.error('Error initializing auth:', error);
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
          console.error('Error signing out:', error);
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
            console.error('Error refreshing session:', error);
            return;
          }

          set({ session, user: session?.user ?? null });
        } catch (error) {
          console.error('Error refreshing session:', error);
        }
      },

      // Fetch user profile
      fetchProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }

          set({ profile: data });
        } catch (error) {
          console.error('Error fetching profile:', error);
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
            console.error('Error fetching organizations:', error);
            return;
          }

          const organizations = data as (OrganizationMember & { organization: Organization })[];
          set({ organizations });

          // Set current organization if not set
          const { currentOrganization } = get();
          if (!currentOrganization && organizations.length > 0) {
            await get().setCurrentOrganization(organizations[0].organization.id);
          }
        } catch (error) {
          console.error('Error fetching organizations:', error);
        }
      },

      // Set current organization
      setCurrentOrganization: async (orgId) => {
        const { organizations } = get();
        const membership = organizations.find((m) => m.organization.id === orgId);

        if (!membership) {
          console.error('Organization not found');
          return;
        }

        // Fetch plan limits
        const { data: limits } = await supabase
          .from('plan_limits')
          .select('*')
          .eq('plan', membership.organization.plan)
          .single();

        set({
          currentOrganization: membership.organization,
          currentRole: membership.role,
          planLimits: limits,
        });
      },

      // Create new organization
      createOrganization: async (name) => {
        const { user } = get();
        if (!user) return { data: null, error: new Error('Not authenticated') };

        try {
          // Generate slug from name
          const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            + '-' + Math.random().toString(36).substring(2, 8);

          // Create organization
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({ name, slug })
            .select()
            .single();

          if (orgError) {
            return { data: null, error: new Error(orgError.message) };
          }

          // Add user as owner
          const { error: memberError } = await supabase
            .from('organization_members')
            .insert({
              organization_id: org.id,
              user_id: user.id,
              role: 'owner',
            });

          if (memberError) {
            // Rollback org creation
            await supabase.from('organizations').delete().eq('id', org.id);
            return { data: null, error: new Error(memberError.message) };
          }

          // Refresh organizations list
          await get().fetchOrganizations();

          return { data: org, error: null };
        } catch (error) {
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
      }),
    }
  )
);
