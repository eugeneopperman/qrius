import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { router } from '@/router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CookieConsent } from '@/components/legal';
import { useAuthStore } from '@/stores/authStore';

// Initialize React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Initialize auth on app load
useAuthStore.getState().initialize();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Root ErrorBoundary caught:', error, errorInfo);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <CookieConsent />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
