import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Option configuration for SelectButton.
 * @template T - String literal type for option values
 */
export interface SelectButtonOption<T extends string> {
  /** Unique value identifier */
  value: T;
  /** Display label text */
  label: string;
  /** Optional icon component (Lucide icon) */
  icon?: React.ElementType;
  /** Optional preview element (for visual selection) */
  preview?: ReactNode;
}

/**
 * Props for SelectButton component.
 * @template T - String literal type for option values
 */
interface SelectButtonProps<T extends string> {
  /** Array of selectable options */
  options: SelectButtonOption<T>[];
  /** Currently selected value */
  value: T;
  /** Callback when selection changes */
  onChange: (value: T) => void;
  /** Optional label displayed above options */
  label?: string;
  /** Show preview elements in a grid layout */
  showPreview?: boolean;
  /** Size of buttons */
  size?: 'sm' | 'md';
  /** Number of grid columns (optional, auto-calculated otherwise) */
  columns?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable button selection component for option groups.
 * Supports icons, previews, and various layout options.
 *
 * Use this component to reduce duplicate button selection patterns
 * across the codebase. Provides consistent styling and accessibility.
 *
 * @example
 * ```tsx
 * // Simple text selection
 * <SelectButton
 *   options={[
 *     { value: 'square', label: 'Square' },
 *     { value: 'rounded', label: 'Rounded' },
 *   ]}
 *   value={shape}
 *   onChange={setShape}
 *   label="Shape"
 * />
 *
 * // With icons
 * <SelectButton
 *   options={[
 *     { value: 'left', label: 'Left', icon: AlignLeft },
 *     { value: 'center', label: 'Center', icon: AlignCenter },
 *   ]}
 *   value={alignment}
 *   onChange={setAlignment}
 * />
 *
 * // With preview elements
 * <SelectButton
 *   options={dotStyles.map(style => ({
 *     value: style.type,
 *     label: style.label,
 *     preview: <DotPreview type={style.type} />
 *   }))}
 *   value={dotType}
 *   onChange={setDotType}
 *   showPreview
 * />
 * ```
 */
export function SelectButton<T extends string>({
  options,
  value,
  onChange,
  label,
  showPreview = false,
  size = 'md',
  columns,
  className,
}: SelectButtonProps<T>) {
  const sizeClasses = {
    sm: 'px-3 py-2 min-h-[36px] text-xs',
    md: 'px-3 py-2.5 min-h-[44px] text-xs',
  };

  const gridClasses = columns
    ? `grid grid-cols-${columns} gap-2`
    : showPreview
    ? 'grid grid-cols-3 sm:grid-cols-6 gap-2'
    : 'flex flex-wrap gap-1.5';

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          {label}
        </label>
      )}
      <div className={gridClasses}>
        {options.map((option) => {
          const isSelected = value === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              title={option.label}
              className={cn(
                'font-medium rounded-lg border transition-all touch-manipulation',
                'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1',
                sizeClasses[size],
                showPreview && option.preview
                  ? cn(
                      'flex flex-col items-center gap-1 p-2',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-400 ring-2 ring-indigo-500/20'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )
                  : cn(
                      'flex items-center justify-center gap-1.5',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )
              )}
            >
              {showPreview && option.preview ? (
                <>
                  <div className="w-8 h-8">{option.preview}</div>
                  <span className="text-[10px] font-medium truncate max-w-full">
                    {option.label}
                  </span>
                </>
              ) : (
                <>
                  {Icon && <Icon className="w-4 h-4" />}
                  {option.label}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Variant for icon-only selection buttons (e.g., icon picker)
 */
interface IconSelectButtonProps<T extends string> {
  options: { value: T; label: string; icon: React.ElementType | null }[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
}

export function IconSelectButton<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: IconSelectButtonProps<T>) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isSelected = value === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              title={option.label}
              className={cn(
                'p-2 min-w-[36px] min-h-[36px] rounded-md border transition-colors touch-manipulation',
                'flex items-center justify-center',
                'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1',
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-600 dark:text-gray-400'
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Color palette selection component
 */
interface ColorPaletteOption {
  name: string;
  qrColor: string;
  bgColor: string;
}

interface ColorPaletteSelectProps {
  options: ColorPaletteOption[];
  currentQrColor: string;
  currentBgColor: string;
  onChange: (qrColor: string, bgColor: string) => void;
  label?: string;
  className?: string;
}

export function ColorPaletteSelect({
  options,
  currentQrColor,
  currentBgColor,
  onChange,
  label,
  className,
}: ColorPaletteSelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="grid grid-cols-4 gap-2">
        {options.map((palette) => {
          const isSelected =
            currentQrColor === palette.qrColor && currentBgColor === palette.bgColor;

          return (
            <button
              key={palette.name}
              type="button"
              onClick={() => onChange(palette.qrColor, palette.bgColor)}
              aria-pressed={isSelected}
              title={palette.name}
              className={cn(
                'group relative h-10 rounded-lg border overflow-hidden transition-all',
                'hover:ring-2 hover:ring-indigo-500',
                'focus:outline-none focus:ring-2 focus:ring-orange-400',
                isSelected ? 'ring-2 ring-indigo-500' : 'border-gray-200 dark:border-gray-600'
              )}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: palette.bgColor }}
              >
                <div
                  className="w-5 h-5 rounded-sm"
                  style={{ backgroundColor: palette.qrColor }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Gradient preset selection component
 */
interface GradientPresetOption {
  name: string;
  gradient: string; // CSS gradient string
}

interface GradientPresetSelectProps {
  options: GradientPresetOption[];
  onSelect: (index: number) => void;
  label?: string;
  className?: string;
}

export function GradientPresetSelect({
  options,
  onSelect,
  label,
  className,
}: GradientPresetSelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="grid grid-cols-3 gap-2">
        {options.map((preset, index) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onSelect(index)}
            title={preset.name}
            className={cn(
              'group relative h-8 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden',
              'hover:ring-2 hover:ring-indigo-500 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-orange-400'
            )}
          >
            <div className="absolute inset-0" style={{ background: preset.gradient }} />
          </button>
        ))}
      </div>
    </div>
  );
}
