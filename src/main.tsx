import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { router } from '@/router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuthStore } from '@/stores/authStore';
import { initSentry } from '@/lib/sentry';
import { initPostHog } from '@/lib/posthog';
import { inject as injectVercelAnalytics } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

const CookieConsent = lazy(() =>
  import('@/components/legal/CookieConsent').then(m => ({ default: m.CookieConsent }))
);

// Initialize React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Initialize observability
initSentry();
initPostHog();
injectVercelAnalytics();
injectSpeedInsights();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      onError={(error) => {
        if (import.meta.env.PROD) {
          import('@sentry/react').then(Sentry => Sentry.captureException(error));
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Suspense fallback={null}>
          <CookieConsent />
        </Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);

// Defer auth init to after first paint — waitForAuthInit() in router.tsx
// already handles the async case by subscribing to store changes
setTimeout(() => useAuthStore.getState().initialize(), 0);
