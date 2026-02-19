import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { cn } from '@/utils/cn';

interface QRMiniPreviewProps {
  data: string;
  size?: number;
  className?: string;
}

function clearChildren(el: HTMLElement) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function QRMiniPreview({ data, size = 160, className }: QRMiniPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;

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
      qrRef.current.append(containerRef.current);
    } else {
      qrRef.current.update({ data, width: size, height: size });
    }

    return () => {
      if (containerRef.current) {
        clearChildren(containerRef.current);
      }
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
