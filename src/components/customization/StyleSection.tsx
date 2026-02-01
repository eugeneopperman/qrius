import { memo, useCallback, type ReactNode } from 'react';
import { useQRStore } from '../../stores/qrStore';
import { Eye, HelpCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { LabelWithTooltip, Tooltip } from '../ui/Tooltip';
import { InlineToggle } from '../ui/Toggle';
import type { DotType, CornerSquareType } from '../../types';

interface StyleOption<T> {
  value: T;
  label: string;
  preview?: ReactNode;
}

// Visual previews for dot patterns
function DotPreview({ type }: { type: DotType }) {
  const patterns: Record<DotType, ReactNode> = {
    square: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="2" y="2" width="6" height="6" fill="currentColor" />
        <rect x="10" y="2" width="6" height="6" fill="currentColor" />
        <rect x="2" y="10" width="6" height="6" fill="currentColor" />
        <rect x="16" y="10" width="6" height="6" fill="currentColor" />
        <rect x="10" y="16" width="6" height="6" fill="currentColor" />
      </svg>
    ),
    dots: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <circle cx="5" cy="5" r="3" fill="currentColor" />
        <circle cx="13" cy="5" r="3" fill="currentColor" />
        <circle cx="5" cy="13" r="3" fill="currentColor" />
        <circle cx="19" cy="13" r="3" fill="currentColor" />
        <circle cx="13" cy="19" r="3" fill="currentColor" />
      </svg>
    ),
    rounded: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="2" y="2" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="10" y="2" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="2" y="10" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="16" y="10" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="10" y="16" width="6" height="6" rx="1.5" fill="currentColor" />
      </svg>
    ),
    'extra-rounded': (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="2" y="2" width="6" height="6" rx="3" fill="currentColor" />
        <rect x="10" y="2" width="6" height="6" rx="3" fill="currentColor" />
        <rect x="2" y="10" width="6" height="6" rx="3" fill="currentColor" />
        <rect x="16" y="10" width="6" height="6" rx="3" fill="currentColor" />
        <rect x="10" y="16" width="6" height="6" rx="3" fill="currentColor" />
      </svg>
    ),
    classy: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M2 2h6v6H2z M10 2h6v6h-6z M2 10h6v6H2z M16 10h6v6h-6z M10 16h6v6h-6z" fill="currentColor" />
        <rect x="4" y="4" width="2" height="2" fill="white" opacity="0.3" />
        <rect x="12" y="4" width="2" height="2" fill="white" opacity="0.3" />
      </svg>
    ),
    'classy-rounded': (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="2" y="2" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="10" y="2" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="2" y="10" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="16" y="10" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="10" y="16" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="3" y="3" width="2" height="2" rx="0.5" fill="white" opacity="0.2" />
      </svg>
    ),
  };
  return patterns[type] || patterns.square;
}

// Unified QR style options - sets both dots and corner squares consistently
const qrStyleOptions: StyleOption<DotType>[] = [
  { value: 'square', label: 'Square', preview: <DotPreview type="square" /> },
  { value: 'dots', label: 'Dots', preview: <DotPreview type="dots" /> },
  { value: 'rounded', label: 'Rounded', preview: <DotPreview type="rounded" /> },
  { value: 'extra-rounded', label: 'Extra Rounded', preview: <DotPreview type="extra-rounded" /> },
  { value: 'classy', label: 'Classy', preview: <DotPreview type="classy" /> },
  { value: 'classy-rounded', label: 'Classy Rounded', preview: <DotPreview type="classy-rounded" /> },
];

// Map dot types to matching corner square types for consistent styling
const dotToCornerSquareMap: Record<DotType, CornerSquareType> = {
  'square': 'square',
  'dots': 'dot',
  'rounded': 'extra-rounded',
  'extra-rounded': 'extra-rounded',
  'classy': 'square',
  'classy-rounded': 'extra-rounded',
};

function OptionGroup<T extends string>({
  label,
  tooltip,
  options,
  value,
  onChange,
  showPreview = false,
}: {
  label: string;
  tooltip?: ReactNode;
  options: StyleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  showPreview?: boolean;
}) {
  return (
    <div>
      {label && (
        tooltip ? (
          <LabelWithTooltip label={label} tooltip={tooltip} className="mb-2" />
        ) : (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )
      )}
      <div className={cn(
        showPreview ? 'grid grid-cols-3 sm:grid-cols-6 gap-2' : 'flex flex-wrap gap-2'
      )}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            title={option.label}
            className={cn(
              'transition-all',
              showPreview && option.preview
                ? cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg border',
                    value === option.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-400 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )
                : cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg border',
                    value === option.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )
            )}
          >
            {showPreview && option.preview ? (
              <>
                <div className="w-8 h-8">
                  {option.preview}
                </div>
                <span className="text-[10px] font-medium truncate max-w-full">{option.label}</span>
              </>
            ) : (
              option.label
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export const StyleSection = memo(function StyleSection() {
  const { styleOptions, setStyleOptions } = useQRStore();

  // Handle unified style change - sets both dots and corner squares
  const handleStyleChange = useCallback((dotType: DotType) => {
    const cornerSquareType = dotToCornerSquareMap[dotType];
    const cornerDotType = cornerSquareType === 'dot' ? 'dot' : cornerSquareType === 'extra-rounded' ? 'extra-rounded' : 'square';
    setStyleOptions({
      dotsType: dotType,
      cornersSquareType: cornerSquareType,
      cornersDotType: cornerDotType,
    });
  }, [setStyleOptions]);

  const handleToggleFallback = useCallback(() => {
    setStyleOptions({ showFallbackUrl: !styleOptions.showFallbackUrl });
  }, [styleOptions.showFallbackUrl, setStyleOptions]);

  return (
    <div className="space-y-5">
      <OptionGroup
        label="QR Style"
        tooltip={
          <div className="space-y-1">
            <p className="font-medium">The visual style of your QR code.</p>
            <p className="text-gray-300 dark:text-gray-600">Square and Rounded are most reliable for scanning. Dots and Classy add visual flair but may slightly reduce scannability at small sizes.</p>
          </div>
        }
        options={qrStyleOptions}
        value={styleOptions.dotsType}
        onChange={handleStyleChange}
        showPreview
      />

      {/* Accessibility: Show Fallback URL */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <InlineToggle
            checked={styleOptions.showFallbackUrl ?? false}
            onChange={handleToggleFallback}
            label="Show Fallback Text"
            tooltip={
              <Tooltip
                content="Display the encoded data below the QR code. Useful for accessibility or when manual entry is needed."
                position="top"
              >
                <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-help" />
              </Tooltip>
            }
          />
        </div>
      </div>
    </div>
  );
});

StyleSection.displayName = 'StyleSection';
