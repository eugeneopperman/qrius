import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { cn } from '@/utils/cn';

interface QRMiniPreviewProps {
  data: string;
  size?: number;
  className?: string;
}

export interface QRMiniPreviewHandle {
  download: (fileName?: string, extension?: 'png' | 'svg' | 'jpeg' | 'webp') => Promise<void>;
}

function clearChildren(el: HTMLElement) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export const QRMiniPreview = forwardRef<QRMiniPreviewHandle, QRMiniPreviewProps>(
  function QRMiniPreview({ data, size = 160, className }, ref) {
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

      if (!qrRef.current) {
        qrRef.current = new QRCodeStyling({
          width: size,
          height: size,
          data,
          dotsOptions: { type: 'rounded', color: '#000000' },
          backgroundOptions: { color: '#ffffff' },
          cornersSquareOptions: { type: 'extra-rounded' },
          imageOptions: { crossOrigin: 'anonymous' },
          qrOptions: { errorCorrectionLevel: 'M' },
        });
        qrRef.current.append(container);
      } else {
        qrRef.current.update({ data, width: size, height: size });
      }

      return () => {
        clearChildren(container);
        qrRef.current = null;
      };
    }, [data, size]);

    if (!data) return null;

    return (
      <div
        ref={containerRef}
        className={cn('flex items-center justify-center', className)}
      />
    );
  }
);
