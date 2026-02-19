// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True when Supabase env vars are missing (placeholder client in use) */
export const isSupabaseMissing = !supabaseUrl || !supabaseAnonKey;

if (isSupabaseMissing) {
  console.warn(
    'Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  }
);

// Check if Supabase is reachable (detects paused projects, network issues)
export async function checkSupabaseConnection(): Promise<{ ok: boolean; message?: string }> {
  if (isSupabaseMissing) {
    return { ok: false, message: 'Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
  }

  try {
    // A lightweight auth call that exercises the REST endpoint
    const { error } = await supabase.auth.getSession();
    if (error) {
      return { ok: false, message: `Supabase responded with an error: ${error.message}` };
    }
    return { ok: true };
  } catch (err) {
    if (err instanceof TypeError) {
      return {
        ok: false,
        message: 'Cannot reach Supabase. The project may be paused (free-tier inactivity) or there is a network issue.',
      };
    }
    return { ok: false, message: `Unexpected error connecting to Supabase: ${(err as Error).message}` };
  }
}

// Helper to get current session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
}

