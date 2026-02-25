import { useState } from 'react';
import { Link, useSearch, useNavigate } from '@tanstack/react-router';
import { SignInForm } from '@/components/auth/SignInForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Logo } from '@/components/ui/Logo';
import { useThemeStore } from '@/stores/themeStore';
import { Moon, Sun, CloudSun } from 'lucide-react';

type View = 'signin' | 'forgot-password';

export default function SignInPage() {
  const [view, setView] = useState<View>('signin');
  const { resolvedTheme, cycleTheme } = useThemeStore();
  const search = useSearch({ from: '/signin' }) as { redirect?: string };
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <Link to="/">
            <Logo size="md" />
          </Link>

          <button
            onClick={cycleTheme}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Cycle theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : resolvedTheme === 'cool' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <CloudSun className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </header>

        {/* Form */}
        <main className="flex-1 flex items-center justify-center p-6">
          {view === 'signin' && (
            <SignInForm
              onForgotPassword={() => setView('forgot-password')}
              onSignUp={() => navigate({ to: '/signup' })}
              redirectTo={search.redirect}
            />
          )}
          {view === 'forgot-password' && (
            <ForgotPasswordForm onBack={() => setView('signin')} />
          )}
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/signup"
            search={search.redirect ? { redirect: search.redirect } : {}}
            className="text-orange-600 hover:text-orange-500 font-medium"
          >
            Sign up
          </Link>
        </footer>
      </div>

      {/* Right side - Illustration (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-orange-500 to-pink-500 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h1 className="text-4xl font-bold mb-4">
            Create trackable QR codes in seconds
          </h1>
          <p className="text-lg text-orange-100 mb-8">
            Generate beautiful, customizable QR codes with real-time analytics.
            Track scans, manage campaigns, and grow your business.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold">10M+</div>
              <div className="text-sm text-orange-100">QR codes created</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm text-orange-100">Active users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
