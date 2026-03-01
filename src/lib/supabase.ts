// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { hasRealDomain, getCookieDomain } from '@/lib/domain';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True when Supabase env vars are missing (placeholder client in use) */
export const isSupabaseMissing = !supabaseUrl || !supabaseAnonKey;

if (isSupabaseMissing && import.meta.env.DEV) {
  console.warn(
    'Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

// ---------------------------------------------------------------------------
// Cookie-based storage adapter for cross-subdomain session sharing
// ---------------------------------------------------------------------------
// Supabase stores auth sessions in localStorage by default, which is
// origin-scoped (qrius.app ≠ app.qrius.app). When VITE_BASE_DOMAIN is set
// we provide a custom `storage` adapter that persists to cookies scoped to
// the parent domain (e.g. `.qrius.app`), so both origins share the session.

const SUPABASE_STORAGE_KEY = `sb-${(supabaseUrl || '').replace(/^https?:\/\//, '').split('.')[0]}-auth-token`;

function createCookieStorage(): Storage {
  const domain = getCookieDomain(); // e.g. ".qrius.app"
  const cookieAttrs = `path=/;max-age=31536000;SameSite=Lax;Secure;domain=${domain}`;

  return {
    get length() {
      return document.cookie.split(';').filter(Boolean).length;
    },
    key(_index: number) {
      return null;
    },
    clear() {
      // no-op — we only manage Supabase keys
    },
    getItem(key: string): string | null {
      const match = document.cookie.match(
        new RegExp(`(?:^|;\\s*)${encodeURIComponent(key)}=([^;]*)`)
      );
      return match ? decodeURIComponent(match[1]) : null;
    },
    setItem(key: string, value: string): void {
      document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)};${cookieAttrs}`;
    },
    removeItem(key: string): void {
      const domainStr = domain ? `domain=${domain};` : '';
      document.cookie = `${encodeURIComponent(key)}=;path=/;max-age=0;${domainStr}`;
    },
  };
}

// One-time migration: move existing localStorage session to cookie storage
// so users don't have to re-login after the subdomain switch.
function migrateLocalStorageToCookie(cookieStorage: Storage): void {
  try {
    const existing = localStorage.getItem(SUPABASE_STORAGE_KEY);
    if (existing && !cookieStorage.getItem(SUPABASE_STORAGE_KEY)) {
      cookieStorage.setItem(SUPABASE_STORAGE_KEY, existing);
      localStorage.removeItem(SUPABASE_STORAGE_KEY);
    }
  } catch {
    // Ignore — cookies may be blocked
  }
}

const cookieStorage = hasRealDomain ? createCookieStorage() : undefined;
if (cookieStorage) migrateLocalStorageToCookie(cookieStorage);

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      ...(cookieStorage ? { storage: cookieStorage } : {}),
    },
  }
);

// Check if Supabase is reachable (detects paused projects, network issues)
// Returns the session so callers can avoid a redundant getSession() call
export async function checkSupabaseConnection(): Promise<{ ok: boolean; message?: string; session?: import('@supabase/supabase-js').Session | null }> {
  if (isSupabaseMissing) {
    return { ok: false, message: 'Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
  }

  try {
    // A lightweight auth call that exercises the REST endpoint
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { ok: false, message: `Supabase responded with an error: ${error.message}` };
    }
    return { ok: true, session: data.session };
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
    if (import.meta.env.DEV) console.error('Error getting session:', error);
    return null;
  }
  return session;
}

