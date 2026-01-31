import { QrCode, Sun, Moon, History } from 'lucide-react';
import { useHistoryStore } from '../stores/historyStore';
import { useThemeStore } from '../stores/themeStore';
import { useQRStore } from '../stores/qrStore';
import type { QRCodeType } from '../types';

const typeLabels: Record<QRCodeType, string> = {
  url: 'URL',
  text: 'Text',
  email: 'Email',
  phone: 'Phone',
  sms: 'SMS',
  wifi: 'WiFi',
  vcard: 'vCard',
  event: 'Event',
  location: 'Location',
};

interface HeaderProps {
  onHistoryClick?: () => void;
}

export function Header({ onHistoryClick }: HeaderProps) {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';
  const historyCount = useHistoryStore((state) => state.entries.length);
  const activeType = useQRStore((state) => state.activeType);

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <QrCode className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  QR Code Generator
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full">
                  {typeLabels[activeType]}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Internal Tool
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onHistoryClick}
              className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
              aria-label="View history"
            >
              <History className="w-5 h-5" />
              {historyCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-medium bg-indigo-600 text-white rounded-full flex items-center justify-center">
                  {historyCount > 9 ? '9+' : historyCount}
                </span>
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
