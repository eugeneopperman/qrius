import { useId } from 'react';
import { cn } from '../../utils/cn';

/**
 * Props for the Toggle component.
 */
interface ToggleProps {
  /** Whether the toggle is checked/on */
  checked: boolean;
  /** Callback when toggle state changes */
  onChange: (checked: boolean) => void;
  /** Label text for the toggle */
  label?: string;
  /** Additional description text below the label */
  description?: string;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Size of the toggle switch */
  size?: 'sm' | 'md';
  /** Additional CSS classes */
  className?: string;
  /** Custom ID (auto-generated if not provided) */
  id?: string;
}

/**
 * Accessible toggle switch component with proper ARIA semantics.
 * Uses `role="switch"` and `aria-checked` for screen readers.
 *
 * Features:
 * - Keyboard accessible (Space/Enter to toggle)
 * - Proper focus ring styling
 * - Support for label and description
 * - Two sizes: sm and md
 *
 * @example
 * ```tsx
 * // Basic toggle
 * <Toggle
 *   checked={isEnabled}
 *   onChange={setIsEnabled}
 *   label="Enable notifications"
 * />
 *
 * // Toggle with description
 * <Toggle
 *   checked={darkMode}
 *   onChange={setDarkMode}
 *   label="Dark mode"
 *   description="Use dark theme across the app"
 * />
 * ```
 */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className,
  id: providedId,
}: ToggleProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const descriptionId = description ? `${id}-description` : undefined;

  const sizeClasses = {
    sm: {
      track: 'h-5 w-9',
      thumb: 'h-3 w-3',
      translate: checked ? 'translate-x-5' : 'translate-x-1',
    },
    md: {
      track: 'h-6 w-11',
      thumb: 'h-4 w-4',
      translate: checked ? 'translate-x-6' : 'translate-x-1',
    },
  };

  const sizes = sizeClasses[size];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={descriptionId}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2',
          sizes.track,
          checked
            ? 'bg-indigo-600 dark:bg-indigo-500'
            : 'bg-gray-300 dark:bg-gray-600',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'inline-block transform rounded-full bg-white shadow-sm transition-transform',
            sizes.thumb,
            sizes.translate
          )}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'text-sm font-medium cursor-pointer',
                disabled
                  ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p
              id={descriptionId}
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Inline toggle with label on the left and switch on the right.
 * Useful for settings panels.
 */
interface InlineToggleProps extends Omit<ToggleProps, 'description'> {
  tooltip?: React.ReactNode;
}

export function InlineToggle({
  checked,
  onChange,
  label,
  tooltip,
  disabled = false,
  size = 'md',
  className,
  id: providedId,
}: InlineToggleProps) {
  const generatedId = useId();
  const id = providedId || generatedId;

  const sizeClasses = {
    sm: {
      track: 'h-5 w-9',
      thumb: 'h-3 w-3',
      translate: checked ? 'translate-x-5' : 'translate-x-1',
    },
    md: {
      track: 'h-6 w-11',
      thumb: 'h-4 w-4',
      translate: checked ? 'translate-x-6' : 'translate-x-1',
    },
  };

  const sizes = sizeClasses[size];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-1.5">
        <label
          htmlFor={id}
          className={cn(
            'text-sm font-medium cursor-pointer',
            disabled
              ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300'
          )}
        >
          {label}
        </label>
        {tooltip}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2',
          sizes.track,
          checked
            ? 'bg-indigo-600 dark:bg-indigo-500'
            : 'bg-gray-300 dark:bg-gray-600',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'inline-block transform rounded-full bg-white shadow-sm transition-transform',
            sizes.thumb,
            sizes.translate
          )}
        />
      </button>
    </div>
  );
}
