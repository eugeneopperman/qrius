import { createRouter, createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { useAuthStore } from './stores/authStore';
import { Loader2 } from 'lucide-react';

// eslint-disable-next-line react-refresh/only-export-components -- router file, cannot split
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  );
}

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const SignInPage = lazy(() => import('./pages/SignInPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const QRCodesPage = lazy(() => import('./pages/QRCodesPage'));
const QRCodeDetailPage = lazy(() => import('./pages/QRCodeDetailPage'));
const CreateQRPage = lazy(() => import('./pages/CreateQRPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const ReaderPage = lazy(() => import('./pages/ReaderPage'));

// Legal pages
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));

// eslint-disable-next-line react-refresh/only-export-components -- router file, cannot split
function RootLayout() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Outlet />
    </Suspense>
  );
}

// Auth check for protected routes
const AUTH_TIMEOUT_MS = 10000; // 10 second timeout

async function waitForAuthInit(): Promise<void> {
  const { isInitialized } = useAuthStore.getState();
  if (isInitialized) return;

  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      unsubscribe();
      reject(new Error('Auth initialization timed out'));
    }, AUTH_TIMEOUT_MS);

    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.isInitialized) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve();
      }
    });
  });
}

async function requireAuth() {
  try {
    await waitForAuthInit();
  } catch (error) {
    console.error('Auth initialization failed:', error);
    throw redirect({ to: '/signin', search: { redirect: window.location.pathname } });
  }

  const currentUser = useAuthStore.getState().user;
  if (!currentUser) {
    throw redirect({ to: '/signin', search: { redirect: window.location.pathname } });
  }
}

// Guest check for auth pages
async function requireGuest() {
  try {
    await waitForAuthInit();
  } catch (error) {
    console.error('Auth initialization failed:', error);
    // Allow access to auth pages if initialization times out
    return;
  }

  const currentUser = useAuthStore.getState().user;
  if (currentUser) {
    throw redirect({ to: '/dashboard' });
  }
}

// Root route
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Public routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signin',
  beforeLoad: requireGuest,
  component: SignInPage,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  beforeLoad: requireGuest,
  component: SignUpPage,
});

const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  component: AuthCallbackPage,
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/reset-password',
  component: () => import('./pages/ResetPasswordPage').then((m) => <m.default />),
});

// Legal routes
const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: TermsPage,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: PrivacyPage,
});

const cookiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cookies',
  component: CookiesPage,
});

// Protected routes
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: requireAuth,
  component: DashboardPage,
});

const qrCodesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/qr-codes',
  beforeLoad: requireAuth,
  component: QRCodesPage,
});

const qrCodeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/qr-codes/$id',
  beforeLoad: requireAuth,
  component: QRCodeDetailPage,
});

const createQRRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  beforeLoad: requireAuth,
  component: CreateQRPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  beforeLoad: requireAuth,
  component: HistoryPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  beforeLoad: requireAuth,
  component: OnboardingPage,
});

const readerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reader',
  beforeLoad: requireAuth,
  component: ReaderPage,
});

// Settings routes — single tabbed page
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  beforeLoad: requireAuth,
  component: SettingsPage,
});

// Redirects for old settings sub-routes
const profileSettingsRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/profile',
  beforeLoad: () => {
    throw redirect({ to: '/settings', search: { tab: 'profile' } });
  },
});

const teamSettingsRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/team',
  beforeLoad: () => {
    throw redirect({ to: '/settings', search: { tab: 'team' } });
  },
});

const billingSettingsRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/billing',
  beforeLoad: () => {
    throw redirect({ to: '/settings', search: { tab: 'billing' } });
  },
});

const apiKeysSettingsRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/api-keys',
  beforeLoad: () => {
    throw redirect({ to: '/settings', search: { tab: 'api-keys' } });
  },
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  signInRoute,
  signUpRoute,
  authCallbackRoute,
  resetPasswordRoute,
  termsRoute,
  privacyRoute,
  cookiesRoute,
  dashboardRoute,
  qrCodesRoute,
  qrCodeDetailRoute,
  createQRRoute,
  historyRoute,
  onboardingRoute,
  readerRoute,
  settingsRoute,
  profileSettingsRedirect,
  teamSettingsRedirect,
  billingSettingsRedirect,
  apiKeysSettingsRedirect,
]);

// Create router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Type-safe router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
