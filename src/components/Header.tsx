import { QrCode, Sun, Moon, History, Palette, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useHistoryStore } from '../stores/historyStore';
import { useThemeStore } from '../stores/themeStore';
import { useQRStore } from '../stores/qrStore';
import { useTemplateStore } from '../stores/templateStore';
import { LanguageSelector } from './ui/LanguageSelector';
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
  onSettingsClick?: () => void;
}

export function Header({ onHistoryClick, onSettingsClick }: HeaderProps) {
  const { t } = useTranslation();
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';
  const historyCount = useHistoryStore((state) => state.entries.length);
  const activeType = useQRStore((state) => state.activeType);
  const templateCount = useTemplateStore((state) => state.templates.length);
  const openWizard = useTemplateStore((state) => state.openWizard);

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-sm">
              <QrCode className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Qrius
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('app.tagline', 'QR Generator')}
              </p>
            </div>
          </div>

          {/* Center - Active type pill and Templates button */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="px-4 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded-full">
              {t(`qrTypes.${activeType}`, typeLabels[activeType])}
            </span>
            <button
              onClick={() => openWizard()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full transition-colors"
              aria-label={t('nav.templates', 'Templates')}
            >
              <Palette className="w-3.5 h-3.5" />
              Templates
              {templateCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 text-[10px] bg-indigo-600 dark:bg-indigo-500 text-white rounded-full">
                  {templateCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <LanguageSelector />
            <button
              onClick={onHistoryClick}
              className="relative p-2.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
              aria-label={t('nav.history', 'View history')}
            >
              <History className="w-5 h-5" />
              {historyCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-[10px] font-semibold bg-orange-500 text-white rounded-full flex items-center justify-center">
                  {historyCount > 9 ? '9+' : historyCount}
                </span>
              )}
            </button>
            <button
              onClick={onSettingsClick}
              className="p-2.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
              aria-label={t('nav.settings', 'Settings')}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
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
