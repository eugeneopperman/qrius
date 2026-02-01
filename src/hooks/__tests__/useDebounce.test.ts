import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback, useThrottledCallback } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useDebounce', () => {
    it('returns the initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 300));
      expect(result.current).toBe('initial');
    });

    it('does not update value before delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      // Advance time but not past the delay
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current).toBe('initial');
    });

    it('updates value after delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe('updated');
    });

    it('resets timer when value changes rapidly', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'first' });
      act(() => {
        vi.advanceTimersByTime(200);
      });

      rerender({ value: 'second' });
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Still should be initial because timer was reset
      expect(result.current).toBe('initial');

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current).toBe('second');
    });

    it('uses default delay of 300ms', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      act(() => {
        vi.advanceTimersByTime(299);
      });
      expect(result.current).toBe('initial');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current).toBe('updated');
    });
  });

  describe('useDebouncedCallback', () => {
    it('does not call callback before delay', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 300));

      act(() => {
        result.current('test');
        vi.advanceTimersByTime(200);
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it('calls callback after delay', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 300));

      act(() => {
        result.current('test');
        vi.advanceTimersByTime(300);
      });

      expect(callback).toHaveBeenCalledWith('test');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('only calls callback once for rapid calls', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 300));

      act(() => {
        result.current('first');
        vi.advanceTimersByTime(100);
        result.current('second');
        vi.advanceTimersByTime(100);
        result.current('third');
        vi.advanceTimersByTime(300);
      });

      expect(callback).toHaveBeenCalledWith('third');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('clears timeout on unmount', () => {
      const callback = vi.fn();
      const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 300));

      act(() => {
        result.current('test');
      });

      unmount();

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('useThrottledCallback', () => {
    it('calls callback immediately on first call', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 300));

      act(() => {
        result.current('test');
      });

      expect(callback).toHaveBeenCalledWith('test');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('ignores calls within throttle period', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 300));

      act(() => {
        result.current('first');
        vi.advanceTimersByTime(100);
        result.current('second');
        vi.advanceTimersByTime(100);
        result.current('third');
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('first');
    });

    it('allows calls after throttle period', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 300));

      act(() => {
        result.current('first');
        vi.advanceTimersByTime(300);
        result.current('second');
      });

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenNthCalledWith(1, 'first');
      expect(callback).toHaveBeenNthCalledWith(2, 'second');
    });
  });
});
