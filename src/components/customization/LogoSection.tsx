import { useRef, useState, useCallback, memo } from 'react';
import { useQRStore } from '@/stores/qrStore';
import { useShallow } from 'zustand/react/shallow';
import { Upload, X, AlertCircle, Square, Circle } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '@/utils/cn';
import { LabelWithTooltip } from '../ui/Tooltip';
import { SelectButtonGroup } from '../ui/SelectButtonGroup';
import { LOGO_CONFIG } from '@/config/constants';
import type { LogoShape } from '@/types';

export const LogoSection = memo(function LogoSection() {
  const { styleOptions, setStyleOptions } = useQRStore(useShallow((s) => ({ styleOptions: s.styleOptions, setStyleOptions: s.setStyleOptions })));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, SVG)');
      return;
    }

    // Validate file size
    if (file.size > LOGO_CONFIG.MAX_FILE_SIZE) {
      setError('Image must be less than 2MB');
      return;
    }

    // Sanitize SVG content to remove potentially dangerous elements
    const sanitizeSvg = (svgContent: string): string => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svg = doc.documentElement;

      // Remove script elements
      svg.querySelectorAll('script').forEach(el => el.remove());

      // Remove event handlers from all elements
      const allElements = svg.querySelectorAll('*');
      allElements.forEach(el => {
        // Remove event handler attributes
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('on') || attr.name === 'href' && attr.value.startsWith('javascript:')) {
            el.removeAttribute(attr.name);
          }
        });
      });

      // Remove external references (use, image with external href)
      svg.querySelectorAll('use[href^="http"], use[xlink\\:href^="http"], image[href^="http"], image[xlink\\:href^="http"]').forEach(el => {
        el.remove();
      });

      return new XMLSerializer().serializeToString(svg);
    };

    // Check if it's an SVG file
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

    if (isSvg) {
      // Read SVG as text to preserve vector data
      const textReader = new FileReader();
      textReader.onload = (e) => {
        const svgContent = e.target?.result as string;
        // Sanitize SVG content (remove scripts, event handlers, external references)
        const sanitizedSvg = sanitizeSvg(svgContent);

        // Also create a data URL for preview
        const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(sanitizedSvg)));
        setStyleOptions({ logoUrl: dataUrl, logoSvgContent: sanitizedSvg });
      };
      textReader.readAsText(file);
    } else {
      // For raster images, just read as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setStyleOptions({ logoUrl: dataUrl, logoSvgContent: undefined });
      };
      reader.readAsDataURL(file);
    }
  }, [setStyleOptions]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleRemoveLogo = useCallback(() => {
    setStyleOptions({ logoUrl: undefined, logoSvgContent: undefined, logoSize: LOGO_CONFIG.DEFAULT_SIZE });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setStyleOptions]);

  return (
    <div className="space-y-4">
      {!styleOptions.logoUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            dragOver
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Drop an image here or click to upload
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            PNG, JPG, or SVG (max 2MB)
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative inline-block">
            <img
              src={styleOptions.logoUrl}
              alt="Logo preview"
              loading="lazy"
              className={cn(
                "w-20 h-20 object-cover border border-gray-200 dark:border-gray-700 bg-white",
                styleOptions.logoShape === 'circle' ? "rounded-full" :
                styleOptions.logoShape === 'rounded' ? "rounded-xl" : "rounded-lg"
              )}
            />
            <button
              onClick={handleRemoveLogo}
              aria-label="Remove logo"
              className="absolute -top-2 -right-2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <LabelWithTooltip
              label="Logo Size"
              tooltip={
                <div className="space-y-1">
                  <p className="font-medium">How much of the QR code the logo covers.</p>
                  <p className="text-gray-300 dark:text-gray-600">Larger logos look better but reduce scannability. Keep it under 25% for best results, and use High error correction.</p>
                </div>
              }
              className="mb-2"
            />
            <SelectButtonGroup
              options={LOGO_CONFIG.SIZE_OPTIONS.map(o => ({ value: String(o.value), label: o.label }))}
              value={String(styleOptions.logoSize || LOGO_CONFIG.DEFAULT_SIZE)}
              onChange={(v) => setStyleOptions({ logoSize: parseFloat(v) })}
              size="md"
            />
          </div>

          {/* Logo Shape */}
          <div>
            <LabelWithTooltip
              label="Logo Shape"
              tooltip="Apply a shape mask to your logo. Circular logos work well for profile pictures or round brand marks."
              className="mb-2"
            />
            <SelectButtonGroup
              options={[
                { value: 'square' as LogoShape, label: 'Square', icon: Square },
                { value: 'rounded' as LogoShape, label: 'Rounded', icon: Square },
                { value: 'circle' as LogoShape, label: 'Circle', icon: Circle },
              ]}
              value={(styleOptions.logoShape || 'square') as LogoShape}
              onChange={(v) => setStyleOptions({ logoShape: v as LogoShape })}
              size="md"
            />
          </div>

          {/* Logo Padding */}
          <div>
            <LabelWithTooltip
              label="Logo Padding"
              tooltip="Space between the logo and QR code modules. Less padding makes the logo appear larger but may affect scannability."
              className="mb-2"
            />
            <SelectButtonGroup
              options={LOGO_CONFIG.PADDING_OPTIONS.map(o => ({ value: String(o.value), label: o.label }))}
              value={String(styleOptions.logoMargin ?? LOGO_CONFIG.DEFAULT_MARGIN)}
              onChange={(v) => setStyleOptions({ logoMargin: parseInt(v) })}
              size="md"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Change Logo
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {styleOptions.logoUrl && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Note: Larger logos require higher error correction for reliable scanning.
        </p>
      )}
    </div>
  );
});

LogoSection.displayName = 'LogoSection';
