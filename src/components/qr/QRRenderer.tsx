import { useEffect, useRef, useMemo } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { applyLogoMask } from '../../utils/logoMask';
import { toast } from '../../stores/toastStore';
import { QR_CONFIG } from '../../config/constants';
import { createQRElementOptions } from '../../utils/gradientUtils';
import type { QRStyleOptions } from '../../types';

interface QRRendererProps {
  qrValue: string;
  styleOptions: QRStyleOptions;
  onQRCodeReady?: (qrCode: QRCodeStyling) => void;
  onProcessedLogoChange?: (logoUrl: string | undefined) => void;
}

/**
 * Core QR code renderer component.
 * Handles QR code generation and updates.
 */
export function QRRenderer({
  qrValue,
  styleOptions,
  onQRCodeReady,
  onProcessedLogoChange,
}: QRRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  // Process logo with shape mask when logo or shape changes
  useEffect(() => {
    if (!styleOptions.logoUrl) {
      onProcessedLogoChange?.(undefined);
      return;
    }

    const shape = styleOptions.logoShape || 'square';

    // Only apply mask for non-square shapes
    if (shape === 'square') {
      onProcessedLogoChange?.(styleOptions.logoUrl);
      return;
    }

    applyLogoMask(styleOptions.logoUrl, shape)
      .then((processedUrl) => onProcessedLogoChange?.(processedUrl))
      .catch((error) => {
        console.error('Failed to apply logo mask:', error);
        toast.error('Failed to apply logo shape. Using original image.');
        onProcessedLogoChange?.(styleOptions.logoUrl);
      });
  }, [styleOptions.logoUrl, styleOptions.logoShape, onProcessedLogoChange]);

  // Build QR element options with gradient support
  const dotsOptions = useMemo(
    () => createQRElementOptions(
      styleOptions.dotsType,
      styleOptions.useGradient || false,
      styleOptions.gradient,
      styleOptions.dotsColor
    ),
    [styleOptions.dotsType, styleOptions.useGradient, styleOptions.gradient, styleOptions.dotsColor]
  );

  const cornersSquareOptions = useMemo(
    () => createQRElementOptions(
      styleOptions.cornersSquareType,
      styleOptions.useGradient || false,
      styleOptions.gradient,
      styleOptions.dotsColor
    ),
    [styleOptions.cornersSquareType, styleOptions.useGradient, styleOptions.gradient, styleOptions.dotsColor]
  );

  const cornersDotOptions = useMemo(
    () => createQRElementOptions(
      styleOptions.cornersDotType,
      styleOptions.useGradient || false,
      styleOptions.gradient,
      styleOptions.dotsColor
    ),
    [styleOptions.cornersDotType, styleOptions.useGradient, styleOptions.gradient, styleOptions.dotsColor]
  );

  // Get processed logo URL
  const processedLogoUrl = useMemo(() => {
    if (!styleOptions.logoUrl) return undefined;
    // The actual processing happens in the effect above
    // This is just for the initial render
    return styleOptions.logoUrl;
  }, [styleOptions.logoUrl]);

  // Initialize QR code
  useEffect(() => {
    qrCodeRef.current = new QRCodeStyling({
      width: QR_CONFIG.SIZE,
      height: QR_CONFIG.SIZE,
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
        margin: styleOptions.logoMargin ?? 5,
        imageSize: styleOptions.logoSize || 0.3,
      },
      image: processedLogoUrl,
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      qrCodeRef.current.append(containerRef.current);
    }

    onQRCodeReady?.(qrCodeRef.current);

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
          margin: styleOptions.logoMargin ?? 5,
          imageSize: styleOptions.logoSize || 0.3,
        },
        image: processedLogoUrl || undefined,
      });

      onQRCodeReady?.(qrCodeRef.current);
    }
  }, [
    qrValue,
    dotsOptions,
    cornersSquareOptions,
    cornersDotOptions,
    styleOptions.backgroundColor,
    styleOptions.errorCorrectionLevel,
    styleOptions.logoMargin,
    styleOptions.logoSize,
    processedLogoUrl,
    onQRCodeReady,
  ]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center"
      style={{ minWidth: QR_CONFIG.SIZE, minHeight: QR_CONFIG.SIZE }}
    />
  );
}
