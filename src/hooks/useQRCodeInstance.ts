import { useEffect, useRef, useState, useMemo } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { applyLogoMask } from '@/utils/logoMask';
import { toast } from '@/stores/toastStore';
import { QR_CONFIG } from '@/config/constants';
import { createQRElementOptions } from '@/utils/gradientUtils';
import {
  getDotTypeForPattern,
  getCornerSquareTypeForRoundness,
  getCornerDotTypeForRoundness,
} from '@/utils/qrRoundness';
import type {
  DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel,
  GradientOptions, LogoShape, QRPattern,
} from '@/types';

interface QRCodeInstanceOptions {
  data: string;
  width?: number;
  height?: number;
  dotsType?: DotType;
  dotsColor: string;
  cornersSquareType?: CornerSquareType;
  cornersDotType?: CornerDotType;
  backgroundColor: string;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  useGradient?: boolean;
  gradient?: GradientOptions;
  logoUrl?: string;
  logoShape?: LogoShape;
  logoMargin?: number;
  logoSize?: number;
  qrRoundness?: number;
  qrPattern?: QRPattern;
}

/** Safely remove all child nodes without innerHTML */
function clearChildren(el: HTMLElement) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

/**
 * Shared hook for QR code instance management.
 * Handles logo processing, gradient element options, QRCodeStyling lifecycle,
 * and optional roundness post-processing.
 */
export function useQRCodeInstance(options: QRCodeInstanceOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const [processedLogoUrl, setProcessedLogoUrl] = useState<string | undefined>(undefined);

  const {
    data,
    width = QR_CONFIG.SIZE,
    height = QR_CONFIG.SIZE,
    dotsType,
    dotsColor,
    cornersSquareType,
    cornersDotType,
    backgroundColor,
    errorCorrectionLevel = 'H',
    useGradient = false,
    gradient,
    logoUrl,
    logoShape,
    logoMargin = 5,
    logoSize = 0.3,
    qrRoundness,
    qrPattern = 'solid',
  } = options;

  // --- Logo processing with shape mask ---
  useEffect(() => {
    if (!logoUrl) {
      setProcessedLogoUrl(undefined);
      return;
    }
    const shape = logoShape || 'square';
    if (shape === 'square') {
      setProcessedLogoUrl(logoUrl);
      return;
    }
    applyLogoMask(logoUrl, shape)
      .then(setProcessedLogoUrl)
      .catch(() => {
        toast.error('Failed to apply logo shape. Using original image.');
        setProcessedLogoUrl(logoUrl);
      });
  }, [logoUrl, logoShape]);

  // --- Effective dot/corner types with roundness ---
  const effectiveDotType = qrRoundness !== undefined
    ? getDotTypeForPattern(qrPattern, qrRoundness)
    : dotsType;

  const effectiveCornerSquareType = qrRoundness !== undefined
    ? getCornerSquareTypeForRoundness(qrRoundness)
    : cornersSquareType;

  const effectiveCornerDotType = qrRoundness !== undefined
    ? getCornerDotTypeForRoundness(qrRoundness)
    : cornersDotType;

  // --- Element options with gradient support ---
  const dotsOptions = useMemo(
    () => createQRElementOptions(effectiveDotType ?? 'square', useGradient, gradient, dotsColor),
    [effectiveDotType, useGradient, gradient, dotsColor],
  );

  const cornersSquareOptions = useMemo(
    () => createQRElementOptions(effectiveCornerSquareType ?? 'square', useGradient, gradient, dotsColor),
    [effectiveCornerSquareType, useGradient, gradient, dotsColor],
  );

  const cornersDotOptions = useMemo(
    () => createQRElementOptions(effectiveCornerDotType ?? 'square', useGradient, gradient, dotsColor),
    [effectiveCornerDotType, useGradient, gradient, dotsColor],
  );

  // --- Initialize QR code ---
  useEffect(() => {
    qrCodeRef.current = new QRCodeStyling({
      width,
      height,
      type: 'canvas',
      data,
      dotsOptions,
      cornersSquareOptions,
      cornersDotOptions,
      backgroundOptions: { color: backgroundColor },
      qrOptions: { errorCorrectionLevel },
      imageOptions: {
        crossOrigin: processedLogoUrl?.startsWith('data:') ? undefined : 'anonymous',
        margin: logoMargin,
        imageSize: logoSize,
      },
      image: processedLogoUrl,
    });

    if (containerRef.current) {
      clearChildren(containerRef.current);
      qrCodeRef.current.append(containerRef.current);
    }

    const container = containerRef.current;
    return () => {
      if (container) clearChildren(container);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only initialization
  }, []);

  // --- Update QR code when options change ---
  useEffect(() => {
    if (qrCodeRef.current) {
      qrCodeRef.current.update({
        data,
        dotsOptions,
        cornersSquareOptions,
        cornersDotOptions,
        backgroundOptions: { color: backgroundColor },
        qrOptions: { errorCorrectionLevel },
        imageOptions: {
          crossOrigin: processedLogoUrl?.startsWith('data:') ? undefined : 'anonymous',
          margin: logoMargin,
          imageSize: logoSize,
        },
        image: processedLogoUrl || undefined,
      });
    }
  }, [
    data,
    dotsOptions,
    cornersSquareOptions,
    cornersDotOptions,
    backgroundColor,
    errorCorrectionLevel,
    logoMargin,
    logoSize,
    processedLogoUrl,
  ]);

  return { containerRef, qrCodeRef, processedLogoUrl };
}
