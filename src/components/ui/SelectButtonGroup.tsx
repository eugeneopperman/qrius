import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface SelectButtonOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  preview?: ReactNode;
  className?: string;
}

interface SelectButtonGroupProps<T extends string> {
  options: SelectButtonOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  layout?: 'flex' | 'grid';
  gridCols?: string;
  size?: 'sm' | 'md';
  showPreview?: boolean;
}

export function SelectButtonGroup<T extends string>({
  options,
  value,
  onChange,
  label,
  layout = 'flex',
  gridCols = 'grid-cols-3',
  size = 'sm',
  showPreview = false,
}: SelectButtonGroupProps<T>) {
  const sizeClasses = size === 'sm'
    ? 'px-3 py-2 min-h-[36px] text-xs'
    : 'px-3 py-2.5 min-h-[44px] text-xs';

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          {label}
        </label>
      )}
      <div className={cn(
        layout === 'grid' ? `grid ${gridCols} gap-2` : 'flex flex-wrap gap-1.5'
      )}>
        {options.map((option) => {
          const isSelected = value === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              title={option.label}
              aria-pressed={isSelected}
              className={cn(
                'rounded-md border transition-colors touch-manipulation font-medium',
                'focus:outline-none focus:ring-2 focus:ring-orange-400',
                showPreview && option.preview
                  ? cn(
                      'flex flex-col items-center gap-1 p-2 rounded-lg',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-400 ring-2 ring-indigo-500/20'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )
                  : cn(
                      sizeClasses,
                      Icon ? 'flex items-center gap-1.5' : '',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-600 dark:text-gray-400'
                    ),
                option.className
              )}
            >
              {showPreview && option.preview ? (
                <>
                  <div className="w-8 h-8">{option.preview}</div>
                  <span className="text-[10px] font-medium truncate max-w-full">{option.label}</span>
                </>
              ) : (
                <>
                  {Icon && <Icon className="w-3.5 h-3.5" />}
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
