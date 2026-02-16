import type { GradientOptions } from '../types';

/**
 * Generate a CSS gradient string for previewing a gradient configuration
 */
export function getGradientPreview(g: GradientOptions): string {
  const colors = g.colorStops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ');
  if (g.type === 'radial') {
    return `radial-gradient(circle, ${colors})`;
  }
  return `linear-gradient(${g.rotation || 0}deg, ${colors})`;
}

/**
 * Converts GradientOptions to the format expected by qr-code-styling
 */
export function convertGradientToQRFormat(gradient: GradientOptions) {
  return {
    type: gradient.type,
    rotation: gradient.rotation || 0,
    colorStops: gradient.colorStops.map((stop) => ({
      offset: stop.offset,
      color: stop.color,
    })),
  };
}

/**
 * Creates dots/corners options with or without gradient
 */
export function createQRElementOptions<T extends string>(
  type: T,
  useGradient: boolean,
  gradient: GradientOptions | undefined,
  color: string
) {
  const base = { type };
  if (useGradient && gradient) {
    return { ...base, gradient: convertGradientToQRFormat(gradient) };
  }
  return { ...base, color, gradient: undefined };
}
