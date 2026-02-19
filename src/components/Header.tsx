import { QrCode, Sun, Moon, Palette, LogIn, MoreVertical, Clock, Settings, Keyboard } from 'lucide-react';
import { useHistoryStore } from '../stores/historyStore';
import { useThemeStore } from '../stores/themeStore';
import { useTemplateStore } from '../stores/templateStore';
import { useAuthStore } from '../stores/authStore';
import { Dropdown } from './ui/Dropdown';
import { UserButton } from './auth/UserButton';
import { AuthModal } from './auth/AuthModal';
import { useState } from 'react';

interface HeaderProps {
  onHistoryClick?: () => void;
  onSettingsClick?: () => void;
  onShortcutsClick?: () => void;
}

function OverflowMenuItem({
  icon: Icon,
  label,
  badge,
  kbd,
  onClick,
  className,
}: {
  icon: typeof Clock;
  label: string;
  badge?: number;
  kbd?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className ?? ''}`}
    >
      <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      <span className="flex-1 text-left">{label}</span>
      {badge != null && badge > 0 && (
        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-orange-500 text-white rounded-full">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      {kbd && (
        <kbd className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded font-medium">
          {kbd}
        </kbd>
      )}
    </button>
  );
}

export function Header({ onHistoryClick, onSettingsClick, onShortcutsClick }: HeaderProps) {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';
  const historyCount = useHistoryStore((state) => state.entries.length);
  const templateCount = useTemplateStore((state) => state.templates.length);
  const openWizard = useTemplateStore((state) => state.openWizard);
  const { user, isInitialized } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT: Logo + brand name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-sm">
              <QrCode className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Qrius
            </h1>
          </div>

          {/* RIGHT: Templates (desktop), Theme toggle, Overflow menu, Auth */}
          <div className="flex items-center gap-1">
            {/* Templates button — desktop only */}
            <button
              onClick={() => openWizard()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full transition-colors"
              aria-label="Templates"
            >
              <Palette className="w-3.5 h-3.5" />
              Templates
              {templateCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 text-[10px] bg-indigo-600 dark:bg-indigo-500 text-white rounded-full">
                  {templateCount}
                </span>
              )}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Overflow menu */}
            <Dropdown
              align="right"
              trigger={({ toggle }) => (
                <button
                  onClick={toggle}
                  className="p-2.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                  aria-label="More options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              )}
            >
              {({ close }) => (
                <div className="w-56 py-1 max-h-[calc(100vh-5rem)] overflow-y-auto">
                  {/* Templates — mobile only */}
                  <div className="sm:hidden">
                    <OverflowMenuItem
                      icon={Palette}
                      label="Templates"
                      badge={templateCount}
                      onClick={() => { close(); openWizard(); }}
                    />
                  </div>

                  <OverflowMenuItem
                    icon={Clock}
                    label="History"
                    badge={historyCount}
                    onClick={() => { close(); onHistoryClick?.(); }}
                  />

                  <OverflowMenuItem
                    icon={Settings}
                    label="Settings"
                    onClick={() => { close(); onSettingsClick?.(); }}
                  />

                  <OverflowMenuItem
                    icon={Keyboard}
                    label="Shortcuts"
                    kbd="?"
                    onClick={() => { close(); onShortcutsClick?.(); }}
                  />
                </div>
              )}
            </Dropdown>

            {/* Auth section */}
            {isInitialized && (
              user ? (
                <UserButton onSettingsClick={onSettingsClick} />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="ml-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  );
}
