import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { useQRStore } from '../stores/qrStore';
import { useHistoryStore } from '../stores/historyStore';
import { toast } from '../stores/toastStore';
import { Download, Copy, Check, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';
import { applyLogoMask } from '../utils/logoMask';
import {
  applyRoundnessToQRSvg,
  getDotTypeForPattern,
  shouldApplyRoundnessPostProcessing,
  getCornerSquareTypeForRoundness,
  getCornerDotTypeForRoundness,
} from '../utils/qrRoundness';
import {
  TopLabel, BadgeLabel, BottomLabel, BannerLabel, RibbonLabel,
  FallbackUrl, getFrameClasses, getFrameInlineStyles,
  SpeechBubblePointer, DecorativeCorners, MinimalLine,
} from './qr';
import { QR_CONFIG } from '../config/constants';
import { createQRElementOptions } from '../utils/gradientUtils';
import { useQRDownload } from '../hooks/useQRDownload';

export interface QRPreviewHandle {
  download: () => void;
  copy: () => void;
  showFormatPicker: () => void;
}

interface QRPreviewProps {
  hideActions?: boolean;
  displaySize?: number;
}

export const QRPreview = forwardRef<QRPreviewHandle, QRPreviewProps>(({ hideActions, displaySize }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameContainerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [processedLogoUrl, setProcessedLogoUrl] = useState<string | undefined>(undefined);
  const { getQRValue, styleOptions, activeType, getCurrentData,
    urlData, textData, emailData, phoneData, smsData, wifiData, vcardData, eventData, locationData,
  } = useQRStore();
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

  const displayValue = hasContent ? qrValue : QR_CONFIG.GHOST_DATA;

  // Calculate zoom factor for displaySize — zoom scales both visual AND layout
  const zoomFactor = displaySize ? displaySize / QR_CONFIG.SIZE : undefined;

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
        toast.error('Failed to apply logo shape. Using original image.');
        setProcessedLogoUrl(styleOptions.logoUrl);
      });
  }, [styleOptions.logoUrl, styleOptions.logoShape]);

  // Get roundness and pattern values for smooth transitions
  const qrRoundness = styleOptions.qrRoundness;
  const qrPattern = styleOptions.qrPattern ?? 'solid';

  // Determine effective dot/corner types based on pattern:
  // - Solid pattern: Use 'square' and post-process with smooth roundness
  // - Dots pattern: Use discrete dot types for individual separated dots
  const effectiveDotType = qrRoundness !== undefined
    ? getDotTypeForPattern(qrPattern, qrRoundness)
    : styleOptions.dotsType;

  const effectiveCornerSquareType = qrRoundness !== undefined
    ? getCornerSquareTypeForRoundness(qrRoundness)
    : styleOptions.cornersSquareType;

  const effectiveCornerDotType = qrRoundness !== undefined
    ? getCornerDotTypeForRoundness(qrRoundness)
    : styleOptions.cornersDotType;

  // Only apply post-processing for solid pattern
  const shouldPostProcess = shouldApplyRoundnessPostProcessing(qrPattern) && qrRoundness !== undefined;

  // Build QR element options with gradient support
  const dotsOptions = useMemo(
    () => createQRElementOptions(
      effectiveDotType,
      styleOptions.useGradient || false,
      styleOptions.gradient,
      styleOptions.dotsColor
    ),
    [effectiveDotType, styleOptions.useGradient, styleOptions.gradient, styleOptions.dotsColor]
  );

  const cornersSquareOptions = useMemo(
    () => createQRElementOptions(
      effectiveCornerSquareType,
      styleOptions.useGradient || false,
      styleOptions.gradient,
      styleOptions.dotsColor
    ),
    [effectiveCornerSquareType, styleOptions.useGradient, styleOptions.gradient, styleOptions.dotsColor]
  );

  const cornersDotOptions = useMemo(
    () => createQRElementOptions(
      effectiveCornerDotType,
      styleOptions.useGradient || false,
      styleOptions.gradient,
      styleOptions.dotsColor
    ),
    [effectiveCornerDotType, styleOptions.useGradient, styleOptions.gradient, styleOptions.dotsColor]
  );

  // Apply smooth roundness to SVG (only for solid pattern)
  const applyRoundness = useCallback(() => {
    if (shouldPostProcess && qrRoundness !== undefined) {
      requestAnimationFrame(() => {
        applyRoundnessToQRSvg(containerRef.current, qrRoundness);
      });
    }
  }, [qrRoundness, shouldPostProcess]);

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
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
      }
    }
  }, [activeType, getCurrentData, styleOptions, qrValue, addEntry, updateThumbnail]);

  // Initialize QR code
  useEffect(() => {
    qrCodeRef.current = new QRCodeStyling({
      width: QR_CONFIG.SIZE,
      height: QR_CONFIG.SIZE,
      type: 'svg',
      data: displayValue,
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
        margin: styleOptions.logoMargin ?? 5,
        imageSize: styleOptions.logoSize || 0.3,
      },
      image: processedLogoUrl,
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      qrCodeRef.current.append(containerRef.current);
      // Apply smooth roundness after initial render
      applyRoundness();
    }

    const container = containerRef.current;
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only initialization
  }, []);

  // Update QR code when options change
  useEffect(() => {
    if (qrCodeRef.current) {
      qrCodeRef.current.update({
        data: displayValue,
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
          margin: styleOptions.logoMargin ?? 5,
          imageSize: styleOptions.logoSize || 0.3,
        },
        image: processedLogoUrl || undefined,
      });
      // Apply smooth roundness after update
      applyRoundness();
    }
  }, [displayValue, styleOptions, dotsOptions, cornersSquareOptions, cornersDotOptions, processedLogoUrl, qrRoundness, qrPattern, applyRoundness]);

  const frameStyle = styleOptions.frameStyle || 'none';
  const hasFrame = frameStyle !== 'none';

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
                  onClick={() => downloadWithMenuClose('svg')}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[44px]"
                >
                  SVG (Illustrator Ready)
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
                  onClick={pdfDownloadWithMenuClose}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[44px]"
                >
                  PDF (Print Ready)
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
