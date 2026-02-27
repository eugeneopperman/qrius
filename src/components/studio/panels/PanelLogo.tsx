import { memo, useRef, useState, useCallback } from 'react';
import { useStudioStore } from '@/stores/studioStore';
import { useShallow } from 'zustand/react/shallow';
import { Upload, X, AlertCircle, Square, Circle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SelectButtonGroup } from '@/components/ui/SelectButtonGroup';
import { cn } from '@/utils/cn';
import { LOGO_CONFIG } from '@/config/constants';
import type { LogoShape } from '@/types';

export const PanelLogo = memo(function PanelLogo() {
  const { style, updateStyle } = useStudioStore(
    useShallow((s) => ({ style: s.style, updateStyle: s.updateStyle }))
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

      if (isSvg) {
        const textReader = new FileReader();
        textReader.onload = (e) => {
          const svgContent = e.target?.result as string;
          // Basic SVG sanitization
          const parser = new DOMParser();
          const doc = parser.parseFromString(svgContent, 'image/svg+xml');
          const svg = doc.documentElement;
          svg.querySelectorAll('script').forEach((el) => el.remove());
          const allEls = svg.querySelectorAll('*');
          allEls.forEach((el) => {
            Array.from(el.attributes).forEach((attr) => {
              if (attr.name.startsWith('on') || (attr.name === 'href' && attr.value.startsWith('javascript:'))) {
                el.removeAttribute(attr.name);
              }
            });
          });
          const sanitized = new XMLSerializer().serializeToString(svg);
          const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(sanitized)));
          updateStyle({ logoUrl: dataUrl });
        };
        textReader.readAsText(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          updateStyle({ logoUrl: e.target?.result as string });
        };
        reader.readAsDataURL(file);
      }
    },
    [updateStyle]
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

  const handleRemove = useCallback(() => {
    updateStyle({ logoUrl: undefined, logoSize: LOGO_CONFIG.DEFAULT_SIZE });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [updateStyle]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Logo</h3>

      {!style.logoUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors',
            dragOver
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'
          )}
        >
          <Upload className="w-6 h-6 mx-auto mb-1.5 text-gray-400" />
          <p className="text-xs text-gray-600 dark:text-gray-400">Drop image or click to upload</p>
          <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, SVG (max 2MB)</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative inline-block">
            <img
              src={style.logoUrl}
              alt="Logo"
              loading="lazy"
              className={cn(
                'w-16 h-16 object-cover border border-gray-200 dark:border-gray-700 bg-white',
                style.logoShape === 'circle' ? 'rounded-full' : style.logoShape === 'rounded' ? 'rounded-xl' : 'rounded-lg'
              )}
            />
            <button
              onClick={handleRemove}
              aria-label="Remove logo"
              className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Size */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Size</label>
            <SelectButtonGroup
              options={LOGO_CONFIG.SIZE_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
              value={String(style.logoSize || LOGO_CONFIG.DEFAULT_SIZE)}
              onChange={(v) => updateStyle({ logoSize: parseFloat(v) })}
              size="sm"
            />
          </div>

          {/* Shape */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Shape</label>
            <SelectButtonGroup
              options={[
                { value: 'square' as LogoShape, label: 'Square', icon: Square },
                { value: 'rounded' as LogoShape, label: 'Rounded', icon: Square },
                { value: 'circle' as LogoShape, label: 'Circle', icon: Circle },
              ]}
              value={(style.logoShape || 'square') as LogoShape}
              onChange={(v) => updateStyle({ logoShape: v as LogoShape })}
              size="sm"
            />
          </div>

          {/* Padding */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Padding</label>
            <SelectButtonGroup
              options={LOGO_CONFIG.PADDING_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
              value={String(style.logoMargin ?? LOGO_CONFIG.DEFAULT_MARGIN)}
              onChange={(v) => updateStyle({ logoMargin: parseInt(v) })}
              size="sm"
            />
          </div>

          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
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
        <div className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}

      {style.logoUrl && (
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          Larger logos require higher error correction for reliable scanning.
        </p>
      )}
    </div>
  );
});

PanelLogo.displayName = 'PanelLogo';
