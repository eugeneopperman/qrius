import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook that returns a debounced version of the value.
 * The debounced value only updates after the specified delay.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebounce(query, 300);
 *
 *   useEffect(() => {
 *     // This effect only runs when debouncedQuery changes
 *     fetchResults(debouncedQuery);
 *   }, [debouncedQuery]);
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that returns a debounced callback function.
 * The callback is only invoked after the specified delay has passed
 * without the function being called again.
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns A debounced version of the callback
 *
 * @example
 * ```tsx
 * function AutoSave() {
 *   const debouncedSave = useDebouncedCallback((data) => {
 *     saveToServer(data);
 *   }, 500);
 *
 *   return <input onChange={(e) => debouncedSave(e.target.value)} />;
 * }
 * ```
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/**
 * Hook that returns a throttled callback function.
 * The callback is invoked at most once per specified time period.
 *
 * @param callback - The function to throttle
 * @param limit - Minimum time between calls in milliseconds (default: 300ms)
 * @returns A throttled version of the callback
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit = 300
): (...args: Parameters<T>) => void {
  const lastCallRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= limit) {
        lastCallRef.current = now;
        callbackRef.current(...args);
      }
    },
    [limit]
  );
}
