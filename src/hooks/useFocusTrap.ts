import { useEffect, useCallback } from 'react';

/**
 * Custom hook for trapping focus within a dialog/modal.
 * Handles Tab key cycling and restores focus when closed.
 */
export function useFocusTrap(
  isOpen: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  options?: {
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    onEscape?: () => void;
  }
) {
  const { initialFocusRef, onEscape } = options ?? {};

  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onEscape) {
        onEscape();
      }
    },
    [isOpen, onEscape]
  );

  useEffect(() => {
    if (onEscape) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [handleEscape, onEscape]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Store previously focused element to restore later
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Set initial focus
    requestAnimationFrame(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelector);
        focusableElements[0]?.focus();
      }
    });

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = originalOverflow;
      // Restore focus when dialog closes
      previouslyFocused?.focus();
    };
  }, [isOpen, containerRef, initialFocusRef]);
}
