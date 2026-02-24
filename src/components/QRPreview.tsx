import { useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useQRStore } from '@/stores/qrStore';
import { useShallow } from 'zustand/react/shallow';
import { useHistoryStore } from '@/stores/historyStore';
import { Download, Copy, Check, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/utils/cn';
import {
  TopLabel, BadgeLabel, BottomLabel, BannerLabel, RibbonLabel,
  FallbackUrl, getFrameClasses, getFrameInlineStyles,
  SpeechBubblePointer, DecorativeCorners, MinimalLine,
} from './qr';
import { QR_CONFIG } from '@/config/constants';
import { useQRDownload } from '@/hooks/useQRDownload';
import { useQRCodeInstance } from '@/hooks/useQRCodeInstance';
import { usePlanGate } from '@/hooks/usePlanGate';
import { ProBadge } from './ui/ProBadge';

export interface QRPreviewHandle {
  download: () => void;
  copy: () => void;
  showFormatPicker: () => void;
}

interface QRPreviewProps {
  hideActions?: boolean;
  displaySize?: number;
  overrideData?: string;
}

export const QRPreview = forwardRef<QRPreviewHandle, QRPreviewProps>(({ hideActions, displaySize, overrideData }, ref) => {
  const frameContainerRef = useRef<HTMLDivElement>(null);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const { getQRValue, styleOptions, activeType, getCurrentData,
    urlData, textData, emailData, phoneData, smsData, wifiData, vcardData, eventData, locationData,
  } = useQRStore(useShallow((s) => ({
    getQRValue: s.getQRValue, styleOptions: s.styleOptions, activeType: s.activeType, getCurrentData: s.getCurrentData,
    urlData: s.urlData, textData: s.textData, emailData: s.emailData, phoneData: s.phoneData,
    smsData: s.smsData, wifiData: s.wifiData, vcardData: s.vcardData, eventData: s.eventData, locationData: s.locationData,
  })));
  const { addEntry, updateThumbnail } = useHistoryStore();

  const qrValue = getQRValue();

  // Check raw store data — getQRValue() returns fallback placeholders so it's always non-empty
  const hasContent = (() => {
    switch (activeType) {
      case 'url': return Boolean(urlData.url?.trim());
      case 'text': return Boolean(textData.text?.trim());
      case 'email': return Boolean(emailData.email?.trim());
      case 'phone': return Boolean(phoneData.phone?.trim());
      case 'sms': return Boolean(smsData.phone?.trim());
      case 'wifi': return Boolean(wifiData.ssid?.trim());
      case 'vcard': return Boolean(vcardData.firstName?.trim() || vcardData.lastName?.trim());
      case 'event': return Boolean(eventData.title?.trim());
      case 'location': return Boolean(locationData.latitude && locationData.longitude);
      default: return false;
    }
  })();

  const displayValue = hasContent ? (overrideData || qrValue) : QR_CONFIG.GHOST_DATA;

  // Calculate zoom factor for displaySize — zoom scales both visual AND layout
  const zoomFactor = displaySize ? displaySize / QR_CONFIG.SIZE : undefined;

  // QR code instance — handles logo, gradients, roundness, init/update/cleanup
  const { containerRef, qrCodeRef, processedLogoUrl } = useQRCodeInstance({
    data: displayValue,
    dotsType: styleOptions.dotsType,
    dotsColor: styleOptions.dotsColor,
    cornersSquareType: styleOptions.cornersSquareType,
    cornersDotType: styleOptions.cornersDotType,
    backgroundColor: styleOptions.backgroundColor,
    errorCorrectionLevel: styleOptions.errorCorrectionLevel,
    useGradient: styleOptions.useGradient,
    gradient: styleOptions.gradient,
    logoUrl: styleOptions.logoUrl,
    logoShape: styleOptions.logoShape,
    logoMargin: styleOptions.logoMargin,
    logoSize: styleOptions.logoSize,
    qrRoundness: styleOptions.qrRoundness,
    qrPattern: styleOptions.qrPattern,
  });

  // Save to history with thumbnail
  const saveToHistory = useCallback(async () => {
    const currentData = getCurrentData();

    // Extract tracking info if this is a URL type with tracking enabled
    let trackingId: string | undefined;
    let trackingShortCode: string | undefined;
    if (currentData.type === 'url' && currentData.data.trackingEnabled && currentData.data.trackingId) {
      trackingId = currentData.data.trackingId;
      trackingShortCode = currentData.data.trackingShortCode;
    }

    // Add entry first (without thumbnail for speed)
    addEntry({
      type: activeType,
      data: currentData,
      styleOptions: { ...styleOptions },
      qrValue,
      trackingId,
      trackingShortCode,
    });

    // Generate thumbnail asynchronously
    if (qrCodeRef.current) {
      try {
        const rawData = await qrCodeRef.current.getRawData('png');
        if (rawData && rawData instanceof Blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            const entries = useHistoryStore.getState().entries;
            if (entries.length > 0) {
              updateThumbnail(entries[0].id, base64);
            }
          };
          reader.readAsDataURL(rawData);
        }
      } catch {
        // Thumbnail generation is non-critical; history entry saved regardless
      }
    }
  }, [activeType, getCurrentData, styleOptions, qrValue, addEntry, updateThumbnail, qrCodeRef]);

  const frameStyle = styleOptions.frameStyle || 'none';
  const hasFrame = frameStyle !== 'none';

  const { canUse } = usePlanGate();

  // Use the download hook
  const { copied, isDownloading, handleDownload, handlePdfDownload, handleCopy } = useQRDownload({
    qrCodeRef,
    frameContainerRef,
    styleOptions,
    processedLogoUrl,
    hasFrame,
    onSuccess: saveToHistory,
  });

  // Wrap handlers to close menu after action
  const downloadWithMenuClose = useCallback(
    async (format: 'png' | 'svg' | 'jpeg' = 'png') => {
      await handleDownload(format);
      setShowFormatMenu(false);
    },
    [handleDownload]
  );

  const pdfDownloadWithMenuClose = useCallback(async () => {
    await handlePdfDownload();
    setShowFormatMenu(false);
  }, [handlePdfDownload]);

  // Expose methods via ref — guard with hasContent so ghost mode can't trigger downloads
  useImperativeHandle(ref, () => ({
    download: () => { if (hasContent) handleDownload('png'); },
    copy: () => { if (hasContent) handleCopy(); },
    showFormatPicker: () => { if (hasContent) setShowFormatMenu(true); },
  }));

  const frameLabel = styleOptions.frameLabel || '';

  // Frame label props
  const labelProps = {
    label: frameLabel,
    fontSize: styleOptions.frameFontSize || 'base',
    fontFamily: styleOptions.frameFontFamily || 'sans',
    icon: styleOptions.frameIcon,
    iconPosition: styleOptions.frameIconPosition,
  };

  // Frame container content — shared between ghost and normal modes
  const frameContent = (
    <div
      ref={frameContainerRef}
      className={cn(
        'relative transition-all qr-preview-glow animate-scale-in',
        frameStyle === 'none'
          ? 'p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md'
          : cn('p-3', getFrameClasses(frameStyle), 'bg-white dark:bg-gray-800')
      )}
      style={frameStyle !== 'none' ? getFrameInlineStyles(frameStyle, styleOptions) : undefined}
    >
      {/* Decorative Corners */}
      {frameStyle === 'decorative-corners' && <DecorativeCorners color={styleOptions.frameBorderColor} />}

      {/* Minimal Line Top */}
      {frameStyle === 'minimal-line' && <MinimalLine position="top" color={styleOptions.frameBorderColor} />}

      {/* Top Label */}
      {frameStyle === 'top-label' && frameLabel && <TopLabel {...labelProps} />}

      {/* Badge Style Top */}
      {frameStyle === 'badge' && frameLabel && <BadgeLabel {...labelProps} />}

      {/* Banner Top */}
      {frameStyle === 'banner-top' && frameLabel && (
        <BannerLabel {...labelProps} bgColor={styleOptions.frameBgColor} position="top" />
      )}

      {/* Speech Bubble Pointer (top) */}
      {frameStyle === 'speech-bubble' && styleOptions.frameSpeechPointer === 'top' && (
        <SpeechBubblePointer direction="top" color={styleOptions.frameBorderColor} />
      )}

      <div
        ref={containerRef}
        className="flex items-center justify-center"
        style={{ minWidth: QR_CONFIG.SIZE, minHeight: QR_CONFIG.SIZE }}
      />

      {/* Bottom Label */}
      {frameStyle === 'bottom-label' && frameLabel && <BottomLabel {...labelProps} />}

      {/* Ribbon */}
      {frameStyle === 'ribbon' && frameLabel && (
        <RibbonLabel {...labelProps} bgColor={styleOptions.frameBgColor} />
      )}

      {/* Banner Bottom */}
      {frameStyle === 'banner-bottom' && frameLabel && (
        <BannerLabel {...labelProps} bgColor={styleOptions.frameBgColor} position="bottom" />
      )}

      {/* Speech Bubble Pointer (bottom - default) */}
      {frameStyle === 'speech-bubble' && styleOptions.frameSpeechPointer !== 'top' && (
        <SpeechBubblePointer
          direction={styleOptions.frameSpeechPointer || 'bottom'}
          color={styleOptions.frameBorderColor}
        />
      )}

      {/* Sticker label */}
      {frameStyle === 'sticker' && frameLabel && <BottomLabel {...labelProps} />}

      {/* Minimal Line Bottom */}
      {frameStyle === 'minimal-line' && <MinimalLine position="bottom" color={styleOptions.frameBorderColor} />}

      {/* Fallback URL Display */}
      {styleOptions.showFallbackUrl && hasContent && <FallbackUrl qrValue={qrValue} />}
    </div>
  );

  // Build the QR preview with optional zoom scaling and ghost overlay
  const qrPreview = (
    <div className="relative">
      {zoomFactor !== undefined && zoomFactor !== 1 ? (
        <div style={{ zoom: zoomFactor }}>
          {frameContent}
        </div>
      ) : (
        frameContent
      )}

      {/* Ghost mode overlay hint */}
      {!hasContent && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <span className="px-3 py-1.5 rounded-full bg-gray-900/70 dark:bg-gray-100/80 text-white dark:text-gray-900 text-xs font-medium backdrop-blur-sm">
            Enter content to preview
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6">
      {/* QR Code with Frame — ghost breathing when no content */}
      <div
        className={cn(
          hasContent ? 'opacity-100 transition-opacity duration-500' : 'animate-ghost-breathe pointer-events-none'
        )}
      >
        {qrPreview}
      </div>

      {/* Action Buttons — only when content exists and not hidden */}
      {hasContent && !hideActions && (
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
                  onClick={() => downloadWithMenuClose('png')}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[44px]"
                >
                  PNG (High Quality)
                </button>
                <button
                  role="menuitem"
                  onClick={() => canUse('svg_download') ? downloadWithMenuClose('svg') : undefined}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[44px] flex items-center justify-between"
                  disabled={!canUse('svg_download')}
                >
                  <span className={!canUse('svg_download') ? 'opacity-50' : ''}>SVG (Illustrator Ready)</span>
                  {!canUse('svg_download') && <ProBadge />}
                </button>
                <button
                  role="menuitem"
                  onClick={() => downloadWithMenuClose('jpeg')}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[44px]"
                >
                  JPEG (Compressed)
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" role="separator" />
                <button
                  role="menuitem"
                  onClick={() => canUse('pdf_download') ? pdfDownloadWithMenuClose() : undefined}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[44px] flex items-center justify-between"
                  disabled={!canUse('pdf_download')}
                >
                  <span className={!canUse('pdf_download') ? 'opacity-50' : ''}>PDF (Print Ready)</span>
                  {!canUse('pdf_download') && <ProBadge />}
                </button>
              </div>
            )}
          </div>

          <Button variant="ghost" size="md" onClick={handleCopy} aria-label={copied ? 'Copied to clipboard' : 'Copy QR code to clipboard'}>
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
      )}

      {/* Close dropdown when clicking outside */}
      {hasContent && !hideActions && showFormatMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowFormatMenu(false)}
        />
      )}
    </div>
  );
});

QRPreview.displayName = 'QRPreview';
