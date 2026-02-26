import { describe, it, expect } from 'vitest';
import { extractStyleOptions } from '../extractStyleOptions';

describe('extractStyleOptions', () => {
  describe('returns undefined for invalid input', () => {
    it('returns undefined for null', () => {
      expect(extractStyleOptions(null)).toBeUndefined();
    });

    it('returns undefined for undefined', () => {
      expect(extractStyleOptions(undefined)).toBeUndefined();
    });

    it('returns undefined for a string', () => {
      expect(extractStyleOptions('not an object')).toBeUndefined();
    });

    it('returns undefined for a number', () => {
      expect(extractStyleOptions(42)).toBeUndefined();
    });

    it('returns undefined for a boolean', () => {
      expect(extractStyleOptions(true)).toBeUndefined();
    });

    it('returns undefined for an array', () => {
      expect(extractStyleOptions([1, 2, 3])).toBeUndefined();
    });

    it('returns undefined for empty object (no style_options key)', () => {
      expect(extractStyleOptions({})).toBeUndefined();
    });

    it('returns undefined when style_options is null', () => {
      expect(extractStyleOptions({ style_options: null })).toBeUndefined();
    });

    it('returns undefined when style_options is a string', () => {
      expect(extractStyleOptions({ style_options: 'invalid' })).toBeUndefined();
    });

    it('returns undefined when style_options is an array', () => {
      expect(extractStyleOptions({ style_options: [1, 2] })).toBeUndefined();
    });

    it('returns undefined when style_options is a number', () => {
      expect(extractStyleOptions({ style_options: 123 })).toBeUndefined();
    });
  });

  describe('returns style options for valid input', () => {
    it('extracts basic style options', () => {
      const metadata = {
        style_options: {
          dotsColor: '#000000',
          backgroundColor: '#ffffff',
        },
      };
      const result = extractStyleOptions(metadata);
      expect(result).toEqual({
        dotsColor: '#000000',
        backgroundColor: '#ffffff',
      });
    });

    it('extracts full style options', () => {
      const styleOptions = {
        dotsColor: '#ff6600',
        backgroundColor: '#f0f0f0',
        dotsType: 'rounded',
        cornersSquareType: 'extra-rounded',
        cornersDotType: 'dot',
        errorCorrectionLevel: 'H',
        useGradient: true,
        gradient: { type: 'linear', rotation: 90, colorStops: [{ offset: 0, color: '#ff0000' }, { offset: 1, color: '#0000ff' }] },
        logoUrl: 'https://example.com/logo.png',
        logoShape: 'circle',
        logoMargin: 5,
        logoSize: 0.3,
        qrRoundness: 50,
        qrPattern: 'rounded',
      };
      const metadata = { style_options: styleOptions };
      const result = extractStyleOptions(metadata);
      expect(result).toEqual(styleOptions);
    });

    it('extracts empty style options object', () => {
      const metadata = { style_options: {} };
      const result = extractStyleOptions(metadata);
      expect(result).toEqual({});
    });

    it('ignores extra metadata keys', () => {
      const metadata = {
        style_options: { dotsColor: '#000' },
        other_data: 'ignored',
        version: 2,
      };
      const result = extractStyleOptions(metadata);
      expect(result).toEqual({ dotsColor: '#000' });
    });
  });
});
