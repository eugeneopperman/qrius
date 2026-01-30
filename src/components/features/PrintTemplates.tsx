import { useState } from 'react';
import { useQRStore } from '../../stores/qrStore';
import { Printer, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PrintTemplate {
  id: string;
  name: string;
  description: string;
  width: number; // in mm
  height: number; // in mm
  qrSize: number; // QR code size in mm
  dpi: number;
}

const printTemplates: PrintTemplate[] = [
  {
    id: 'business-card',
    name: 'Business Card',
    description: '85 × 55 mm',
    width: 85,
    height: 55,
    qrSize: 25,
    dpi: 300,
  },
  {
    id: 'sticker-small',
    name: 'Small Sticker',
    description: '50 × 50 mm',
    width: 50,
    height: 50,
    qrSize: 40,
    dpi: 300,
  },
  {
    id: 'sticker-medium',
    name: 'Medium Sticker',
    description: '75 × 75 mm',
    width: 75,
    height: 75,
    qrSize: 60,
    dpi: 300,
  },
  {
    id: 'a6-flyer',
    name: 'A6 Flyer',
    description: '105 × 148 mm',
    width: 105,
    height: 148,
    qrSize: 50,
    dpi: 300,
  },
  {
    id: 'a5-flyer',
    name: 'A5 Flyer',
    description: '148 × 210 mm',
    width: 148,
    height: 210,
    qrSize: 70,
    dpi: 300,
  },
  {
    id: 'poster-a4',
    name: 'A4 Poster',
    description: '210 × 297 mm',
    width: 210,
    height: 297,
    qrSize: 100,
    dpi: 300,
  },
  {
    id: 'table-tent',
    name: 'Table Tent',
    description: '100 × 150 mm',
    width: 100,
    height: 150,
    qrSize: 60,
    dpi: 300,
  },
  {
    id: 'banner',
    name: 'Banner QR',
    description: '200 × 200 mm',
    width: 200,
    height: 200,
    qrSize: 180,
    dpi: 150,
  },
];

export function PrintTemplates() {
  const { styleOptions, getQRValue } = useQRStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  const mmToPixels = (mm: number, dpi: number) => Math.round((mm / 25.4) * dpi);

  const generatePrintReady = async (template: PrintTemplate) => {
    setIsGenerating(true);
    setSelectedTemplate(template.id);

    try {
      // Dynamic import for code splitting
      const QRCodeStyling = (await import('qr-code-styling')).default;

      const qrPixelSize = mmToPixels(template.qrSize, template.dpi);

      const qrCode = new QRCodeStyling({
        width: qrPixelSize,
        height: qrPixelSize,
        type: 'canvas',
        data: getQRValue(),
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
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 10,
          imageSize: styleOptions.logoSize || 0.3,
        },
        image: styleOptions.logoUrl,
      });

      // Generate and download
      await qrCode.download({
        name: `qrcode-${template.id}-${template.dpi}dpi`,
        extension: 'png',
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to generate print-ready QR:', error);
    } finally {
      setIsGenerating(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-3">
        <Printer className="w-5 h-5" />
        <h3 className="font-medium">Print-Ready Templates</h3>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Download high-resolution QR codes optimized for print. All templates are 300 DPI for
        professional printing quality.
      </p>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
          <Check className="w-4 h-4" />
          Print-ready QR code downloaded!
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {printTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => generatePrintReady(template)}
            disabled={isGenerating}
            className={cn(
              'flex flex-col items-start p-3 rounded-lg border transition-all text-left',
              'hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              selectedTemplate === template.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700'
            )}
          >
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {template.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{template.description}</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
              QR: {template.qrSize}mm • {template.dpi} DPI
            </span>
          </button>
        ))}
      </div>

      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tip: For best results, use high error correction when printing at smaller sizes.
        </p>
      </div>
    </div>
  );
}
