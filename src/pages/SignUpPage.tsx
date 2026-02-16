import { Link, useSearch, useNavigate } from '@tanstack/react-router';
import { SignUpForm } from '../components/auth/SignUpForm';
import { useThemeStore } from '../stores/themeStore';
import { QrCode, Moon, Sun, Check } from 'lucide-react';

export default function SignUpPage() {
  const { theme, toggleTheme } = useThemeStore();
  const search = useSearch({ from: '/signup' }) as { redirect?: string };
  const navigate = useNavigate();

  const features = [
    'Create unlimited QR codes',
    'Track scans in real-time',
    'Customize colors and styles',
    'Add your logo and branding',
    'Export in multiple formats',
    'Team collaboration',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Features (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-orange-500 to-pink-500 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h1 className="text-4xl font-bold mb-4">
            Start creating QR codes for free
          </h1>
          <p className="text-lg text-orange-100 mb-8">
            Join thousands of businesses using Qrius to connect with their customers.
          </p>

          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-12 p-4 bg-white/10 backdrop-blur rounded-xl">
            <p className="text-sm text-orange-100 mb-2">Free forever includes:</p>
            <p className="font-semibold">10 QR codes • 1,000 scans/month • 30-day history</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Qrius</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </header>

        {/* Form */}
        <main className="flex-1 flex items-center justify-center p-6">
          <SignUpForm onSignIn={() => navigate({ to: '/signin' })} />
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/signin"
            search={search.redirect ? { redirect: search.redirect } : {}}
            className="text-orange-600 hover:text-orange-500 font-medium"
          >
            Sign in
          </Link>
        </footer>
      </div>
    </div>
  );
}
