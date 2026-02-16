import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { hasCompletedOnboarding } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Try PKCE flow first — extract code from query params
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        let session = null;

        if (code) {
          // PKCE flow: exchange the auth code for a session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Auth code exchange error:', exchangeError);
            setError(exchangeError.message);
            return;
          }
          session = data.session;
        } else {
          // Fallback for hash-based (implicit) flows
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error('Auth callback error:', sessionError);
            setError(sessionError.message);
            return;
          }
          session = data.session;
        }

        if (session) {
          // Redirect new users to onboarding, returning users to dashboard
          if (!hasCompletedOnboarding) {
            navigate({ to: '/onboarding' });
          } else {
            navigate({ to: '/dashboard' });
          }
        } else {
          // No session, redirect to sign in
          navigate({ to: '/signin' });
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An unexpected error occurred');
      }
    };

    handleAuthCallback();
  }, [navigate, hasCompletedOnboarding]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <a
            href="/signin"
            className="text-orange-600 hover:text-orange-500 font-medium"
          >
            Return to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
}
