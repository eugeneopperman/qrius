import { useEffect, useRef, type RefObject } from 'react';

/**
 * Hook that detects clicks outside of the provided ref element.
 * Automatically cleans up event listeners on unmount.
 *
 * @param callback - Function to call when a click outside is detected
 * @param enabled - Optional flag to enable/disable the listener (default: true)
 * @returns RefObject to attach to the element
 *
 * @example
 * ```tsx
 * function Dropdown() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const ref = useClickOutside(() => setIsOpen(false), isOpen);
 *
 *   return (
 *     <div ref={ref}>
 *       {isOpen && <DropdownContent />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  enabled = true
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    // Use mousedown instead of click for faster response
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, enabled]);

  return ref;
}

/**
 * Hook that detects clicks outside of multiple elements.
 * Useful for components with multiple floating elements (e.g., button + dropdown).
 *
 * @param refs - Array of RefObjects to check
 * @param callback - Function to call when a click outside is detected
 * @param enabled - Optional flag to enable/disable the listener (default: true)
 *
 * @example
 * ```tsx
 * function Dropdown() {
 *   const buttonRef = useRef(null);
 *   const menuRef = useRef(null);
 *
 *   useClickOutsideMultiple(
 *     [buttonRef, menuRef],
 *     () => setIsOpen(false),
 *     isOpen
 *   );
 * }
 * ```
 */
export function useClickOutsideMultiple(
  refs: RefObject<HTMLElement | null>[],
  callback: () => void,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(target)
      );

      if (isOutside) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, callback, enabled]);
}

/**
 * Hook that detects clicks outside and Escape key presses.
 * Combines common modal/dropdown close behaviors.
 *
 * @param callback - Function to call when close is triggered
 * @param enabled - Optional flag to enable/disable the listeners (default: true)
 * @returns RefObject to attach to the element
 */
export function useClickOutsideOrEscape<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  enabled = true
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [callback, enabled]);

  return ref;
}
