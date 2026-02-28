import { useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { cn } from '@/utils/cn';
import {
  getDotTypeForPattern,
  getCornerSquareTypeForRoundness,
  getCornerDotTypeForRoundness,
} from '@/utils/qrRoundness';
import { convertGradientToQRFormat } from '@/utils/gradientUtils';
import type { GradientOptions, QRPattern, DotType, CornerSquareType, CornerDotType, LogoShape } from '@/types';

/** Rendering-relevant style fields saved in QR code metadata */
export interface QRStyleOptionsForPreview {
  dotsColor?: string;
  backgroundColor?: string;
  dotsType?: DotType;
  cornersSquareType?: CornerSquareType;
  cornersDotType?: CornerDotType;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  useGradient?: boolean;
  gradient?: GradientOptions;
  logoUrl?: string;
  logoShape?: LogoShape;
  logoMargin?: number;
  logoSize?: number;
  qrRoundness?: number;
  qrPattern?: QRPattern;
}

interface QRMiniPreviewProps {
  data: string;
  size?: number;
  className?: string;
  styleOptions?: QRStyleOptionsForPreview;
}

export interface QRMiniPreviewHandle {
  download: (fileName?: string, extension?: 'png' | 'svg' | 'jpeg' | 'webp') => Promise<void>;
}

function clearChildren(el: HTMLElement) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export const QRMiniPreview = forwardRef<QRMiniPreviewHandle, QRMiniPreviewProps>(
  function QRMiniPreview({ data, size = 160, className, styleOptions }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const qrRef = useRef<QRCodeStyling | null>(null);

    useImperativeHandle(ref, () => ({
      download: async (fileName = 'qr-code', extension = 'png') => {
        if (qrRef.current) {
          await qrRef.current.download({ name: fileName, extension });
        }
      },
    }));

    // Memoize styleOptions by value to avoid re-renders when parent passes new object references
    const styleKey = useMemo(() => JSON.stringify(styleOptions), [styleOptions]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container || !data) return;

      // Build qr-code-styling config from styleOptions (or defaults)
      const s = styleOptions;

      // Determine dot type: if qrRoundness+qrPattern provided, use getDotTypeForPattern
      let dotType: DotType = s?.dotsType || 'rounded';
      if (s?.qrRoundness !== undefined && s?.qrPattern) {
        dotType = getDotTypeForPattern(s.qrPattern, s.qrRoundness);
      }

      // Derive corner types from roundness (matching useQRCodeInstance logic)
      const effectiveCornerSquareType = s?.qrRoundness !== undefined
        ? getCornerSquareTypeForRoundness(s.qrRoundness)
        : (s?.cornersSquareType || 'extra-rounded');
      const effectiveCornerDotType = s?.qrRoundness !== undefined
        ? getCornerDotTypeForRoundness(s.qrRoundness)
        : (s?.cornersDotType || undefined);

      // Dots options (with optional gradient)
      const dotsOptions: Record<string, unknown> = { type: dotType };
      if (s?.useGradient && s?.gradient) {
        dotsOptions.gradient = convertGradientToQRFormat(s.gradient);
      } else {
        dotsOptions.color = s?.dotsColor || '#000000';
      }

      // Corner options
      const cornersSquareOptions: Record<string, unknown> = {
        type: effectiveCornerSquareType,
      };
      if (s?.useGradient && s?.gradient) {
        cornersSquareOptions.gradient = convertGradientToQRFormat(s.gradient);
      } else if (s?.dotsColor) {
        cornersSquareOptions.color = s.dotsColor;
      }

      const cornersDotOptions: Record<string, unknown> = {
        type: effectiveCornerDotType,
      };
      if (s?.useGradient && s?.gradient) {
        cornersDotOptions.gradient = convertGradientToQRFormat(s.gradient);
      } else if (s?.dotsColor) {
        cornersDotOptions.color = s.dotsColor;
      }

      // Scale pixel-based logoMargin proportionally to render size
      // (values are authored for 280px; at 48px a 5px margin would be disproportionately large)
      const REFERENCE_SIZE = 280;
      const scaleFactor = size / REFERENCE_SIZE;
      const scaledMargin = Math.round((s?.logoMargin ?? 5) * scaleFactor);

      const config: Record<string, unknown> = {
        type: 'canvas',
        width: size,
        height: size,
        data,
        dotsOptions,
        backgroundOptions: { color: s?.backgroundColor || '#ffffff' },
        cornersSquareOptions,
        cornersDotOptions,
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: scaledMargin,
          imageSize: s?.logoSize || 0.3,
        },
        qrOptions: { errorCorrectionLevel: s?.errorCorrectionLevel || 'H' },
      };

      // Logo
      if (s?.logoUrl) {
        config.image = s.logoUrl;
      }

      // Reuse existing instance (update) instead of destroy/recreate
      if (!qrRef.current) {
        qrRef.current = new QRCodeStyling(config as ConstructorParameters<typeof QRCodeStyling>[0]);
        qrRef.current.append(container);
      } else {
        qrRef.current.update(config as Parameters<QRCodeStyling['update']>[0]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, size, styleKey]);

    // Separate unmount-only cleanup — copy ref to avoid stale closure warning
    useEffect(() => {
      const container = containerRef.current;
      return () => {
        if (container) clearChildren(container);
        qrRef.current = null;
      };
    }, []);

    if (!data) return null;

    return (
      <div
        ref={containerRef}
        className={cn('flex items-center justify-center', className)}
      />
    );
  }
);
