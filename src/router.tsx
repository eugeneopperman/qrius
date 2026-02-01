import { createRouter, createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { useAuthStore } from './stores/authStore';
import { Loader2 } from 'lucide-react';

// Loading component
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
const ProfileSettingsPage = lazy(() => import('./pages/settings/ProfileSettingsPage'));
const TeamSettingsPage = lazy(() => import('./pages/settings/TeamSettingsPage'));
const BillingSettingsPage = lazy(() => import('./pages/settings/BillingSettingsPage'));
const ApiKeysSettingsPage = lazy(() => import('./pages/settings/ApiKeysSettingsPage'));

// Root layout
function RootLayout() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Outlet />
    </Suspense>
  );
}

// Auth check for protected routes
async function requireAuth() {
  const { isInitialized } = useAuthStore.getState();

  // Wait for auth to initialize
  if (!isInitialized) {
    await new Promise<void>((resolve) => {
      const unsubscribe = useAuthStore.subscribe((state) => {
        if (state.isInitialized) {
          unsubscribe();
          resolve();
        }
      });
    });
  }

  const currentUser = useAuthStore.getState().user;
  if (!currentUser) {
    throw redirect({ to: '/signin', search: { redirect: window.location.pathname } });
  }
}

// Guest check for auth pages
async function requireGuest() {
  const { isInitialized } = useAuthStore.getState();

  if (!isInitialized) {
    await new Promise<void>((resolve) => {
      const unsubscribe = useAuthStore.subscribe((state) => {
        if (state.isInitialized) {
          unsubscribe();
          resolve();
        }
      });
    });
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

// Settings routes
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  beforeLoad: requireAuth,
  component: SettingsPage,
});

const profileSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/profile',
  beforeLoad: requireAuth,
  component: ProfileSettingsPage,
});

const teamSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/team',
  beforeLoad: requireAuth,
  component: TeamSettingsPage,
});

const billingSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/billing',
  beforeLoad: requireAuth,
  component: BillingSettingsPage,
});

const apiKeysSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/api-keys',
  beforeLoad: requireAuth,
  component: ApiKeysSettingsPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  signInRoute,
  signUpRoute,
  authCallbackRoute,
  resetPasswordRoute,
  dashboardRoute,
  qrCodesRoute,
  qrCodeDetailRoute,
  createQRRoute,
  settingsRoute,
  profileSettingsRoute,
  teamSettingsRoute,
  billingSettingsRoute,
  apiKeysSettingsRoute,
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
