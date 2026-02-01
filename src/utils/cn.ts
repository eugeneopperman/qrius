import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx and tailwind-merge.
 * Handles conditional classes, arrays, and Tailwind CSS class conflicts.
 *
 * @param inputs - Class values to merge (strings, arrays, objects, conditionals)
 * @returns Merged class string with Tailwind conflicts resolved
 *
 * @example
 * ```tsx
 * // Basic usage
 * cn('p-4', 'text-red-500')
 * // => 'p-4 text-red-500'
 *
 * // Conditional classes
 * cn('btn', isActive && 'btn-active', isDisabled && 'opacity-50')
 * // => 'btn btn-active' (if isActive is true)
 *
 * // Object notation
 * cn('btn', { 'btn-primary': isPrimary, 'btn-secondary': !isPrimary })
 *
 * // Tailwind merge (later classes win)
 * cn('p-4', 'p-2')
 * // => 'p-2' (p-2 overrides p-4)
 *
 * cn('text-red-500', 'text-blue-500')
 * // => 'text-blue-500' (blue overrides red)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
