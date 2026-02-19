import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

/**
 * Props for the Button component.
 * Extends standard HTML button attributes.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant of the button.
   * - `primary`: Main call-to-action, orange/indigo gradient
   * - `secondary`: Secondary action, outlined style
   * - `ghost`: Minimal, text-only appearance
   * - `danger`: Destructive action, red color
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /**
   * Size of the button.
   * - `sm`: Small, compact padding
   * - `md`: Medium, standard size
   * - `lg`: Large, more prominent
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * A reusable button component with multiple variants and sizes.
 * Supports all standard button HTML attributes and forwards refs.
 *
 * @example
 * ```tsx
 * // Primary button (default)
 * <Button onClick={handleSave}>Save</Button>
 *
 * // Secondary button with icon
 * <Button variant="secondary" size="sm">
 *   <Icon /> Cancel
 * </Button>
 *
 * // Danger button for destructive actions
 * <Button variant="danger" onClick={handleDelete}>
 *   Delete
 * </Button>
 * ```
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'btn',
          {
            'btn-primary': variant === 'primary',
            'btn-secondary': variant === 'secondary',
            'btn-ghost': variant === 'ghost',
            'btn-danger': variant === 'danger',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-5 py-2.5 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
