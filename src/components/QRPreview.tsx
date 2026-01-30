import { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { useQRStore } from '../stores/qrStore';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from './ui/Button';

export function QRPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const [copied, setCopied] = useState(false);
  const { getQRValue, styleOptions } = useQRStore();

  const qrValue = getQRValue();

  useEffect(() => {
    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling({
        width: 280,
        height: 280,
        type: 'svg',
        data: qrValue,
        dotsOptions: {
          color: styleOptions.dotsColor,
          type: styleOptions.dotsType,
        },
        cornersSquareOptions: {
          color: styleOptions.dotsColor,
          type: styleOptions.cornersSquareType,
        },
        cornersDotOptions: {
          color: styleOptions.dotsColor,
          type: styleOptions.cornersDotType,
        },
        backgroundOptions: {
          color: styleOptions.backgroundColor,
        },
        qrOptions: {
          errorCorrectionLevel: styleOptions.errorCorrectionLevel,
        },
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        qrCodeRef.current.append(containerRef.current);
      }
    }
  }, []);

  useEffect(() => {
    if (qrCodeRef.current) {
      qrCodeRef.current.update({
        data: qrValue,
        dotsOptions: {
          color: styleOptions.dotsColor,
          type: styleOptions.dotsType,
        },
        cornersSquareOptions: {
          color: styleOptions.dotsColor,
          type: styleOptions.cornersSquareType,
        },
        cornersDotOptions: {
          color: styleOptions.dotsColor,
          type: styleOptions.cornersDotType,
        },
        backgroundOptions: {
          color: styleOptions.backgroundColor,
        },
        qrOptions: {
          errorCorrectionLevel: styleOptions.errorCorrectionLevel,
        },
      });
    }
  }, [qrValue, styleOptions]);

  const handleDownload = async (format: 'png' | 'svg') => {
    if (qrCodeRef.current) {
      await qrCodeRef.current.download({
        name: 'qrcode',
        extension: format,
      });
    }
  };

  const handleCopy = async () => {
    if (qrCodeRef.current) {
      try {
        const blob = await qrCodeRef.current.getRawData('png');
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div
          ref={containerRef}
          className="flex items-center justify-center"
          style={{ minWidth: 280, minHeight: 280 }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="primary"
          size="md"
          onClick={() => handleDownload('png')}
        >
          <Download className="w-4 h-4" />
          Download PNG
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={() => handleDownload('svg')}
        >
          <Download className="w-4 h-4" />
          SVG
        </Button>
        <Button variant="ghost" size="md" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
