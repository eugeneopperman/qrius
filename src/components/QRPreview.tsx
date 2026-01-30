import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { useQRStore } from '../stores/qrStore';
import { Download, Copy, Check, ChevronDown } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

export interface QRPreviewHandle {
  download: () => void;
  copy: () => void;
}

export const QRPreview = forwardRef<QRPreviewHandle>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const { getQRValue, styleOptions } = useQRStore();

  const qrValue = getQRValue();

  // Initialize QR code
  useEffect(() => {
    qrCodeRef.current = new QRCodeStyling({
      width: 280,
      height: 280,
      type: 'svg',
      data: qrValue,
      dotsOptions: {
        color: styleOptions.dotsColor,
        type: styleOptions.dotsType,
      },
      cornersSquareOptions: {
        color: styleOptions.dotsColor,
        type: styleOptions.cornersSquareType,
      },
      cornersDotOptions: {
        color: styleOptions.dotsColor,
        type: styleOptions.cornersDotType,
      },
      backgroundOptions: {
        color: styleOptions.backgroundColor,
      },
      qrOptions: {
        errorCorrectionLevel: styleOptions.errorCorrectionLevel,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10,
        imageSize: styleOptions.logoSize || 0.3,
      },
      image: styleOptions.logoUrl,
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      qrCodeRef.current.append(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // Update QR code when options change
  useEffect(() => {
    if (qrCodeRef.current) {
      qrCodeRef.current.update({
        data: qrValue,
        dotsOptions: {
          color: styleOptions.dotsColor,
          type: styleOptions.dotsType,
        },
        cornersSquareOptions: {
          color: styleOptions.dotsColor,
          type: styleOptions.cornersSquareType,
        },
        cornersDotOptions: {
          color: styleOptions.dotsColor,
          type: styleOptions.cornersDotType,
        },
        backgroundOptions: {
          color: styleOptions.backgroundColor,
        },
        qrOptions: {
          errorCorrectionLevel: styleOptions.errorCorrectionLevel,
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 10,
          imageSize: styleOptions.logoSize || 0.3,
        },
        image: styleOptions.logoUrl || undefined,
      });
    }
  }, [qrValue, styleOptions]);

  const handleDownload = async (format: 'png' | 'svg' | 'jpeg' = 'png') => {
    if (qrCodeRef.current) {
      await qrCodeRef.current.download({
        name: 'qrcode',
        extension: format,
      });
    }
    setShowFormatMenu(false);
  };

  const handleCopy = async () => {
    if (qrCodeRef.current) {
      try {
        const blob = await qrCodeRef.current.getRawData('png');
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    download: () => handleDownload('png'),
    copy: handleCopy,
  }));

  const frameStyle = styleOptions.frameStyle || 'none';
  const frameLabel = styleOptions.frameLabel || '';

  const getFrameClasses = () => {
    switch (frameStyle) {
      case 'simple':
        return 'border-4 border-gray-800 dark:border-gray-200';
      case 'rounded':
        return 'border-4 border-gray-800 dark:border-gray-200 rounded-3xl';
      case 'bottom-label':
      case 'top-label':
      case 'badge':
        return 'border-4 border-gray-800 dark:border-gray-200 rounded-2xl';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* QR Code with Frame */}
      <div
        className={cn(
          'relative p-6 bg-white dark:bg-gray-800 shadow-lg transition-all',
          frameStyle === 'none'
            ? 'rounded-2xl border border-gray-200 dark:border-gray-700'
            : getFrameClasses()
        )}
      >
        {/* Top Label */}
        {frameStyle === 'top-label' && frameLabel && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-sm font-semibold rounded-full whitespace-nowrap">
            {frameLabel}
          </div>
        )}

        {/* Badge Style Top */}
        {frameStyle === 'badge' && frameLabel && (
          <div className="text-center mb-3 text-gray-800 dark:text-gray-200 font-bold text-sm uppercase tracking-wider">
            {frameLabel}
          </div>
        )}

        <div
          ref={containerRef}
          className="flex items-center justify-center"
          style={{ minWidth: 280, minHeight: 280 }}
        />

        {/* Bottom Label */}
        {frameStyle === 'bottom-label' && frameLabel && (
          <div className="mt-3 text-center text-gray-800 dark:text-gray-200 font-semibold text-sm">
            {frameLabel}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="relative">
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowFormatMenu(!showFormatMenu)}
          >
            <Download className="w-4 h-4" />
            Download
            <ChevronDown className="w-4 h-4" />
          </Button>

          {showFormatMenu && (
            <div className="absolute top-full left-0 mt-1 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[140px] z-10">
              <button
                onClick={() => handleDownload('png')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                PNG (High Quality)
              </button>
              <button
                onClick={() => handleDownload('svg')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                SVG (Vector)
              </button>
              <button
                onClick={() => handleDownload('jpeg')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                JPEG (Compressed)
              </button>
            </div>
          )}
        </div>

        <Button variant="ghost" size="md" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
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
    </div>
  );
});

QRPreview.displayName = 'QRPreview';
