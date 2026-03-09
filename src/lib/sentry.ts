import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    // Start at 100%, reduce to 0.1 at scale
    sampleRate: 1.0,
    // Disable performance tracing (use Vercel Speed Insights instead)
    tracesSampleRate: 0,
    beforeSend(event) {
      // Filter out noisy errors
      const message = event.exception?.values?.[0]?.value ?? '';
      if (
        message.includes('Failed to fetch') ||
        message.includes('Load failed') ||
        message.includes('ResizeObserver loop') ||
        message.includes('Non-Error promise rejection')
      ) {
        return null;
      }
      return event;
    },
  });
}

export { Sentry };
