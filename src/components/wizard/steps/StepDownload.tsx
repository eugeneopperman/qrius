import { useRef, useState, useEffect } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import { QRPreview, type QRPreviewHandle } from '@/components/QRPreview';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Download, Copy, RotateCcw, Check, Settings2 } from 'lucide-react';

export function StepDownload() {
  const { prevStep, reset } = useWizardStore();
  const qrPreviewRef = useRef<QRPreviewHandle>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleQuickDownload = () => {
    qrPreviewRef.current?.download();
    setDownloadSuccess(true);
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handleCopy = () => {
    qrPreviewRef.current?.copy();
  };

  const handleShowFormatPicker = () => {
    qrPreviewRef.current?.showFormatPicker();
  };

  const handleCreateAnother = () => {
    reset();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
          Your QR code is ready!
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Download or share your QR code
        </p>
      </div>

      {/* Large QR Preview */}
      <div className="card mb-6 p-8">
        <div className="max-w-[300px] mx-auto">
          <QRPreview ref={qrPreviewRef} />
        </div>
      </div>

      {/* Primary Download Button */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button
          variant="primary"
          size="lg"
          className="flex-1 py-4 text-lg bg-orange-500 hover:bg-orange-600"
          onClick={handleQuickDownload}
        >
          {downloadSuccess ? (
            <>
              <Check className="w-5 h-5" />
              Downloaded!
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Quick Download (PNG)
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="py-4"
          onClick={handleShowFormatPicker}
        >
          <Settings2 className="w-5 h-5" />
          More Formats
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <Button variant="secondary" onClick={handleCopy}>
          <Copy className="w-4 h-4" />
          Copy to Clipboard
        </Button>

        <Button variant="secondary" onClick={handleCreateAnother}>
          <RotateCcw className="w-4 h-4" />
          Create Another
        </Button>
      </div>

      {/* Back button */}
      <div className="text-center">
        <Button variant="ghost" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" />
          Back to customize
        </Button>
      </div>
    </div>
  );
}
