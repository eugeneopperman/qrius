import { memo } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';

interface StepBasicInfoProps {
  name: string;
  onNameChange: (name: string) => void;
}

const SUGGESTED_NAMES = [
  'Corporate Brand',
  'Marketing Campaign',
  'Product Launch',
  'Event Promo',
  'Social Media',
  'Print Materials',
];

export const StepBasicInfo = memo(function StepBasicInfo({
  name,
  onNameChange,
}: StepBasicInfoProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Template Name
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Give your template a memorable name that describes its purpose or brand.
          </p>
        </div>
      </div>

      {/* Name Input */}
      <div className="space-y-2">
        <Input
          label="Template Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Company Brand, Marketing 2024"
          required
          autoFocus
          maxLength={50}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {name.length}/50 characters
        </p>
      </div>

      {/* Quick Suggestions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Quick suggestions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_NAMES.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onNameChange(suggestion)}
              className={cn(
                'px-3 py-2 text-sm rounded-lg border transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                name === suggestion
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
          Pro Tips
        </h4>
        <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
          <li>• Use descriptive names to easily find templates later</li>
          <li>• Include project or campaign name for organization</li>
          <li>• Templates can be duplicated and renamed anytime</li>
        </ul>
      </div>
    </div>
  );
});

StepBasicInfo.displayName = 'StepBasicInfo';
