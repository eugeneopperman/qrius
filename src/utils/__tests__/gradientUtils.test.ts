import { describe, it, expect } from 'vitest';
import {
  getGradientPreview,
  convertGradientToQRFormat,
  createQRElementOptions,
} from '../gradientUtils';
import type { GradientOptions } from '@/types';

const linearGradient: GradientOptions = {
  type: 'linear',
  rotation: 45,
  colorStops: [
    { offset: 0, color: '#ff0000' },
    { offset: 1, color: '#0000ff' },
  ],
};

const radialGradient: GradientOptions = {
  type: 'radial',
  colorStops: [
    { offset: 0, color: '#ffffff' },
    { offset: 0.5, color: '#888888' },
    { offset: 1, color: '#000000' },
  ],
};

describe('getGradientPreview', () => {
  it('returns linear gradient CSS string', () => {
    const result = getGradientPreview(linearGradient);
    expect(result).toBe('linear-gradient(45deg, #ff0000 0%, #0000ff 100%)');
  });

  it('returns radial gradient CSS string', () => {
    const result = getGradientPreview(radialGradient);
    expect(result).toBe('radial-gradient(circle, #ffffff 0%, #888888 50%, #000000 100%)');
  });

  it('defaults rotation to 0 when not provided', () => {
    const gradient: GradientOptions = {
      type: 'linear',
      colorStops: [
        { offset: 0, color: '#000' },
        { offset: 1, color: '#fff' },
      ],
    };
    expect(getGradientPreview(gradient)).toContain('0deg');
  });
});

describe('convertGradientToQRFormat', () => {
  it('converts linear gradient to QR format', () => {
    const result = convertGradientToQRFormat(linearGradient);
    expect(result).toEqual({
      type: 'linear',
      rotation: 45,
      colorStops: [
        { offset: 0, color: '#ff0000' },
        { offset: 1, color: '#0000ff' },
      ],
    });
  });

  it('converts radial gradient with default rotation', () => {
    const result = convertGradientToQRFormat(radialGradient);
    expect(result.type).toBe('radial');
    expect(result.rotation).toBe(0);
    expect(result.colorStops).toHaveLength(3);
  });
});

describe('createQRElementOptions', () => {
  it('returns color-based options when gradient disabled', () => {
    const result = createQRElementOptions('square', false, undefined, '#333');
    expect(result).toEqual({
      type: 'square',
      color: '#333',
      gradient: undefined,
    });
  });

  it('returns gradient options when enabled', () => {
    const result = createQRElementOptions('dots', true, linearGradient, '#333');
    expect(result.type).toBe('dots');
    expect(result.gradient).toBeDefined();
    expect(result.gradient!.type).toBe('linear');
    expect(result.gradient!.rotation).toBe(45);
    expect('color' in result).toBe(false);
  });

  it('falls back to color when gradient enabled but undefined', () => {
    const result = createQRElementOptions('rounded', true, undefined, '#abc');
    expect(result).toEqual({
      type: 'rounded',
      color: '#abc',
      gradient: undefined,
    });
  });
});
