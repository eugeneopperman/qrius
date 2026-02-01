import { describe, it, expect } from 'vitest';
import { analyzeScannability } from '../scannabilityAnalyzer';

describe('scannabilityAnalyzer', () => {
  describe('analyzeScannability', () => {
    describe('contrast analysis', () => {
      it('returns excellent score for high contrast (black on white)', () => {
        const result = analyzeScannability({
          dotsColor: '#000000',
          backgroundColor: '#ffffff',
        });

        expect(result.score).toBe('excellent');
        expect(result.percentage).toBeGreaterThanOrEqual(85);
        expect(result.issues.filter((i) => i.type === 'contrast').length).toBe(0);
      });

      it('identifies very low contrast as high severity', () => {
        // Use colors with nearly identical luminance for very low contrast
        const result = analyzeScannability({
          dotsColor: '#777777',
          backgroundColor: '#888888',
        });

        // Very low contrast should trigger a high severity issue
        expect(result.issues.some((i) => i.type === 'contrast' && i.severity === 'high')).toBe(true);
        expect(result.suggestions).toContain('Increase contrast by using darker QR code or lighter background');
      });

      it('identifies medium contrast as medium severity', () => {
        // Use light gray on white for medium contrast
        const result = analyzeScannability({
          dotsColor: '#aaaaaa',
          backgroundColor: '#ffffff',
        });

        // This should have a warning about contrast (medium severity)
        const contrastIssues = result.issues.filter((i) => i.type === 'contrast');
        expect(contrastIssues.length).toBeGreaterThan(0);
      });

      it('identifies inverted colors (light on dark)', () => {
        const result = analyzeScannability({
          dotsColor: '#ffffff',
          backgroundColor: '#000000',
        });

        expect(result.issues.some((i) => i.message.includes('inverted'))).toBe(true);
        expect(result.suggestions.some((s) => s.includes('dark QR codes on light backgrounds'))).toBe(true);
      });
    });

    describe('color blindness analysis', () => {
      it('identifies red-green color combinations', () => {
        const result = analyzeScannability({
          dotsColor: '#ff0000',
          backgroundColor: '#00ff00',
        });

        expect(result.issues.some((i) => i.type === 'color')).toBe(true);
        expect(result.suggestions).toContain('Avoid red-green color combinations');
      });

      it('does not flag non-problematic color combinations', () => {
        const result = analyzeScannability({
          dotsColor: '#000000',
          backgroundColor: '#ffff00',
        });

        expect(result.issues.filter((i) => i.type === 'color').length).toBe(0);
      });
    });

    describe('logo analysis', () => {
      it('warns about large logos', () => {
        const result = analyzeScannability({
          dotsColor: '#000000',
          backgroundColor: '#ffffff',
          hasLogo: true,
          logoSize: 0.3,
        });

        expect(result.issues.some((i) => i.type === 'logo')).toBe(true);
        expect(result.suggestions.some((s) => s.includes('logo size') || s.includes('error correction'))).toBe(true);
      });

      it('warns about large logos without high error correction', () => {
        const result = analyzeScannability({
          dotsColor: '#000000',
          backgroundColor: '#ffffff',
          hasLogo: true,
          logoSize: 0.3,
          errorCorrectionLevel: 'L',
        });

        expect(result.issues.some((i) => i.type === 'logo' && i.severity === 'high')).toBe(true);
        expect(result.suggestions).toContain('Set error correction to High (30%) when using large logos');
      });

      it('does not warn about small logos', () => {
        const result = analyzeScannability({
          dotsColor: '#000000',
          backgroundColor: '#ffffff',
          hasLogo: true,
          logoSize: 0.15,
        });

        expect(result.issues.filter((i) => i.type === 'logo').length).toBe(0);
      });

      it('does not create logo issues when no logo is present', () => {
        const result = analyzeScannability({
          dotsColor: '#000000',
          backgroundColor: '#ffffff',
          hasLogo: false,
        });

        expect(result.issues.filter((i) => i.type === 'logo').length).toBe(0);
      });
    });

    describe('complexity analysis', () => {
      it('warns about long data', () => {
        const result = analyzeScannability({
          dotsColor: '#000000',
          backgroundColor: '#ffffff',
          dataLength: 250,
        });

        expect(result.issues.some((i) => i.type === 'complexity')).toBe(true);
        expect(result.suggestions.some((s) => s.includes('shortening the URL'))).toBe(true);
      });

      it('does not warn about short data', () => {
        const result = analyzeScannability({
          dotsColor: '#000000',
          backgroundColor: '#ffffff',
          dataLength: 50,
        });

        expect(result.issues.filter((i) => i.type === 'complexity').length).toBe(0);
      });
    });

    describe('score calculation', () => {
      it('returns percentage between 0 and 100', () => {
        const result = analyzeScannability({
          dotsColor: '#000000',
          backgroundColor: '#ffffff',
        });

        expect(result.percentage).toBeGreaterThanOrEqual(0);
        expect(result.percentage).toBeLessThanOrEqual(100);
      });

      it('returns excellent for score >= 85', () => {
        const result = analyzeScannability({
          dotsColor: '#000000',
          backgroundColor: '#ffffff',
        });

        expect(result.score).toBe('excellent');
        expect(result.percentage).toBeGreaterThanOrEqual(85);
      });

      it('returns good for score 70-84', () => {
        // Light on dark (inverted) + medium logo to get into 70-84 range
        const result = analyzeScannability({
          dotsColor: '#ffffff',
          backgroundColor: '#000000',
          hasLogo: true,
          logoSize: 0.22,
          errorCorrectionLevel: 'L',
        });

        expect(result.score).toBe('good');
        expect(result.percentage).toBeGreaterThanOrEqual(70);
        expect(result.percentage).toBeLessThan(85);
      });

      it('returns poor for score < 50', () => {
        // Very low contrast + red-green
        const result = analyzeScannability({
          dotsColor: '#ff5555',
          backgroundColor: '#55ff55',
          hasLogo: true,
          logoSize: 0.35,
          errorCorrectionLevel: 'L',
        });

        expect(result.score).toBe('poor');
        expect(result.percentage).toBeLessThan(50);
      });
    });

    describe('cumulative issues', () => {
      it('accumulates deductions from multiple issues', () => {
        const perfectResult = analyzeScannability({
          dotsColor: '#000000',
          backgroundColor: '#ffffff',
        });

        const problematicResult = analyzeScannability({
          dotsColor: '#ff0000',
          backgroundColor: '#00ff00',
          hasLogo: true,
          logoSize: 0.3,
          errorCorrectionLevel: 'L',
          dataLength: 300,
        });

        expect(problematicResult.percentage).toBeLessThan(perfectResult.percentage);
        expect(problematicResult.issues.length).toBeGreaterThan(0);
      });
    });
  });
});
