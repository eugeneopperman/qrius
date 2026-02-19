import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormField } from '../useFormField';
import type { ValidationResult } from '@/utils/validators';

describe('useFormField', () => {
  const requiredValidator = (value: string): ValidationResult => {
    if (!value.trim()) {
      return { isValid: false, error: 'Required' };
    }
    return { isValid: true };
  };

  it('starts as valid and untouched', () => {
    const { result } = renderHook(() => useFormField('', requiredValidator));

    expect(result.current.touched).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeUndefined();
  });

  it('shows error after touch with invalid value', () => {
    const { result } = renderHook(() => useFormField('', requiredValidator));

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.touched).toBe(true);
    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe('Required');
  });

  it('shows valid after touch with valid value', () => {
    const { result } = renderHook(() => useFormField('hello', requiredValidator));

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.touched).toBe(true);
    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeUndefined();
  });

  it('resets touched state', () => {
    const { result } = renderHook(() => useFormField('', requiredValidator));

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.touched).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.touched).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it('re-validates when value changes and is touched', () => {
    let value = '';
    const { result, rerender } = renderHook(() => useFormField(value, requiredValidator));

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.isValid).toBe(false);

    value = 'filled';
    rerender();

    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeUndefined();
  });

  it('works without a validator', () => {
    const { result } = renderHook(() => useFormField('anything'));

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeUndefined();
  });
});
