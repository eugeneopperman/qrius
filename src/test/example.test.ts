/**
 * Example test file to verify Vitest setup
 */

import { describe, it, expect } from 'vitest';

describe('Vitest Setup', () => {
  it('should work with basic assertions', () => {
    expect(1 + 1).toBe(2);
  });

  it('should work with object assertions', () => {
    expect({ a: 1 }).toEqual({ a: 1 });
  });

  it('should work with array assertions', () => {
    expect([1, 2, 3]).toContain(2);
  });

  it('should work with async assertions', async () => {
    const result = await Promise.resolve('hello');
    expect(result).toBe('hello');
  });
});
