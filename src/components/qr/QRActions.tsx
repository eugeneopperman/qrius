import { useState, useRef, useEffect } from 'react';
import { Download, Copy, Check, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProBadge } from '../ui/ProBadge';
import { toast } from '@/stores/toastStore';
import { usePlanGate } from '@/hooks/usePlanGate';
import { generateIllustratorSVG, downloadSVG } from '@/utils/qrSvgGenerator';
import { rasterizeQRToBlob, downloadBlob } from '@/utils/qrDownloadHelper';
import type { QRStyleOptions } from '@/types';
import type QRCodeStyling from 'qr-code-styling';

interface QRActionsProps {
  qrCodeRef: React.MutableRefObject<QRCodeStyling | null>;
  styleOptions: QRStyleOptions;
  processedLogoUrl: string | undefined;
  onSaveToHistory: () => void;
}

export function QRActions({
  qrCodeRef,
  styleOptions,
  processedLogoUrl,
  onSaveToHistory,
}: QRActionsProps) {
  const [copied, setCopied] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { canUse } = usePlanGate();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const handleDownload = async (format: 'png' | 'svg' | 'jpeg' = 'png') => {
    if (!qrCodeRef.current) return;

    try {
      if (format === 'svg') {
        // Use custom SVG generator for Illustrator-ready output
        const qrInstance = qrCodeRef.current as unknown as {
          _qr?: { getModuleCount: () => number; isDark: (row: number, col: number) => boolean };
        };

        if (!qrInstance._qr) {
          // Fallback to built-in export if internal QR not accessible
          await qrCodeRef.current.download({
            name: 'qrcode',
            extension: 'svg',
          });
        } else {
          const svgString = await generateIllustratorSVG({
            qrMatrix: qrInstance._qr,
            size: 280,
            margin: 10,
            styleOptions,
            processedLogoUrl,
          });
          downloadSVG(svgString, 'qrcode');
        }
        toast.success('SVG downloaded (Illustrator ready)');
      } else {
        // PNG/JPEG: use robust rasterization (avoids library's btoa bug)
        const blob = await rasterizeQRToBlob(
          qrCodeRef.current,
          format,
          format === 'jpeg' ? 0.92 : undefined,
        );
        downloadBlob(blob, `qrcode.${format}`);
        toast.success(`QR code downloaded as ${format.toUpperCase()}`);
      }
      onSaveToHistory();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Download failed:', error);
      const detail = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to download QR code: ${detail}`);
    }
    setShowFormatMenu(false);
  };

  const handlePdfDownload = async () => {
    if (!qrCodeRef.current) return;

    setIsDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const blob = await rasterizeQRToBlob(qrCodeRef.current);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Create A4 PDF with QR code centered
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const qrSize = 80; // 80mm QR code
      const x = (pageWidth - qrSize) / 2;
      const y = (pageHeight - qrSize) / 2;

      pdf.addImage(dataUrl, 'PNG', x, y, qrSize, qrSize);
      pdf.save('qrcode.pdf');
      toast.success('QR code downloaded as PDF');
      setIsDownloading(false);

      onSaveToHistory();
    } catch (error) {
      if (import.meta.env.DEV) console.error('PDF download failed:', error);
      const detail = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to generate PDF: ${detail}`);
      setIsDownloading(false);
    }
    setShowFormatMenu(false);
  };

  const handleCopy = async () => {
    if (!qrCodeRef.current) return;

    try {
      const blob = await rasterizeQRToBlob(qrCodeRef.current);
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
      toast.success('QR code copied to clipboard');
      onSaveToHistory();
    } catch {
      toast.error('Failed to copy to clipboard. Your browser may not support this feature.');
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="relative">
          <Button
            variant="primary"
            size="md"
            aria-haspopup="menu"
            aria-expanded={showFormatMenu}
            aria-controls="download-format-menu"
            disabled={isDownloading}
            onClick={() => setShowFormatMenu(!showFormatMenu)}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="w-4 h-4" aria-hidden="true" />
            )}
            {isDownloading ? 'Generating...' : 'Download'}
            {!isDownloading && <ChevronDown className="w-4 h-4" aria-hidden="true" />}
            {!isDownloading && (
              <kbd className="hidden lg:inline-flex ml-1 px-1.5 py-0.5 text-[10px] bg-indigo-700 rounded text-indigo-200">
                S
              </kbd>
            )}
          </Button>

          {showFormatMenu && (
            <div
              id="download-format-menu"
              role="menu"
              aria-label="Download format options"
              className="absolute top-full left-0 mt-1 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[160px] z-10"
            >
              <button
                role="menuitem"
                onClick={() => handleDownload('png')}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[44px]"
              >
                PNG (High Quality)
              </button>
              <button
                role="menuitem"
                onClick={() => canUse('svg_download') ? handleDownload('svg') : undefined}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[44px] flex items-center justify-between"
                disabled={!canUse('svg_download')}
              >
                <span className={!canUse('svg_download') ? 'opacity-50' : ''}>SVG (Illustrator Ready)</span>
                {!canUse('svg_download') && <ProBadge />}
              </button>
              <button
                role="menuitem"
                onClick={() => handleDownload('jpeg')}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[44px]"
              >
                JPEG (Compressed)
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" role="separator" />
              <button
                role="menuitem"
                onClick={() => canUse('pdf_download') ? handlePdfDownload() : undefined}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[44px] flex items-center justify-between"
                disabled={!canUse('pdf_download')}
              >
                <span className={!canUse('pdf_download') ? 'opacity-50' : ''}>PDF (Print Ready)</span>
                {!canUse('pdf_download') && <ProBadge />}
              </button>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="md"
          onClick={handleCopy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy QR code to clipboard'}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" aria-hidden="true" />
              Copy
              <kbd className="hidden lg:inline-flex ml-1 px-1.5 py-0.5 text-[10px] bg-gray-200 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400">
                C
              </kbd>
            </>
          )}
        </Button>
      </div>

      {/* Close dropdown when clicking outside */}
      {showFormatMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowFormatMenu(false)}
        />
      )}
    </>
  );
}
