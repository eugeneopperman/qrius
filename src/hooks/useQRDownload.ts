import { useState, useRef, useEffect, useCallback } from 'react';
import type QRCodeStyling from 'qr-code-styling';
import { toast } from '@/stores/toastStore';
import { generateIllustratorSVG, downloadSVG } from '@/utils/qrSvgGenerator';
import { QR_CONFIG } from '@/config/constants';
import type { QRStyleOptions } from '@/types';

interface UseQRDownloadOptions {
  qrCodeRef: React.MutableRefObject<QRCodeStyling | null>;
  frameContainerRef?: React.MutableRefObject<HTMLDivElement | null>;
  styleOptions: QRStyleOptions;
  processedLogoUrl?: string;
  hasFrame?: boolean;
  onSuccess?: () => void;
}

/**
 * Hook for handling QR code download and copy operations.
 * Consolidates download logic for PNG, SVG, JPEG, PDF formats and clipboard copy.
 * Supports frame capture using html2canvas when hasFrame is true.
 */
export function useQRDownload({
  qrCodeRef,
  frameContainerRef,
  styleOptions,
  processedLogoUrl,
  hasFrame = false,
  onSuccess,
}: UseQRDownloadOptions) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Capture the frame container as a canvas using html2canvas
   */
  const captureFrameAsCanvas = useCallback(async (scale = 2): Promise<HTMLCanvasElement | null> => {
    if (!frameContainerRef?.current) return null;

    const html2canvas = (await import('html2canvas')).default;
    const container = frameContainerRef.current;

    // Temporarily remove animation and hover classes for clean capture
    const originalClassName = container.className;
    container.className = container.className
      .replace('animate-scale-in', '')
      .replace('qr-preview-glow', '')
      .replace('hover:shadow-md', '');

    try {
      const canvas = await html2canvas(container, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });
      return canvas;
    } finally {
      // Restore original classes
      container.className = originalClassName;
    }
  }, [frameContainerRef]);

  const handleDownload = useCallback(
    async (format: 'png' | 'svg' | 'jpeg' = 'png') => {
      if (!qrCodeRef.current) return;

      setIsDownloading(true);
      try {
        // For PNG and JPEG, capture the frame if present
        if ((format === 'png' || format === 'jpeg') && hasFrame && frameContainerRef?.current) {
          const canvas = await captureFrameAsCanvas(2);
          if (canvas) {
            const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
            const quality = format === 'jpeg' ? 0.92 : undefined;

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `qrcode.${format}`;
                  link.click();
                  URL.revokeObjectURL(url);
                  toast.success(`QR code with frame downloaded as ${format.toUpperCase()}`);
                  onSuccess?.();
                } else {
                  toast.error('Failed to generate image. Please try again.');
                }
                setIsDownloading(false);
              },
              mimeType,
              quality
            );
            return;
          }
        }

        // SVG export (doesn't include HTML frame)
        if (format === 'svg') {
          // Access internal QR matrix for custom SVG generation
          // Use type guard to safely validate the internal structure exists
          const qrInstance = qrCodeRef.current as unknown as Record<string, unknown>;
          const qrMatrix = qrInstance._qr as {
            getModuleCount?: () => number;
            isDark?: (row: number, col: number) => boolean;
          } | undefined;

          // Validate that the internal QR matrix has the required methods
          const hasValidQrMatrix =
            qrMatrix &&
            typeof qrMatrix.getModuleCount === 'function' &&
            typeof qrMatrix.isDark === 'function';

          if (!hasValidQrMatrix) {
            // Fallback to library's built-in SVG download
            await qrCodeRef.current.download({
              name: 'qrcode',
              extension: 'svg',
            });
          } else {
            const svgString = await generateIllustratorSVG({
              qrMatrix: qrMatrix as { getModuleCount: () => number; isDark: (row: number, col: number) => boolean },
              size: QR_CONFIG.SIZE,
              margin: QR_CONFIG.MARGIN,
              styleOptions,
              processedLogoUrl,
            });
            downloadSVG(svgString, 'qrcode');
          }
          toast.success('SVG downloaded (Illustrator ready)');
          if (hasFrame) {
            toast.info('Note: SVG export does not include frame styling');
          }
        } else {
          // Fallback to QR-only download
          await qrCodeRef.current.download({
            name: 'qrcode',
            extension: format,
          });
          toast.success(`QR code downloaded as ${format.toUpperCase()}`);
        }
        onSuccess?.();
      } catch {
        toast.error('Failed to download QR code. Please try again.');
      } finally {
        setIsDownloading(false);
      }
    },
    [qrCodeRef, frameContainerRef, styleOptions, processedLogoUrl, hasFrame, captureFrameAsCanvas, onSuccess]
  );

  const handlePdfDownload = useCallback(async () => {
    if (!qrCodeRef.current) return;

    setIsDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');

      let dataUrl: string;

      // Capture frame if present
      if (hasFrame && frameContainerRef?.current) {
        const canvas = await captureFrameAsCanvas(3); // Higher scale for PDF quality
        if (canvas) {
          dataUrl = canvas.toDataURL('image/png');
        } else {
          // Fallback to QR-only
          const rawData = await qrCodeRef.current.getRawData('png');
          if (!rawData || !(rawData instanceof Blob)) {
            toast.error('Failed to generate PDF. Please try again.');
            setIsDownloading(false);
            return;
          }
          dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(rawData);
          });
        }
      } else {
        const rawData = await qrCodeRef.current.getRawData('png');
        if (!rawData || !(rawData instanceof Blob)) {
          toast.error('Failed to generate PDF. Please try again.');
          setIsDownloading(false);
          return;
        }
        dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(rawData);
        });
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const qrSize = QR_CONFIG.PDF_SIZE_MM;
      const x = (pageWidth - qrSize) / 2;
      const y = (pageHeight - qrSize) / 2;

      pdf.addImage(dataUrl, 'PNG', x, y, qrSize, qrSize);
      pdf.save('qrcode.pdf');
      toast.success('QR code downloaded as PDF');
      onSuccess?.();
    } catch {
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [qrCodeRef, frameContainerRef, hasFrame, captureFrameAsCanvas, onSuccess]);

  const handleCopy = useCallback(async () => {
    if (!qrCodeRef.current) return;

    try {
      let blob: Blob | null = null;

      // Capture frame if present
      if (hasFrame && frameContainerRef?.current) {
        const canvas = await captureFrameAsCanvas(2);
        if (canvas) {
          blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/png');
          });
        }
      }

      // Fallback to QR-only
      if (!blob) {
        const rawData = await qrCodeRef.current.getRawData('png');
        if (rawData && rawData instanceof Blob) {
          blob = rawData;
        }
      }

      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        if (copiedTimeoutRef.current) {
          clearTimeout(copiedTimeoutRef.current);
        }
        copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
        toast.success(hasFrame ? 'QR code with frame copied to clipboard' : 'QR code copied to clipboard');
        onSuccess?.();
      } else {
        toast.error('Failed to copy QR code. Please try again.');
      }
    } catch {
      toast.error('Failed to copy to clipboard. Your browser may not support this feature.');
    }
  }, [qrCodeRef, frameContainerRef, hasFrame, captureFrameAsCanvas, onSuccess]);

  return {
    copied,
    isDownloading,
    handleDownload,
    handlePdfDownload,
    handleCopy,
  };
}
