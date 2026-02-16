import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { X, Cookie } from 'lucide-react';
import { Button } from '../ui/Button';

const COOKIE_CONSENT_KEY = 'cookie-consent';

type ConsentStatus = 'pending' | 'accepted' | 'declined';

interface CookieConsentState {
  status: ConsentStatus;
  timestamp: number;
  analytics: boolean;
}

function getStoredConsent(): CookieConsentState | null {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function storeConsent(state: CookieConsentState): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    // Check if user has already made a choice
    const stored = getStoredConsent();
    if (!stored || stored.status === 'pending') {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    storeConsent({
      status: 'accepted',
      timestamp: Date.now(),
      analytics: true,
    });
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    storeConsent({
      status: 'accepted',
      timestamp: Date.now(),
      analytics: analyticsEnabled,
    });
    setIsVisible(false);
  };

  const handleDecline = () => {
    storeConsent({
      status: 'declined',
      timestamp: Date.now(),
      analytics: false,
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Main banner */}
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <Cookie className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Cookie Preferences
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We use cookies to enhance your experience. Essential cookies are required for the site to work.
                You can choose to enable analytics cookies to help us improve.{' '}
                <Link to="/cookies" className="text-orange-600 hover:text-orange-500 underline">
                  Learn more
                </Link>
              </p>
            </div>
            <button
              onClick={handleDecline}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cookie settings (expandable) */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="space-y-3">
                {/* Essential cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Essential Cookies
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Required for the site to function
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-500 dark:text-gray-400">
                    Always on
                  </div>
                </div>

                {/* Analytics cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Analytics Cookies
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Help us understand how you use the site
                    </p>
                  </div>
                  <button
                    onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      analyticsEnabled
                        ? 'bg-orange-500'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                    role="switch"
                    aria-checked={analyticsEnabled}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        analyticsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button
              variant="primary"
              onClick={handleAcceptAll}
              className="order-1 sm:order-3"
            >
              Accept All
            </Button>
            {showDetails ? (
              <Button
                variant="secondary"
                onClick={handleAcceptSelected}
                className="order-2"
              >
                Save Preferences
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setShowDetails(true)}
                className="order-2"
              >
                Customize
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleDecline}
              className="order-3 sm:order-1 text-gray-500"
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if analytics cookies are enabled
 */
// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with component
export function useAnalyticsConsent(): boolean {
  const [enabled] = useState(() => {
    const stored = getStoredConsent();
    return stored?.status === 'accepted' && stored.analytics === true;
  });

  return enabled;
}

/**
 * Reset cookie consent (useful for testing or settings page)
 */
// eslint-disable-next-line react-refresh/only-export-components -- utility co-located with component
export function resetCookieConsent(): void {
  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  } catch {
    // Ignore storage errors
  }
}
