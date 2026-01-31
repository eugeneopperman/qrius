import { useRef, useState } from 'react';
import { useQRStore } from '../../stores/qrStore';
import { Upload, X, AlertCircle, Square, Circle } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { LabelWithTooltip } from '../ui/Tooltip';
import type { LogoShape } from '../../types';

export function LogoSection() {
  const { styleOptions, setStyleOptions } = useQRStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, SVG)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setStyleOptions({ logoUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemoveLogo = () => {
    setStyleOptions({ logoUrl: undefined, logoSize: 0.3 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const logoSizeOptions = [
    { value: 0.15, label: 'Small (15%)' },
    { value: 0.2, label: 'Medium (20%)' },
    { value: 0.25, label: 'Large (25%)' },
    { value: 0.3, label: 'Extra Large (30%)' },
  ];

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
            <div className="flex flex-wrap gap-2">
              {logoSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStyleOptions({ logoSize: option.value })}
                  className={cn(
                    'px-3 py-2.5 min-h-[44px] text-xs font-medium rounded-lg border transition-colors touch-manipulation',
                    (styleOptions.logoSize || 0.3) === option.value
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
            <LabelWithTooltip
              label="Logo Shape"
              tooltip="Apply a shape mask to your logo. Circular logos work well for profile pictures or round brand marks."
              className="mb-2"
            />
            <div className="flex flex-wrap gap-2">
              {([
                { value: 'square' as LogoShape, label: 'Square', icon: Square },
                { value: 'rounded' as LogoShape, label: 'Rounded', icon: Square },
                { value: 'circle' as LogoShape, label: 'Circle', icon: Circle },
              ]).map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setStyleOptions({ logoShape: option.value })}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] text-xs font-medium rounded-lg border transition-colors touch-manipulation',
                      (styleOptions.logoShape || 'square') === option.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    <Icon className={cn(
                      "w-3.5 h-3.5",
                      option.value === 'rounded' && "rounded-sm"
                    )} />
                    {option.label}
                  </button>
                );
              })}
            </div>
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
}
