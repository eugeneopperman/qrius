import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { TERMS_VERSION } from '@/config/constants';
import { Button } from '../ui/Button';
import { Loader2, ShieldCheck } from 'lucide-react';

export function TermsConsentModal() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { session, fetchProfile } = useAuthStore(useShallow((s) => ({
    session: s.session,
    fetchProfile: s.fetchProfile,
  })));

  const handleAccept = async () => {
    if (!accepted || !session) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/users/consent', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ terms_version: TERMS_VERSION }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save consent');
      }

      // Dismiss modal immediately, then refresh profile in background
      useAuthStore.setState({ needsTermsAcceptance: false });
      fetchProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Updated Terms of Service
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
          Before continuing, please review and accept our updated terms.
        </p>

        <div className="space-y-3 mb-6">
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { e.preventDefault(); window.open('/terms', '_blank'); }}
            className="block w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-900 dark:text-white"
          >
            Terms of Service
            <span className="text-gray-400 ml-1">&rarr;</span>
          </a>
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { e.preventDefault(); window.open('/privacy', '_blank'); }}
            className="block w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-900 dark:text-white"
          >
            Privacy Policy
            <span className="text-gray-400 ml-1">&rarr;</span>
          </a>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4 text-center">{error}</p>
        )}

        <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400 mb-6">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            disabled={loading}
          />
          <span>
            I have read and agree to the Terms of Service and Privacy Policy
          </span>
        </label>

        <Button
          className="w-full"
          disabled={!accepted || loading}
          onClick={handleAccept}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'I agree — Continue'
          )}
        </Button>
      </div>
    </div>
  );
}
