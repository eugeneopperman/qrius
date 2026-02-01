import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClickOutside, useClickOutsideOrEscape } from '../useClickOutside';

describe('useClickOutside', () => {
  it('returns a ref object', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    expect(result.current).toHaveProperty('current');
    expect(result.current.current).toBe(null);
  });

  it('calls callback when clicking outside the element', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(callback));

    // Create and attach element
    const element = document.createElement('div');
    document.body.appendChild(element);

    // Assign to ref (simulate attaching ref)
    Object.defineProperty(result.current, 'current', {
      value: element,
      writable: true,
    });

    // Click outside the element
    act(() => {
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // Cleanup
    document.body.removeChild(element);
  });

  it('does not call callback when clicking inside the element', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(callback));

    // Create and attach element
    const element = document.createElement('div');
    document.body.appendChild(element);

    // Assign to ref
    Object.defineProperty(result.current, 'current', {
      value: element,
      writable: true,
    });

    // Click inside the element
    act(() => {
      element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(callback).not.toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(element);
  });

  it('does not call callback when disabled', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(callback, false));

    // Create and attach element
    const element = document.createElement('div');
    document.body.appendChild(element);

    Object.defineProperty(result.current, 'current', {
      value: element,
      writable: true,
    });

    // Click outside
    act(() => {
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(callback).not.toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(element);
  });

  it('removes event listener on unmount', () => {
    const callback = vi.fn();
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useClickOutside(callback));
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});

describe('useClickOutsideOrEscape', () => {
  it('calls callback when pressing Escape', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutsideOrEscape<HTMLDivElement>(callback));

    // Create and attach element
    const element = document.createElement('div');
    document.body.appendChild(element);

    Object.defineProperty(result.current, 'current', {
      value: element,
      writable: true,
    });

    // Press Escape
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // Cleanup
    document.body.removeChild(element);
  });

  it('does not call callback for other keys', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutsideOrEscape<HTMLDivElement>(callback));

    const element = document.createElement('div');
    document.body.appendChild(element);

    Object.defineProperty(result.current, 'current', {
      value: element,
      writable: true,
    });

    // Press Enter
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(element);
  });

  it('calls callback when clicking outside the element', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutsideOrEscape<HTMLDivElement>(callback));

    const element = document.createElement('div');
    document.body.appendChild(element);

    Object.defineProperty(result.current, 'current', {
      value: element,
      writable: true,
    });

    // Click outside
    act(() => {
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(callback).toHaveBeenCalledTimes(1);

    document.body.removeChild(element);
  });

  it('does not listen when disabled', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutsideOrEscape<HTMLDivElement>(callback, false));

    const element = document.createElement('div');
    document.body.appendChild(element);

    Object.defineProperty(result.current, 'current', {
      value: element,
      writable: true,
    });

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(element);
  });
});
