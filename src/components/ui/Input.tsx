import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

/**
 * Props for the Input component.
 * Extends standard HTML input attributes with additional features.
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input. Sets aria-invalid when present. */
  error?: string;
  /** Hint text displayed below the input (hidden when error is shown) */
  hint?: string;
}

/**
 * A form input component with built-in label, error, and hint support.
 * Automatically handles accessibility attributes (aria-invalid, aria-describedby).
 *
 * @example
 * ```tsx
 * // Basic input with label
 * <Input label="Email" type="email" placeholder="you@example.com" />
 *
 * // Input with error state
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Password must be at least 8 characters"
 * />
 *
 * // Input with hint
 * <Input
 *   label="Username"
 *   hint="Letters and numbers only"
 *   required
 * />
 * ```
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    // Build aria-describedby based on what's present
    const describedBy = [
      error ? errorId : null,
      hint && !error ? hintId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cn(
            'input min-h-[44px]',
            error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
