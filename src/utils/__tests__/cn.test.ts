import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn (className utility)', () => {
  it('combines multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', (true as boolean) && 'included', (false as boolean) && 'excluded')).toBe('base included');
  });

  it('handles undefined and null values', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });

  it('handles empty strings', () => {
    expect(cn('base', '', 'end')).toBe('base end');
  });

  it('handles arrays of class names', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('handles object notation', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('merges Tailwind classes correctly', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-white', 'bg-black')).toBe('bg-black');
  });

  it('preserves non-conflicting classes', () => {
    expect(cn('p-4', 'm-2', 'text-center')).toBe('p-4 m-2 text-center');
  });

  it('handles complex Tailwind merges', () => {
    expect(cn('px-4 py-2', 'p-8')).toBe('p-8');
    expect(cn('hover:bg-red-500', 'hover:bg-blue-500')).toBe('hover:bg-blue-500');
  });

  it('handles mixed inputs', () => {
    expect(
      cn('base', ['arr1', 'arr2'], { cond: true }, undefined, 'end')
    ).toBe('base arr1 arr2 cond end');
  });
});
