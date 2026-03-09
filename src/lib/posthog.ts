import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

export function initPostHog() {
  if (!POSTHOG_KEY) return;

  // Check cookie consent before initializing
  try {
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      const parsed = JSON.parse(consent);
      if (parsed.status !== 'accepted' || !parsed.analytics) {
        return; // User declined analytics
      }
    } else {
      return; // No consent yet
    }
  } catch {
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false, // Manual events only
    persistence: 'localStorage',
    // 10% session recording sample
    session_recording: {
      sampleRate: 0.1,
    },
  });
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  posthog.identify(userId, properties);
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

export function resetPostHog() {
  if (!POSTHOG_KEY) return;
  posthog.reset();
}

export { posthog };
