import { useState, useRef, lazy, Suspense, useMemo, useCallback, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Header } from '../components/Header';
import { WizardContainer } from '../components/wizard';
import { KeyboardShortcutsModal } from '../components/features/KeyboardShortcuts';
import { HistoryModal } from '../components/features/History';
import { TemplateWizardModal } from '../components/templates';
import { SettingsModal } from '../components/settings';
import { ToastContainer } from '../components/ui/Toast';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useThemeStore } from '../stores/themeStore';
import { useWizardStore } from '../stores/wizardStore';
import { useTemplateStore } from '../stores/templateStore';
import { useAuthStore } from '../stores/authStore';
import { toast } from '../stores/toastStore';
import { ScanLine, Keyboard, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import type { QRPreviewHandle } from '../components/QRPreview';

// Lazy load QR Reader for code splitting
const QRReader = lazy(() => import('../components/features/QRReader').then(m => ({ default: m.QRReader })));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );
}

export default function HomePage() {
  const [showReader, setShowReader] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const qrPreviewRef = useRef<QRPreviewHandle | null>(null);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const currentStep = useWizardStore((state) => state.currentStep);
  const { hasMigrated, migrateFromBrandKits, openWizard } = useTemplateStore();
  const { user } = useAuthStore();

  // Migrate from BrandKits on first load
  useEffect(() => {
    if (!hasMigrated) {
      const migratedCount = migrateFromBrandKits();
      if (migratedCount > 0) {
        toast.success(`Migrated ${migratedCount} brand kit${migratedCount > 1 ? 's' : ''} to templates`);
      }
    }
  }, [hasMigrated, migrateFromBrandKits]);

  // Memoized callbacks for keyboard shortcuts to prevent unnecessary re-renders
  const handleDownload = useCallback(() => {
    qrPreviewRef.current?.download();
  }, []);

  const handleDownloadWithPicker = useCallback(() => {
    qrPreviewRef.current?.showFormatPicker();
  }, []);

  const handleCopy = useCallback(() => {
    qrPreviewRef.current?.copy();
  }, []);

  const handleShowShortcuts = useCallback(() => {
    setShowShortcuts(true);
  }, []);

  const handleOpenReader = useCallback(() => {
    setShowReader(true);
  }, []);

  const handleOpenHistory = useCallback(() => {
    setShowHistory(true);
  }, []);

  const handleOpenTemplates = useCallback(() => {
    openWizard();
  }, [openWizard]);

  // Memoize the callbacks object to prevent useKeyboardShortcuts from re-running on every render
  const keyboardCallbacks = useMemo(() => ({
    onDownload: handleDownload,
    onDownloadWithPicker: handleDownloadWithPicker,
    onCopy: handleCopy,
    onToggleDarkMode: toggleTheme,
    onShowHelp: handleShowShortcuts,
    onOpenReader: handleOpenReader,
    onOpenHistory: handleOpenHistory,
    onOpenTemplates: handleOpenTemplates,
  }), [
    handleDownload,
    handleDownloadWithPicker,
    handleCopy,
    toggleTheme,
    handleShowShortcuts,
    handleOpenReader,
    handleOpenHistory,
    handleOpenTemplates,
  ]);

  // Keyboard shortcuts
  useKeyboardShortcuts(keyboardCallbacks);

  const handlePreviewRef = (ref: React.RefObject<QRPreviewHandle | null>) => {
    qrPreviewRef.current = ref.current;
  };

  return (
    <div className="min-h-screen transition-colors">
      <Header
        onHistoryClick={() => setShowHistory(true)}
        onSettingsClick={() => setShowSettings(true)}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CTA for unauthenticated users */}
        {!user && (
          <div className="mb-8 p-6 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Track your QR code scans</h2>
                <p className="text-orange-100">
                  Create an account to get analytics, track scans, and manage your QR codes.
                </p>
              </div>
              <Link
                to="/signup"
                className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors whitespace-nowrap"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        <ErrorBoundary>
          <WizardContainer onPreviewRef={handlePreviewRef} />
        </ErrorBoundary>

        {/* QR Reader - Collapsible section */}
        {currentStep !== 1 && currentStep !== 4 && (
          <div className="mt-8">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setShowReader(!showReader)}
            >
              <ScanLine className="w-4 h-4" />
              {showReader ? 'Hide QR Reader' : 'Scan Existing QR Code'}
            </Button>

            {showReader && (
              <div className="mt-4 card max-w-md">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                  QR Code Reader
                </h3>
                <ErrorBoundary minimal>
                  <Suspense fallback={<LoadingSpinner />}>
                    <QRReader />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-header mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Qrius - {user ? 'Your QR codes are saved' : 'All data processed locally'}
            </p>
            <button
              onClick={() => setShowShortcuts(true)}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Keyboard className="w-4 h-4" />
              <span className="hidden sm:inline">Shortcuts</span>
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg font-medium">?</kbd>
            </button>
          </div>
        </div>
      </footer>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />

      {/* Template Wizard Modal */}
      <TemplateWizardModal />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
