import { useEffect, useRef, useMemo, memo, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { cn } from '../../utils/cn';
import { createQRElementOptions } from '../../utils/gradientUtils';
import { roundnessToDotType, roundnessToCornerSquareType } from '../../stores/templateStore';
import { useGoogleFont, getFontFamily } from '../../hooks/useGoogleFont';
import { applyLogoMask } from '../../utils/logoMask';
import type { BrandTemplateStyle } from '../../types';

interface TemplateWizardPreviewProps {
  style: BrandTemplateStyle;
  className?: string;
}

const PREVIEW_SIZE = 180;
const PREVIEW_DATA = 'TEMPLATE PREVIEW';

export const TemplateWizardPreview = memo(function TemplateWizardPreview({
  style,
  className,
}: TemplateWizardPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const [processedLogoUrl, setProcessedLogoUrl] = useState<string | undefined>(undefined);

  // Load Google Font if specified
  useGoogleFont(style.googleFontFamily, style.googleFontWeight);

  // Process logo with shape mask when logo or shape changes
  useEffect(() => {
    if (!style.logoUrl) {
      setProcessedLogoUrl(undefined);
      return;
    }

    const shape = style.logoShape || 'square';

    // Only apply mask for non-square shapes
    if (shape === 'square') {
      setProcessedLogoUrl(style.logoUrl);
      return;
    }

    applyLogoMask(style.logoUrl, shape)
      .then(setProcessedLogoUrl)
      .catch((error) => {
        console.error('Failed to apply logo mask:', error);
        setProcessedLogoUrl(style.logoUrl);
      });
  }, [style.logoUrl, style.logoShape]);

  // Compute effective dot and corner types from roundness
  const effectiveDotType = style.qrRoundness !== undefined
    ? roundnessToDotType(style.qrRoundness)
    : style.dotsType || 'square';

  const effectiveCornerSquareType = style.qrRoundness !== undefined
    ? roundnessToCornerSquareType(style.qrRoundness)
    : style.cornersSquareType || 'square';

  // Build QR element options
  const dotsOptions = useMemo(
    () => createQRElementOptions(
      effectiveDotType,
      style.useGradient || false,
      style.gradient,
      style.dotsColor || '#000000'
    ),
    [effectiveDotType, style.useGradient, style.gradient, style.dotsColor]
  );

  const cornersSquareOptions = useMemo(
    () => createQRElementOptions(
      effectiveCornerSquareType,
      style.useGradient || false,
      style.gradient,
      style.dotsColor || '#000000'
    ),
    [effectiveCornerSquareType, style.useGradient, style.gradient, style.dotsColor]
  );

  const cornersDotOptions = useMemo(
    () => createQRElementOptions(
      style.cornersDotType || 'square',
      style.useGradient || false,
      style.gradient,
      style.dotsColor || '#000000'
    ),
    [style.cornersDotType, style.useGradient, style.gradient, style.dotsColor]
  );

  // Initialize QR code
  useEffect(() => {
    qrCodeRef.current = new QRCodeStyling({
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
      type: 'svg',
      data: PREVIEW_DATA,
      dotsOptions,
      cornersSquareOptions,
      cornersDotOptions,
      backgroundOptions: {
        color: style.backgroundColor || '#ffffff',
      },
      qrOptions: {
        errorCorrectionLevel: 'H',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: style.logoMargin ?? 5,
        imageSize: style.logoSize || 0.3,
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

  // Update QR code when style changes
  useEffect(() => {
    if (qrCodeRef.current) {
      qrCodeRef.current.update({
        data: PREVIEW_DATA,
        dotsOptions,
        cornersSquareOptions,
        cornersDotOptions,
        backgroundOptions: {
          color: style.backgroundColor || '#ffffff',
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: style.logoMargin ?? 5,
          imageSize: style.logoSize || 0.3,
        },
        image: processedLogoUrl || undefined,
      });
    }
  }, [style.backgroundColor, style.logoMargin, style.logoSize, dotsOptions, cornersSquareOptions, cornersDotOptions, processedLogoUrl]);

  // Frame styling
  const frameStyle = style.frameStyle || 'none';
  const frameLabel = style.frameLabel || '';
  const frameBorderRadius = style.frameBorderRadius || 0;

  // Font styling for label
  const labelFontFamily = style.googleFontFamily
    ? getFontFamily(style.googleFontFamily)
    : getFontFamily(style.frameFontFamily);

  const labelFontSize = {
    sm: '10px',
    base: '12px',
    lg: '14px',
    xl: '16px',
  }[style.frameFontSize || 'base'];

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Preview Label */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Live Preview</p>

      {/* QR with Frame */}
      <div
        className={cn(
          'relative transition-all p-3',
          frameStyle !== 'none' && 'border-2',
          frameStyle === 'simple' && 'border-gray-300 dark:border-gray-600',
          frameStyle === 'rounded' && 'border-gray-300 dark:border-gray-600',
          frameStyle === 'bottom-label' && 'border-gray-300 dark:border-gray-600 pb-8',
          frameStyle === 'top-label' && 'border-gray-300 dark:border-gray-600 pt-8',
          frameStyle === 'badge' && 'border-gray-300 dark:border-gray-600 pt-8'
        )}
        style={{
          borderRadius: frameStyle !== 'none' ? `${frameBorderRadius}px` : undefined,
          backgroundColor: style.backgroundColor || '#ffffff',
        }}
      >
        {/* Top Label */}
        {(frameStyle === 'top-label' || frameStyle === 'badge') && frameLabel && (
          <div
            className={cn(
              'absolute left-1/2 -translate-x-1/2 px-2 py-0.5 whitespace-nowrap',
              frameStyle === 'badge'
                ? 'top-0 -translate-y-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full'
                : 'top-1 text-gray-700 dark:text-gray-300'
            )}
            style={{
              fontFamily: labelFontFamily,
              fontSize: labelFontSize,
              fontWeight: style.googleFontWeight || 500,
            }}
          >
            {frameLabel}
          </div>
        )}

        {/* QR Code Container */}
        <div
          ref={containerRef}
          className="flex items-center justify-center"
          style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
        />

        {/* Bottom Label */}
        {frameStyle === 'bottom-label' && frameLabel && (
          <div
            className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 text-gray-700 dark:text-gray-300 whitespace-nowrap"
            style={{
              fontFamily: labelFontFamily,
              fontSize: labelFontSize,
              fontWeight: style.googleFontWeight || 500,
            }}
          >
            {frameLabel}
          </div>
        )}
      </div>

      {/* Style Summary */}
      <div className="mt-3 flex flex-wrap gap-1 justify-center max-w-[200px]">
        {style.useGradient && (
          <span className="px-2 py-0.5 text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
            Gradient
          </span>
        )}
        {frameStyle !== 'none' && (
          <span className="px-2 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full capitalize">
            {frameStyle.replace('-', ' ')}
          </span>
        )}
        {style.logoUrl && (
          <span className="px-2 py-0.5 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
            Logo
          </span>
        )}
        {style.googleFontFamily && (
          <span className="px-2 py-0.5 text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
            {style.googleFontFamily}
          </span>
        )}
      </div>
    </div>
  );
});

TemplateWizardPreview.displayName = 'TemplateWizardPreview';
