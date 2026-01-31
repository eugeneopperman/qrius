import { QrCode, Sun, Moon, History, Sparkles } from 'lucide-react';
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

const typeColors: Record<QRCodeType, string> = {
  url: 'from-blue-500 to-indigo-500',
  text: 'from-gray-500 to-slate-500',
  email: 'from-red-500 to-pink-500',
  phone: 'from-green-500 to-emerald-500',
  sms: 'from-cyan-500 to-teal-500',
  wifi: 'from-violet-500 to-purple-500',
  vcard: 'from-orange-500 to-amber-500',
  event: 'from-rose-500 to-red-500',
  location: 'from-lime-500 to-green-500',
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
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Subtle gradient accent at top */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <QrCode className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Qrius
                </h1>
                <span className={`hidden sm:inline-flex px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r ${typeColors[activeType]} text-white rounded-full shadow-sm`}>
                  {typeLabels[activeType]}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                QR Code Generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onHistoryClick}
              className="relative p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="View history"
            >
              <History className="w-5 h-5" />
              {historyCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse-subtle">
                  {historyCount > 9 ? '9+' : historyCount}
                </span>
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
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
