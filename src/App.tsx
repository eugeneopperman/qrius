import { useState, useRef, useCallback } from 'react';
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
import { QRReader } from './components/features/QRReader';
import { BrandKitManager } from './components/features/BrandKit';
import { KeyboardShortcutsModal } from './components/features/KeyboardShortcuts';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Palette, Image, Shapes, Frame, ScanLine, Bookmark, Keyboard } from 'lucide-react';
import { Button } from './components/ui/Button';

function App() {
  const [showReader, setShowReader] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const qrPreviewRef = useRef<QRPreviewHandle>(null);

  const toggleDarkMode = useCallback(() => {
    document.documentElement.classList.toggle('dark');
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onDownload: () => qrPreviewRef.current?.download(),
    onCopy: () => qrPreviewRef.current?.copy(),
    onToggleDarkMode: toggleDarkMode,
    onShowHelp: () => setShowShortcuts(true),
    onOpenReader: () => setShowReader(true),
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Type Selector */}
        <div className="mb-8">
          <TypeSelector />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            <InputForm />

            {/* Customization */}
            <div className="card">
              <h2 className="section-title mb-2">Customization</h2>

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
            </div>
          </div>

          {/* Right Column - Preview & Tools */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="lg:sticky lg:top-8">
              <div className="card">
                <h2 className="section-title mb-4 text-center">Preview</h2>
                <QRPreview ref={qrPreviewRef} />
              </div>

              {/* Scannability Score */}
              <div className="mt-6">
                <ScannabilityScore />
              </div>

              {/* QR Reader Toggle */}
              <div className="mt-6">
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
                    <QRReader />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-16">
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
    </div>
  );
}

export default App;
