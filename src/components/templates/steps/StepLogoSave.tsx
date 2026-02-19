import { memo, useRef, useState, useCallback } from 'react';
import { Upload, X, AlertCircle, Square, Circle, Save, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { LOGO_CONFIG } from '@/config/constants';
import type { BrandTemplateStyle, LogoShape } from '@/types';

interface StepLogoSaveProps {
  style: BrandTemplateStyle;
  onStyleChange: (updates: Partial<BrandTemplateStyle>) => void;
  templateName: string;
  isEditing: boolean;
}

export const StepLogoSave = memo(function StepLogoSave({
  style,
  onStyleChange,
  templateName,
  isEditing,
}: StepLogoSaveProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sanitize SVG content to remove potentially dangerous elements
  const sanitizeSvg = (svgContent: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svg = doc.documentElement;

    // Remove script elements
    svg.querySelectorAll('script').forEach((el) => el.remove());

    // Remove event handlers from all elements
    const allElements = svg.querySelectorAll('*');
    allElements.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (
          attr.name.startsWith('on') ||
          (attr.name === 'href' && attr.value.startsWith('javascript:'))
        ) {
          el.removeAttribute(attr.name);
        }
      });
    });

    // Remove external references
    svg
      .querySelectorAll(
        'use[href^="http"], use[xlink\\:href^="http"], image[href^="http"], image[xlink\\:href^="http"]'
      )
      .forEach((el) => {
        el.remove();
      });

    return new XMLSerializer().serializeToString(svg);
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      setError(null);

      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (PNG, JPG, SVG)');
        return;
      }

      if (file.size > LOGO_CONFIG.MAX_FILE_SIZE) {
        setError('Image must be less than 2MB');
        return;
      }

      const isSvg =
        file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

      if (isSvg) {
        const textReader = new FileReader();
        textReader.onload = (e) => {
          const svgContent = e.target?.result as string;
          const sanitizedSvg = sanitizeSvg(svgContent);
          const dataUrl =
            'data:image/svg+xml;base64,' +
            btoa(unescape(encodeURIComponent(sanitizedSvg)));
          onStyleChange({ logoUrl: dataUrl, logoSvgContent: sanitizedSvg });
        };
        textReader.readAsText(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          onStyleChange({ logoUrl: dataUrl, logoSvgContent: undefined });
        };
        reader.readAsDataURL(file);
      }
    },
    [onStyleChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleRemoveLogo = useCallback(() => {
    onStyleChange({
      logoUrl: undefined,
      logoSvgContent: undefined,
      logoSize: LOGO_CONFIG.DEFAULT_SIZE,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onStyleChange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
          <Save className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Logo & Save
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add an optional logo and review your template before saving.
          </p>
        </div>
      </div>

      {/* Logo Upload */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Logo (Optional)
        </label>

        {!style.logoUrl ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
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
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            {/* Logo Preview */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={style.logoUrl}
                  alt="Logo preview"
                  className={cn(
                    'w-20 h-20 object-cover border border-gray-200 dark:border-gray-700 bg-white',
                    style.logoShape === 'circle'
                      ? 'rounded-full'
                      : style.logoShape === 'rounded'
                      ? 'rounded-xl'
                      : 'rounded-lg'
                  )}
                />
                <button
                  onClick={handleRemoveLogo}
                  aria-label="Remove logo"
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Logo uploaded
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1"
                >
                  Change Logo
                </Button>
              </div>
            </div>

            {/* Logo Size */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Logo Size
              </label>
              <div className="flex flex-wrap gap-2">
                {LOGO_CONFIG.SIZE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onStyleChange({ logoSize: option.value })}
                    className={cn(
                      'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                      (style.logoSize || LOGO_CONFIG.DEFAULT_SIZE) === option.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Shape */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Logo Shape
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: 'square' as LogoShape, label: 'Square', icon: Square },
                    { value: 'rounded' as LogoShape, label: 'Rounded', icon: Square },
                    { value: 'circle' as LogoShape, label: 'Circle', icon: Circle },
                  ] as const
                ).map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => onStyleChange({ logoShape: option.value })}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                        (style.logoShape || 'square') === option.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-600 dark:text-gray-400'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-3.5 h-3.5',
                          option.value === 'rounded' && 'rounded-sm'
                        )}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logo Padding */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Logo Padding
              </label>
              <div className="flex flex-wrap gap-2">
                {LOGO_CONFIG.PADDING_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onStyleChange({ logoMargin: option.value })}
                    className={cn(
                      'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                      (style.logoMargin ?? 5) === option.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
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
      </div>

      {/* Template Summary */}
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h4 className="font-medium text-indigo-900 dark:text-indigo-200">
            Ready to {isEditing ? 'Update' : 'Save'}
          </h4>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-indigo-700 dark:text-indigo-300">Template Name:</span>
            <span className="font-medium text-indigo-900 dark:text-indigo-100">
              {templateName || 'Untitled Template'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-indigo-700 dark:text-indigo-300">Colors:</span>
            <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded border border-indigo-300 dark:border-indigo-600"
                style={{ backgroundColor: style.dotsColor || '#000000' }}
              />
              <span className="text-indigo-900 dark:text-indigo-100">on</span>
              <div
                className="w-4 h-4 rounded border border-indigo-300 dark:border-indigo-600"
                style={{ backgroundColor: style.backgroundColor || '#ffffff' }}
              />
            </div>
          </div>
          {style.useGradient && (
            <div className="flex justify-between">
              <span className="text-indigo-700 dark:text-indigo-300">Gradient:</span>
              <span className="font-medium text-indigo-900 dark:text-indigo-100 capitalize">
                {style.gradient?.type || 'Linear'}
              </span>
            </div>
          )}
          {style.frameStyle && style.frameStyle !== 'none' && (
            <div className="flex justify-between">
              <span className="text-indigo-700 dark:text-indigo-300">Frame:</span>
              <span className="font-medium text-indigo-900 dark:text-indigo-100 capitalize">
                {style.frameStyle.replace('-', ' ')}
              </span>
            </div>
          )}
          {style.googleFontFamily && (
            <div className="flex justify-between">
              <span className="text-indigo-700 dark:text-indigo-300">Font:</span>
              <span className="font-medium text-indigo-900 dark:text-indigo-100">
                {style.googleFontFamily}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-indigo-700 dark:text-indigo-300">Logo:</span>
            <span className="font-medium text-indigo-900 dark:text-indigo-100">
              {style.logoUrl ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Click "{isEditing ? 'Update Template' : 'Save Template'}" below to save your template.
        You can edit or duplicate it anytime from the Templates panel.
      </p>
    </div>
  );
});

StepLogoSave.displayName = 'StepLogoSave';
