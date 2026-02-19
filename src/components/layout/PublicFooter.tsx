import { Link } from '@tanstack/react-router';
import { Keyboard } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

interface PublicFooterProps {
  className?: string;
}

export function PublicFooter({ className = 'glass-header mt-16' }: PublicFooterProps) {
  const openShortcuts = useUIStore((s) => s.openShortcuts);

  return (
    <footer className={className}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Qrius
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link
                to="/terms"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/cookies"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
          <button
            onClick={openShortcuts}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Keyboard className="w-4 h-4" />
            <span className="hidden sm:inline">Shortcuts</span>
            <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg font-medium">?</kbd>
          </button>
        </div>
      </div>
    </footer>
  );
}
