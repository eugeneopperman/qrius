import { useQRStore } from '../../stores/qrStore';
import { Shield, Eye } from 'lucide-react';
import { cn } from '../../utils/cn';
import { LabelWithTooltip, Tooltip } from '../ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import type { DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel } from '../../types';
import type { ReactNode } from 'react';

interface StyleOption<T> {
  value: T;
  label: string;
  preview?: React.ReactNode;
}

const dotStyleOptions: StyleOption<DotType>[] = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
];

const cornerSquareOptions: StyleOption<CornerSquareType>[] = [
  { value: 'square', label: 'Square' },
  { value: 'extra-rounded', label: 'Rounded' },
  { value: 'dot', label: 'Dot' },
];

const cornerDotOptions: StyleOption<CornerDotType>[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
];

const errorCorrectionOptions: StyleOption<ErrorCorrectionLevel>[] = [
  { value: 'L', label: 'Low (7%)' },
  { value: 'M', label: 'Medium (15%)' },
  { value: 'Q', label: 'Quartile (25%)' },
  { value: 'H', label: 'High (30%)' },
];

function OptionGroup<T extends string>({
  label,
  tooltip,
  options,
  value,
  onChange,
}: {
  label: string;
  tooltip?: ReactNode;
  options: StyleOption<T>[];
  value: T;
  onChange: (value: T) => void;
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
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all',
              value === option.value
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StyleSection() {
  const { styleOptions, setStyleOptions } = useQRStore();

  return (
    <div className="space-y-5">
      <OptionGroup
        label="Dot Pattern"
        tooltip={
          <div className="space-y-1">
            <p className="font-medium">The shape of each data module in the QR code.</p>
            <p className="text-gray-300 dark:text-gray-600">Square and Rounded are most reliable for scanning. Dots and Classy add visual flair but may slightly reduce scannability at small sizes.</p>
          </div>
        }
        options={dotStyleOptions}
        value={styleOptions.dotsType}
        onChange={(value) => setStyleOptions({ dotsType: value })}
      />

      <OptionGroup
        label="Corner Squares"
        tooltip={
          <div className="space-y-1">
            <p className="font-medium">The three large squares in the corners.</p>
            <p className="text-gray-300 dark:text-gray-600">These help scanners detect and orient the QR code. Changing their style has minimal impact on scannability.</p>
          </div>
        }
        options={cornerSquareOptions}
        value={styleOptions.cornersSquareType}
        onChange={(value) => setStyleOptions({ cornersSquareType: value })}
      />

      <OptionGroup
        label="Corner Dots"
        tooltip={
          <div className="space-y-1">
            <p className="font-medium">The inner dots of the corner squares.</p>
            <p className="text-gray-300 dark:text-gray-600">A small stylistic detail. Both options work reliably with all scanners.</p>
          </div>
        }
        options={cornerDotOptions}
        value={styleOptions.cornersDotType}
        onChange={(value) => setStyleOptions({ cornersDotType: value })}
      />

      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-3">
          <Shield className="w-5 h-5" />
          <LabelWithTooltip
            label="Error Correction"
            tooltip={
              <div className="space-y-2">
                <p className="font-medium">How much damage the QR code can sustain and still scan.</p>
                <ul className="text-gray-300 dark:text-gray-600 space-y-1 text-xs">
                  <li><strong>Low (7%)</strong> - Smallest QR, best for simple data</li>
                  <li><strong>Medium (15%)</strong> - Good balance (default)</li>
                  <li><strong>Quartile (25%)</strong> - Better damage tolerance</li>
                  <li><strong>High (30%)</strong> - Best for logos or print use</li>
                </ul>
              </div>
            }
          />
        </div>

        <OptionGroup
          label=""
          options={errorCorrectionOptions}
          value={styleOptions.errorCorrectionLevel}
          onChange={(value) => setStyleOptions({ errorCorrectionLevel: value })}
        />

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Higher levels allow the QR code to be read even if partially damaged or obscured.
          Use "High" when adding a logo.
        </p>
      </div>

      {/* Accessibility: Show Fallback URL */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Show Fallback Text
            </span>
            <Tooltip
              content="Display the encoded data below the QR code. Useful for accessibility or when manual entry is needed."
              position="top"
            >
              <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-help" />
            </Tooltip>
          </div>
          <button
            type="button"
            onClick={() => setStyleOptions({ showFallbackUrl: !styleOptions.showFallbackUrl })}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              styleOptions.showFallbackUrl ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                styleOptions.showFallbackUrl ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
