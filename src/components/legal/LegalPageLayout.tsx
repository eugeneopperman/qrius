import { Link } from '@tanstack/react-router';
import { QrCode, Moon, Sun, CloudSun, ArrowLeft } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { PublicFooter } from '../layout/PublicFooter';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  const { resolvedTheme, cycleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="glass-medium" style={{ borderRadius: 0 }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Qrius</span>
            </Link>
          </div>

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
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="glass rounded-2xl p-8 sm:p-12">
          <header className="mb-8 pb-8 border-b border-divider">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated}
            </p>
          </header>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            {children}
          </div>
        </article>
      </main>

      <PublicFooter className="glass-medium mt-16" />
    </div>
  );
}
