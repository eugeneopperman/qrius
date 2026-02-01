import type { GradientOptions } from '../types';

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
