import { describe, it, expect } from 'vitest';
import {
  getDotTypeForPattern,
  getCornerSquareTypeForRoundness,
  getCornerDotTypeForRoundness,
  applyRoundnessToQRSvg,
} from '../qrRoundness';

describe('getDotTypeForPattern', () => {
  it('returns "dots" for dots pattern regardless of roundness', () => {
    expect(getDotTypeForPattern('dots', 0)).toBe('dots');
    expect(getDotTypeForPattern('dots', 50)).toBe('dots');
    expect(getDotTypeForPattern('dots', 100)).toBe('dots');
  });

  it('returns "square" for solid pattern with low roundness', () => {
    expect(getDotTypeForPattern('solid', 0)).toBe('square');
    expect(getDotTypeForPattern('solid', 10)).toBe('square');
    expect(getDotTypeForPattern('solid', 24)).toBe('square');
  });

  it('returns "rounded" for solid pattern with medium-low roundness', () => {
    expect(getDotTypeForPattern('solid', 25)).toBe('rounded');
    expect(getDotTypeForPattern('solid', 49)).toBe('rounded');
  });

  it('returns "extra-rounded" for solid pattern with medium-high roundness', () => {
    expect(getDotTypeForPattern('solid', 50)).toBe('extra-rounded');
    expect(getDotTypeForPattern('solid', 74)).toBe('extra-rounded');
  });

  it('returns "extra-rounded" for solid pattern with high roundness', () => {
    expect(getDotTypeForPattern('solid', 75)).toBe('extra-rounded');
    expect(getDotTypeForPattern('solid', 100)).toBe('extra-rounded');
  });
});

describe('getCornerSquareTypeForRoundness', () => {
  it('returns "square" for 0 roundness', () => {
    expect(getCornerSquareTypeForRoundness(0)).toBe('square');
  });

  it('returns "extra-rounded" for low-mid roundness', () => {
    expect(getCornerSquareTypeForRoundness(1)).toBe('extra-rounded');
    expect(getCornerSquareTypeForRoundness(25)).toBe('extra-rounded');
    expect(getCornerSquareTypeForRoundness(50)).toBe('extra-rounded');
  });

  it('returns "dot" for high roundness', () => {
    expect(getCornerSquareTypeForRoundness(51)).toBe('dot');
    expect(getCornerSquareTypeForRoundness(75)).toBe('dot');
    expect(getCornerSquareTypeForRoundness(100)).toBe('dot');
  });
});

describe('getCornerDotTypeForRoundness', () => {
  it('returns "square" for roundness below 50', () => {
    expect(getCornerDotTypeForRoundness(0)).toBe('square');
    expect(getCornerDotTypeForRoundness(25)).toBe('square');
    expect(getCornerDotTypeForRoundness(49)).toBe('square');
  });

  it('returns "dot" for roundness 50 and above', () => {
    expect(getCornerDotTypeForRoundness(50)).toBe('dot');
    expect(getCornerDotTypeForRoundness(75)).toBe('dot');
    expect(getCornerDotTypeForRoundness(100)).toBe('dot');
  });
});

describe('applyRoundnessToQRSvg', () => {
  it('does nothing with null container', () => {
    expect(() => applyRoundnessToQRSvg(null, 50)).not.toThrow();
  });

  it('does nothing when container has no SVG', () => {
    const container = document.createElement('div');
    expect(() => applyRoundnessToQRSvg(container, 50)).not.toThrow();
  });

  it('applies rx/ry to module rects but skips background', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <svg width="300" height="300">
        <rect x="0" y="0" width="300" height="300" fill="white" />
        <rect x="10" y="10" width="10" height="10" fill="black" />
        <rect x="20" y="20" width="10" height="10" fill="black" />
      </svg>
    `;

    applyRoundnessToQRSvg(container, 100);

    const rects = container.querySelectorAll('rect');
    // Background rect should NOT be modified (no rx/ry)
    expect(rects[0].getAttribute('rx')).toBeNull();
    // Module rects should have rx = width/2 = 5 at 100% roundness
    expect(rects[1].getAttribute('rx')).toBe('5.00');
    expect(rects[1].getAttribute('ry')).toBe('5.00');
    expect(rects[2].getAttribute('rx')).toBe('5.00');
  });

  it('applies 0 radius for 0% roundness', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <svg width="300" height="300">
        <rect x="10" y="10" width="10" height="10" fill="black" />
      </svg>
    `;

    applyRoundnessToQRSvg(container, 0);

    const rect = container.querySelector('rect')!;
    expect(rect.getAttribute('rx')).toBe('0.00');
  });

  it('clamps roundness to 0-100 range', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <svg width="300" height="300">
        <rect x="10" y="10" width="10" height="10" fill="black" />
      </svg>
    `;

    applyRoundnessToQRSvg(container, 200);
    const rect = container.querySelector('rect')!;
    // Should be clamped to 100%, so rx = 5
    expect(rect.getAttribute('rx')).toBe('5.00');
  });
});
