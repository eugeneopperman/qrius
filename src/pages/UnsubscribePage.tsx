import { useEffect, useState } from 'react';
import { useSearch } from '@tanstack/react-router';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';

type UnsubscribeState = 'loading' | 'success' | 'error';

export default function UnsubscribePage() {
  const search = useSearch({ strict: false }) as { token?: string };
  const [state, setState] = useState<UnsubscribeState>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!search.token) {
      setState('error');
      setMessage('Missing unsubscribe token');
      return;
    }

    fetch(`/api/unsubscribe?token=${encodeURIComponent(search.token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setState('success');
          setMessage(data.message || 'Successfully unsubscribed');
        } else {
          setState('error');
          setMessage(data.error || 'Failed to unsubscribe');
        }
      })
      .catch(() => {
        setState('error');
        setMessage('Something went wrong. Please try again.');
      });
  }, [search.token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] dark:bg-gray-950 p-4">
      <div className="max-w-md w-full text-center">
        {state === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Processing...</h1>
          </>
        )}

        {state === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unsubscribed</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              You can manage all your email preferences in{' '}
              <Link to="/settings" search={{ tab: 'notifications' }} className="text-orange-500 hover:underline">
                Settings
              </Link>.
            </p>
          </>
        )}

        {state === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Oops</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
          </>
        )}

        <Link to="/" className="text-sm text-orange-500 hover:underline">
          ← Back to Qrius Codes
        </Link>
      </div>
    </div>
  );
}
