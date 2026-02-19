import { useRef, useMemo, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { Header } from '@/components/Header';
import { WizardContainer } from '@/components/wizard';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useThemeStore } from '@/stores/themeStore';
import { useTemplateStore } from '@/stores/templateStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { ArrowRight } from 'lucide-react';
import type { QRPreviewHandle } from '@/components/QRPreview';

export default function HomePage() {
  const qrPreviewRef = useRef<QRPreviewHandle | null>(null);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { openWizard } = useTemplateStore();
  const { user } = useAuthStore();
  const { openShortcuts, openHistory, openSettings } = useUIStore();

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

  const handleOpenTemplates = useCallback(() => {
    openWizard();
  }, [openWizard]);

  // Memoize the callbacks object to prevent useKeyboardShortcuts from re-running on every render
  const keyboardCallbacks = useMemo(() => ({
    onDownload: handleDownload,
    onDownloadWithPicker: handleDownloadWithPicker,
    onCopy: handleCopy,
    onToggleDarkMode: toggleTheme,
    onShowHelp: openShortcuts,
    onOpenHistory: openHistory,
    onOpenTemplates: handleOpenTemplates,
  }), [
    handleDownload,
    handleDownloadWithPicker,
    handleCopy,
    toggleTheme,
    openShortcuts,
    openHistory,
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
        onHistoryClick={openHistory}
        onSettingsClick={openSettings}
        onShortcutsClick={openShortcuts}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

      </main>

      <PublicFooter />
    </div>
  );
}
