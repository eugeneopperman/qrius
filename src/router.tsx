import { createRouter, createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { isSupabaseMissing } from '@/lib/supabase';
import { APP_VERSION } from '@/config/constants';
import { Loader2 } from 'lucide-react';
import { KeyboardShortcutsModal } from '@/components/features/KeyboardShortcuts';
import { HistoryModal } from '@/components/features/History';
import { TemplateWizardModal } from '@/components/templates';
import { SettingsModal } from '@/components/settings';
import { ToastContainer } from '@/components/ui/Toast';

// eslint-disable-next-line react-refresh/only-export-components -- router file, cannot split
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  );
}

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'));
const SignInPage = lazy(() => import('@/pages/SignInPage'));
const SignUpPage = lazy(() => import('@/pages/SignUpPage'));
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const QRCodesPage = lazy(() => import('@/pages/QRCodesPage'));
const QRCodeDetailPage = lazy(() => import('@/pages/QRCodeDetailPage'));
const CreateQRPage = lazy(() => import('@/pages/CreateQRPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const ReaderPage = lazy(() => import('@/pages/ReaderPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));

// Legal pages
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const CookiesPage = lazy(() => import('@/pages/CookiesPage'));

// eslint-disable-next-line react-refresh/only-export-components -- router file, cannot split
function RootLayout() {
  const { isShortcutsOpen, closeShortcuts, isHistoryOpen, closeHistory, isSettingsOpen, closeSettings } = useUIStore();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {import.meta.env.DEV && isSupabaseMissing && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[100] bg-amber-50 dark:bg-amber-900/80 border border-amber-300 dark:border-amber-700 rounded-xl px-4 py-3 shadow-lg text-sm text-amber-800 dark:text-amber-200">
          <p className="font-medium">Supabase not configured</p>
          <p className="text-xs mt-1 text-amber-600 dark:text-amber-300">
            Set <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
            <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in{' '}
            <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">.env.local</code> to enable auth.
          </p>
        </div>
      )}
      <Outlet />

      {/* Global modals */}
      <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={closeShortcuts} />
      <HistoryModal isOpen={isHistoryOpen} onClose={closeHistory} />
      <TemplateWizardModal />
      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
      <ToastContainer />

      <div className="fixed bottom-2 right-2 z-[100] px-2 py-0.5 rounded bg-black/60 text-white text-xs font-mono pointer-events-none select-none">
        Beta v{APP_VERSION}
      </div>
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
  component: ResetPasswordPage,
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
