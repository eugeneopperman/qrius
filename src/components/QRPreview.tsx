import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { useQRStore } from '../stores/qrStore';
import { useHistoryStore } from '../stores/historyStore';
import { Download, Copy, Check, ChevronDown } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';
import { applyLogoMask } from '../utils/logoMask';
import type { GradientOptions } from '../types';

export interface QRPreviewHandle {
  download: () => void;
  copy: () => void;
  showFormatPicker: () => void;
}

export const QRPreview = forwardRef<QRPreviewHandle>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [processedLogoUrl, setProcessedLogoUrl] = useState<string | undefined>(undefined);
  const { getQRValue, styleOptions, activeType, getCurrentData } = useQRStore();
  const { addEntry, updateThumbnail } = useHistoryStore();

  const qrValue = getQRValue();

  // Process logo with shape mask when logo or shape changes
  useEffect(() => {
    if (!styleOptions.logoUrl) {
      setProcessedLogoUrl(undefined);
      return;
    }

    const shape = styleOptions.logoShape || 'square';

    // Only apply mask for non-square shapes
    if (shape === 'square') {
      setProcessedLogoUrl(styleOptions.logoUrl);
      return;
    }

    applyLogoMask(styleOptions.logoUrl, shape)
      .then(setProcessedLogoUrl)
      .catch((error) => {
        console.error('Failed to apply logo mask:', error);
        setProcessedLogoUrl(styleOptions.logoUrl);
      });
  }, [styleOptions.logoUrl, styleOptions.logoShape]);

  // Convert gradient options to qr-code-styling format
  const getGradientConfig = useCallback((gradient: GradientOptions) => {
    return {
      type: gradient.type,
      rotation: gradient.rotation || 0,
      colorStops: gradient.colorStops.map((stop) => ({
        offset: stop.offset,
        color: stop.color,
      })),
    };
  }, []);

  // Build dots options with or without gradient
  const dotsOptions = useMemo(() => {
    const base = { type: styleOptions.dotsType };
    if (styleOptions.useGradient && styleOptions.gradient) {
      return { ...base, gradient: getGradientConfig(styleOptions.gradient) };
    }
    return { ...base, color: styleOptions.dotsColor };
  }, [styleOptions.dotsType, styleOptions.useGradient, styleOptions.gradient, styleOptions.dotsColor, getGradientConfig]);

  // Build corners options with or without gradient
  const cornersSquareOptions = useMemo(() => {
    const base = { type: styleOptions.cornersSquareType };
    if (styleOptions.useGradient && styleOptions.gradient) {
      return { ...base, gradient: getGradientConfig(styleOptions.gradient) };
    }
    return { ...base, color: styleOptions.dotsColor };
  }, [styleOptions.cornersSquareType, styleOptions.useGradient, styleOptions.gradient, styleOptions.dotsColor, getGradientConfig]);

  const cornersDotOptions = useMemo(() => {
    const base = { type: styleOptions.cornersDotType };
    if (styleOptions.useGradient && styleOptions.gradient) {
      return { ...base, gradient: getGradientConfig(styleOptions.gradient) };
    }
    return { ...base, color: styleOptions.dotsColor };
  }, [styleOptions.cornersDotType, styleOptions.useGradient, styleOptions.gradient, styleOptions.dotsColor, getGradientConfig]);

  // Save to history with thumbnail
  const saveToHistory = useCallback(async () => {
    const currentData = getCurrentData();

    // Add entry first (without thumbnail for speed)
    addEntry({
      type: activeType,
      data: currentData,
      styleOptions: { ...styleOptions },
      qrValue,
    });

    // Generate thumbnail asynchronously
    if (qrCodeRef.current) {
      try {
        const blob = await qrCodeRef.current.getRawData('png');
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            // Get the most recent entry and update its thumbnail
            const entries = useHistoryStore.getState().entries;
            if (entries.length > 0) {
              updateThumbnail(entries[0].id, base64);
            }
          };
          reader.readAsDataURL(blob);
        }
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
      }
    }
  }, [activeType, getCurrentData, styleOptions, qrValue, addEntry, updateThumbnail]);

  // Initialize QR code
  useEffect(() => {
    qrCodeRef.current = new QRCodeStyling({
      width: 280,
      height: 280,
      type: 'svg',
      data: qrValue,
      dotsOptions,
      cornersSquareOptions,
      cornersDotOptions,
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
      image: processedLogoUrl,
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
        dotsOptions,
        cornersSquareOptions,
        cornersDotOptions,
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
        image: processedLogoUrl || undefined,
      });
    }
  }, [qrValue, styleOptions, dotsOptions, cornersSquareOptions, cornersDotOptions, processedLogoUrl]);

  const handleDownload = async (format: 'png' | 'svg' | 'jpeg' = 'png') => {
    if (qrCodeRef.current) {
      await qrCodeRef.current.download({
        name: 'qrcode',
        extension: format,
      });
      // Save to history after download
      saveToHistory();
    }
    setShowFormatMenu(false);
  };

  const handlePdfDownload = async () => {
    if (!qrCodeRef.current) return;

    try {
      const { jsPDF } = await import('jspdf');
      const blob = await qrCodeRef.current.getRawData('png');
      if (!blob) return;

      // Convert blob to data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;

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
      };
      reader.readAsDataURL(blob);

      // Save to history
      saveToHistory();
    } catch (error) {
      console.error('Failed to generate PDF:', error);
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
          // Save to history after copy
          saveToHistory();
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
    showFormatPicker: () => setShowFormatMenu(true),
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

        {/* Fallback URL Display */}
        {styleOptions.showFallbackUrl && qrValue && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center break-all max-w-[280px]">
              {qrValue.length > 100 ? `${qrValue.substring(0, 100)}...` : qrValue}
            </p>
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
            <div className="absolute top-full left-0 mt-1 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[160px] z-10">
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
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              <button
                onClick={handlePdfDownload}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                PDF (Print Ready)
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
