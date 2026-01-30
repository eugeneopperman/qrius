import { useQRStore } from '../../stores/qrStore';
import { Type } from 'lucide-react';
import { Input } from '../ui/Input';
import { cn } from '../../utils/cn';
import type { FrameStyle } from '../../types';

const frameTemplates: { id: FrameStyle; label: string; hasLabel: boolean }[] = [
  { id: 'none', label: 'None', hasLabel: false },
  { id: 'simple', label: 'Simple Border', hasLabel: false },
  { id: 'rounded', label: 'Rounded Border', hasLabel: false },
  { id: 'bottom-label', label: 'Bottom Label', hasLabel: true },
  { id: 'top-label', label: 'Top Label', hasLabel: true },
  { id: 'badge', label: 'Badge Style', hasLabel: true },
];

const defaultLabels = [
  'Scan Me',
  'Learn More',
  'Get Started',
  'Download App',
  'Visit Website',
  'Contact Us',
];

export function FrameSection() {
  const { styleOptions, setStyleOptions } = useQRStore();

  const selectedFrame = styleOptions.frameStyle || 'none';
  const currentLabel = styleOptions.frameLabel || '';
  const showLabelInput = frameTemplates.find(f => f.id === selectedFrame)?.hasLabel;

  return (
    <div className="space-y-4">
      {/* Frame Template Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Frame Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {frameTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => setStyleOptions({ frameStyle: template.id })}
              className={cn(
                'p-3 text-xs font-medium rounded-lg border transition-all text-center',
                selectedFrame === template.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
              )}
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      {/* Label Input - Only show if frame supports labels */}
      {showLabelInput && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Type className="w-4 h-4" />
            <span className="text-sm font-medium">Label Text</span>
          </div>

          <Input
            value={currentLabel}
            onChange={(e) => setStyleOptions({ frameLabel: e.target.value })}
            placeholder="Enter label text..."
            maxLength={30}
          />

          {/* Quick Label Suggestions */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick suggestions:</p>
            <div className="flex flex-wrap gap-1.5">
              {defaultLabels.map((label) => (
                <button
                  key={label}
                  onClick={() => setStyleOptions({ frameLabel: label })}
                  className={cn(
                    'px-2 py-1 text-xs rounded-md border transition-colors',
                    currentLabel === label
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-600 dark:text-gray-400'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {currentLabel.length}/30 characters
          </p>
        </div>
      )}
    </div>
  );
}
