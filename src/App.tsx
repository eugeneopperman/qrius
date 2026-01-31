import { useState, useRef, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { TypeSelector } from './components/TypeSelector';
import { InputForm } from './components/InputForm';
import { QRPreview, type QRPreviewHandle } from './components/QRPreview';
import { ColorSection } from './components/customization/ColorSection';
import { LogoSection } from './components/customization/LogoSection';
import { StyleSection } from './components/customization/StyleSection';
import { FrameSection } from './components/customization/FrameSection';
import { AccordionItem } from './components/ui/Accordion';
import { ScannabilityScore } from './components/features/ScannabilityScore';
import { BrandKitManager } from './components/features/BrandKit';
import { KeyboardShortcutsModal } from './components/features/KeyboardShortcuts';
import { PrintTemplates } from './components/features/PrintTemplates';
import { HistoryModal } from './components/features/History';
import { SmartPresets } from './components/features/SmartPresets';
import { ToastContainer } from './components/ui/Toast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useThemeStore } from './stores/themeStore';
import { Palette, Image, Shapes, Frame, ScanLine, Bookmark, Keyboard, Printer, Sparkles } from 'lucide-react';
import { Button } from './components/ui/Button';
import { FloatingAction } from './components/ui/FloatingAction';

// Lazy load QR Reader for code splitting
const QRReader = lazy(() => import('./components/features/QRReader').then(m => ({ default: m.QRReader })));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}

function App() {
  const [showReader, setShowReader] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const qrPreviewRef = useRef<QRPreviewHandle>(null);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onDownload: () => qrPreviewRef.current?.download(),
    onDownloadWithPicker: () => qrPreviewRef.current?.showFormatPicker(),
    onCopy: () => qrPreviewRef.current?.copy(),
    onToggleDarkMode: toggleTheme,
    onShowHelp: () => setShowShortcuts(true),
    onOpenReader: () => setShowReader(true),
    onOpenHistory: () => setShowHistory(true),
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header onHistoryClick={() => setShowHistory(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Type Selector */}
        <div className="mb-8">
          <TypeSelector />
        </div>

        {/* Main Content - Mobile: Preview first, Desktop: Side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Column - Shows first on mobile via order */}
          <div className="space-y-6 order-first lg:order-last">
            {/* Preview */}
            <div className="lg:sticky lg:top-8">
              <div className="card">
                <h2 className="section-title mb-4 text-center">Preview</h2>
                <QRPreview ref={qrPreviewRef} />
              </div>

              {/* Scannability Score - Hidden on mobile to reduce clutter */}
              <div className="mt-6 hidden sm:block">
                <ScannabilityScore />
              </div>

              {/* QR Reader Toggle - Hidden on mobile */}
              <div className="mt-6 hidden lg:block">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowReader(!showReader)}
                >
                  <ScanLine className="w-4 h-4" />
                  {showReader ? 'Hide QR Reader' : 'Scan QR Code'}
                </Button>

                {showReader && (
                  <div className="mt-4 card">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                      QR Code Reader
                    </h3>
                    <Suspense fallback={<LoadingSpinner />}>
                      <QRReader />
                    </Suspense>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Forms Column - Shows second on mobile */}
          <div className="space-y-6 order-last lg:order-first">
            <InputForm />

            {/* Customization */}
            <div className="card">
              <h2 className="section-title mb-2">Customization</h2>

              {/* Essential Options */}
              <div className="mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium px-1 mb-2">
                  Essentials
                </p>
                <AccordionItem
                  title="Smart Presets"
                  icon={<Sparkles className="w-5 h-5" />}
                  defaultOpen={false}
                >
                  <SmartPresets />
                </AccordionItem>

                <AccordionItem
                  title="Colors"
                  icon={<Palette className="w-5 h-5" />}
                  defaultOpen={true}
                >
                  <ColorSection />
                </AccordionItem>

                <AccordionItem
                  title="Logo"
                  icon={<Image className="w-5 h-5" />}
                >
                  <LogoSection />
                </AccordionItem>
              </div>

              {/* Advanced Options */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium px-1 mb-2 mt-2">
                  Advanced
                </p>
                <AccordionItem
                  title="Style"
                  icon={<Shapes className="w-5 h-5" />}
                >
                  <StyleSection />
                </AccordionItem>

                <AccordionItem
                  title="Frame & Label"
                  icon={<Frame className="w-5 h-5" />}
                >
                  <FrameSection />
                </AccordionItem>

                <AccordionItem
                  title="Brand Kits"
                  icon={<Bookmark className="w-5 h-5" />}
                >
                  <BrandKitManager />
                </AccordionItem>

                <AccordionItem
                  title="Print Templates"
                  icon={<Printer className="w-5 h-5" />}
                >
                  <PrintTemplates />
                </AccordionItem>
              </div>
            </div>

            {/* Mobile-only: Scannability and QR Reader */}
            <div className="sm:hidden">
              <ScannabilityScore />
            </div>

            <div className="lg:hidden">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowReader(!showReader)}
              >
                <ScanLine className="w-4 h-4" />
                {showReader ? 'Hide QR Reader' : 'Scan QR Code'}
              </Button>

              {showReader && (
                <div className="mt-4 card">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                    QR Code Reader
                  </h3>
                  <Suspense fallback={<LoadingSpinner />}>
                    <QRReader />
                  </Suspense>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Download Button - Mobile only */}
      <FloatingAction onClick={() => qrPreviewRef.current?.showFormatPicker()} />

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-16 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Internal QR Code Generator - All data processed locally
            </p>
            <button
              onClick={() => setShowShortcuts(true)}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Keyboard className="w-4 h-4" />
              <span className="hidden sm:inline">Shortcuts</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">?</kbd>
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

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;
