import { useQRStore } from '../../stores/qrStore';
import { Shield } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel } from '../../types';

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
  options,
  value,
  onChange,
}: {
  label: string;
  options: StyleOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
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
        options={dotStyleOptions}
        value={styleOptions.dotsType}
        onChange={(value) => setStyleOptions({ dotsType: value })}
      />

      <OptionGroup
        label="Corner Squares"
        options={cornerSquareOptions}
        value={styleOptions.cornersSquareType}
        onChange={(value) => setStyleOptions({ cornersSquareType: value })}
      />

      <OptionGroup
        label="Corner Dots"
        options={cornerDotOptions}
        value={styleOptions.cornersDotType}
        onChange={(value) => setStyleOptions({ cornersDotType: value })}
      />

      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-3">
          <Shield className="w-5 h-5" />
          <h3 className="font-medium">Error Correction</h3>
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
    </div>
  );
}
