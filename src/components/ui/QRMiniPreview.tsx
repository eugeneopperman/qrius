import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { cn } from '@/utils/cn';
import { getDotTypeForPattern } from '@/utils/qrRoundness';
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

      // Dots options (with optional gradient)
      const dotsOptions: Record<string, unknown> = { type: dotType };
      if (s?.useGradient && s?.gradient) {
        dotsOptions.gradient = convertGradientToQRFormat(s.gradient);
      } else {
        dotsOptions.color = s?.dotsColor || '#000000';
      }

      // Corner options
      const cornersSquareOptions: Record<string, unknown> = {
        type: s?.cornersSquareType || 'extra-rounded',
      };
      if (s?.useGradient && s?.gradient) {
        cornersSquareOptions.gradient = convertGradientToQRFormat(s.gradient);
      } else if (s?.dotsColor) {
        cornersSquareOptions.color = s.dotsColor;
      }

      const cornersDotOptions: Record<string, unknown> = {
        type: s?.cornersDotType || undefined,
      };
      if (s?.useGradient && s?.gradient) {
        cornersDotOptions.gradient = convertGradientToQRFormat(s.gradient);
      } else if (s?.dotsColor) {
        cornersDotOptions.color = s.dotsColor;
      }

      const config: Record<string, unknown> = {
        width: size,
        height: size,
        data,
        dotsOptions,
        backgroundOptions: { color: s?.backgroundColor || '#ffffff' },
        cornersSquareOptions,
        cornersDotOptions,
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: s?.logoMargin ?? 5,
          imageSize: s?.logoSize ? s.logoSize / 100 : 0.4,
        },
        qrOptions: { errorCorrectionLevel: s?.errorCorrectionLevel || 'M' },
      };

      // Logo
      if (s?.logoUrl) {
        config.image = s.logoUrl;
      }

      if (!qrRef.current) {
        qrRef.current = new QRCodeStyling(config as ConstructorParameters<typeof QRCodeStyling>[0]);
        qrRef.current.append(container);
      } else {
        qrRef.current.update(config as Parameters<QRCodeStyling['update']>[0]);
      }

      return () => {
        clearChildren(container);
        qrRef.current = null;
      };
    }, [data, size, styleOptions]);

    if (!data) return null;

    return (
      <div
        ref={containerRef}
        className={cn('flex items-center justify-center', className)}
      />
    );
  }
);
