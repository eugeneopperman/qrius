import { useState, useRef, useEffect } from 'react';
import { useQRStore } from '@/stores/qrStore';
import { toast } from '@/stores/toastStore';
import { createQRElementOptions } from '@/utils/gradientUtils';
import { Printer, Check, FileImage, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';
import { LabelWithTooltip } from '../ui/Tooltip';

interface PrintTemplate {
  id: string;
  name: string;
  description: string;
  width: number; // in mm
  height: number; // in mm
  qrSize: number; // QR code size in mm
  dpi: number;
}

type ExportFormat = 'png' | 'pdf';

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
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [includeBleed, setIncludeBleed] = useState(true);
  const [includeCropMarks, setIncludeCropMarks] = useState(true);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const BLEED_MM = 3; // Standard 3mm bleed
  const CROP_MARK_LENGTH = 5; // 5mm crop marks
  const CROP_MARK_OFFSET = 3; // 3mm from edge

  const mmToPixels = (mm: number, dpi: number) => Math.round((mm / 25.4) * dpi);

  const generateQRCanvas = async (template: PrintTemplate): Promise<HTMLCanvasElement> => {
    const QRCodeStyling = (await import('qr-code-styling')).default;
    const qrPixelSize = mmToPixels(template.qrSize, template.dpi);

    // Build QR element options using shared utility
    const dotsOptions = createQRElementOptions(
      styleOptions.dotsType,
      styleOptions.useGradient || false,
      styleOptions.gradient,
      styleOptions.dotsColor
    );

    const cornersSquareOptions = createQRElementOptions(
      styleOptions.cornersSquareType,
      styleOptions.useGradient || false,
      styleOptions.gradient,
      styleOptions.dotsColor
    );

    const cornersDotOptions = createQRElementOptions(
      styleOptions.cornersDotType,
      styleOptions.useGradient || false,
      styleOptions.gradient,
      styleOptions.dotsColor
    );

    const qrCode = new QRCodeStyling({
      width: qrPixelSize,
      height: qrPixelSize,
      type: 'canvas',
      data: getQRValue(),
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
        margin: 10,
        imageSize: styleOptions.logoSize || 0.3,
      },
      image: styleOptions.logoUrl,
    });

    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    await qrCode.append(container);

    // Wait for rendering
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = container.querySelector('canvas');
    if (!canvas) {
      document.body.removeChild(container);
      throw new Error('Failed to generate QR canvas');
    }

    // Clone the canvas before removing container
    const clonedCanvas = document.createElement('canvas');
    clonedCanvas.width = canvas.width;
    clonedCanvas.height = canvas.height;
    const ctx = clonedCanvas.getContext('2d');
    ctx?.drawImage(canvas, 0, 0);

    document.body.removeChild(container);
    return clonedCanvas;
  };

  const generatePDF = async (template: PrintTemplate, qrCanvas: HTMLCanvasElement) => {
    const { jsPDF } = await import('jspdf');

    // Calculate dimensions with bleed
    const bleed = includeBleed ? BLEED_MM : 0;
    const totalWidth = template.width + bleed * 2;
    const totalHeight = template.height + bleed * 2;

    // Create PDF with bleed area
    const pdf = new jsPDF({
      orientation: totalWidth > totalHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [totalWidth, totalHeight],
    });

    // Fill background
    pdf.setFillColor(styleOptions.backgroundColor);
    pdf.rect(0, 0, totalWidth, totalHeight, 'F');

    // Calculate QR position (centered)
    const qrX = (totalWidth - template.qrSize) / 2;
    const qrY = (totalHeight - template.qrSize) / 2;

    // Add QR code
    const qrDataUrl = qrCanvas.toDataURL('image/png');
    pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, template.qrSize, template.qrSize);

    // Add crop marks if enabled
    if (includeCropMarks && includeBleed) {
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.25);

      // Top-left corner
      pdf.line(bleed, CROP_MARK_OFFSET, bleed, CROP_MARK_OFFSET + CROP_MARK_LENGTH); // Vertical
      pdf.line(CROP_MARK_OFFSET, bleed, CROP_MARK_OFFSET + CROP_MARK_LENGTH, bleed); // Horizontal

      // Top-right corner
      pdf.line(totalWidth - bleed, CROP_MARK_OFFSET, totalWidth - bleed, CROP_MARK_OFFSET + CROP_MARK_LENGTH);
      pdf.line(totalWidth - CROP_MARK_OFFSET, bleed, totalWidth - CROP_MARK_OFFSET - CROP_MARK_LENGTH, bleed);

      // Bottom-left corner
      pdf.line(bleed, totalHeight - CROP_MARK_OFFSET, bleed, totalHeight - CROP_MARK_OFFSET - CROP_MARK_LENGTH);
      pdf.line(CROP_MARK_OFFSET, totalHeight - bleed, CROP_MARK_OFFSET + CROP_MARK_LENGTH, totalHeight - bleed);

      // Bottom-right corner
      pdf.line(totalWidth - bleed, totalHeight - CROP_MARK_OFFSET, totalWidth - bleed, totalHeight - CROP_MARK_OFFSET - CROP_MARK_LENGTH);
      pdf.line(totalWidth - CROP_MARK_OFFSET, totalHeight - bleed, totalWidth - CROP_MARK_OFFSET - CROP_MARK_LENGTH, totalHeight - bleed);
    }

    // Save PDF
    pdf.save(`qrcode-${template.id}${includeBleed ? '-with-bleed' : ''}.pdf`);
  };

  const generatePNG = async (template: PrintTemplate, qrCanvas: HTMLCanvasElement) => {
    // For PNG, just download the QR code directly
    const link = document.createElement('a');
    link.download = `qrcode-${template.id}-${template.dpi}dpi.png`;
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
  };

  const generatePrintReady = async (template: PrintTemplate) => {
    setIsGenerating(true);
    setSelectedTemplate(template.id);

    try {
      const qrCanvas = await generateQRCanvas(template);

      if (exportFormat === 'pdf') {
        await generatePDF(template, qrCanvas);
      } else {
        await generatePNG(template, qrCanvas);
      }

      setSuccess(true);
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = setTimeout(() => setSuccess(false), 2000);
      toast.success(`Print-ready ${exportFormat.toUpperCase()} downloaded for ${template.name}`);
    } catch {
      toast.error('Failed to generate print-ready file. Please try again.');
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

      {/* Export Options */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
        {/* Format Selection */}
        <div>
          <LabelWithTooltip
            label="Export Format"
            tooltip="PDF is recommended for professional printing with bleed marks. PNG exports just the QR code at high resolution."
            className="mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setExportFormat('pdf')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex-1',
                exportFormat === 'pdf'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
              )}
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={() => setExportFormat('png')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex-1',
                exportFormat === 'png'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
              )}
            >
              <FileImage className="w-4 h-4" />
              PNG
            </button>
          </div>
        </div>

        {/* PDF Options */}
        {exportFormat === 'pdf' && (
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeBleed}
                onChange={(e) => setIncludeBleed(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Include 3mm bleed area
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCropMarks}
                onChange={(e) => setIncludeCropMarks(e.target.checked)}
                disabled={!includeBleed}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
              />
              <span className={cn(
                "text-sm",
                includeBleed ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
              )}>
                Include crop marks
              </span>
            </label>
          </div>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
          <Check className="w-4 h-4" />
          Print-ready {exportFormat.toUpperCase()} downloaded!
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
          {exportFormat === 'pdf' && includeBleed && ' The bleed area ensures colors extend to the edge after trimming.'}
        </p>
      </div>
    </div>
  );
}
