import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { router } from '@/router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuthStore } from '@/stores/authStore';

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Root ErrorBoundary caught:', error, errorInfo);
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
