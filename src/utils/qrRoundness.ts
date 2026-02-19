/**
 * Utility for applying smooth continuous roundness to QR code SVGs.
 *
 * Supports two patterns:
 * - 'solid': Connected modules where roundness applies to outer edges
 * - 'dots': Separate individual modules where roundness makes them more circular
 *
 * The qr-code-styling library only supports discrete dot types (square, rounded, etc.),
 * so we post-process the SVG to apply custom border-radius values for smooth transitions.
 */

import type { QRPattern, DotType } from '@/types';

/**
 * Apply smooth roundness to QR code module rect elements in an SVG.
 * Skips the background rect (the large rect covering the entire QR code).
 *
 * @param container - The container element holding the QR code SVG
 * @param roundness - Roundness percentage (0-100)
 *   - 0% = sharp corners (rx = 0)
 *   - 100% = fully circular (rx = width/2)
 */
export function applyRoundnessToQRSvg(container: HTMLElement | null, roundness: number): void {
  if (!container) return;

  const svg = container.querySelector('svg');
  if (!svg) return;

  // Clamp roundness to 0-100
  const clampedRoundness = Math.max(0, Math.min(100, roundness));

  // Get SVG dimensions to identify background rect
  const svgWidth = parseFloat(svg.getAttribute('width') || '0');
  const svgHeight = parseFloat(svg.getAttribute('height') || '0');

  // Find all rect elements (QR modules, corner squares, and background)
  const rects = svg.querySelectorAll('rect');

  rects.forEach((rect) => {
    const width = parseFloat(rect.getAttribute('width') || '0');
    const height = parseFloat(rect.getAttribute('height') || '0');
    const x = parseFloat(rect.getAttribute('x') || '0');
    const y = parseFloat(rect.getAttribute('y') || '0');

    // Skip if dimensions are invalid
    if (width <= 0 || height <= 0) return;

    // Skip background rect: it's at position (0,0) and covers the full SVG
    // or is very close to full size (within 1% tolerance)
    const isBackgroundRect =
      x === 0 &&
      y === 0 &&
      width >= svgWidth * 0.99 &&
      height >= svgHeight * 0.99;

    if (isBackgroundRect) return;

    // Use the smaller dimension to calculate radius
    const minDim = Math.min(width, height);

    // Calculate radius: 0% = 0, 100% = minDim/2 (perfect circle/pill shape)
    const radius = (clampedRoundness / 100) * (minDim / 2);

    // Apply rounded corners
    rect.setAttribute('rx', radius.toFixed(2));
    rect.setAttribute('ry', radius.toFixed(2));
  });
}

/**
 * Get the dot type to use based on pattern and roundness.
 *
 * For 'solid' pattern: Modules appear connected, use square → rounded → extra-rounded
 * For 'dots' pattern: Modules are clearly separated circles
 *
 * @param pattern - 'solid' or 'dots'
 * @param roundness - Roundness percentage (0-100)
 */
export function getDotTypeForPattern(pattern: QRPattern, roundness: number): DotType {
  if (pattern === 'dots') {
    // Dots pattern: always use circular dots for clear separation
    return 'dots';
  }

  // Solid pattern: modules stay connected, roundness adds slight corner rounding
  // Using library's built-in types for proper rendering
  if (roundness < 25) return 'square';
  if (roundness < 50) return 'rounded';
  if (roundness < 75) return 'extra-rounded';
  return 'extra-rounded'; // Max rounding while staying "solid"
}

/**
 * Check if we should apply post-processing roundness.
 * We no longer use post-processing - the library's built-in types handle it.
 *
 * @param pattern - 'solid' or 'dots'
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function shouldApplyRoundnessPostProcessing(_pattern: QRPattern): boolean {
  // Disabled - using library's built-in dot types instead
  return false;
}

/**
 * Get corner square type based on roundness.
 * Aligned with the 4 slider steps: Sharp (0%), Slight (25%), Rounded (50%), More (75%+)
 *
 * Library only provides 3 corner square types: 'square', 'extra-rounded', 'dot'
 *
 * @param roundness - Roundness percentage (0-100)
 */
export function getCornerSquareTypeForRoundness(roundness: number): 'square' | 'extra-rounded' | 'dot' {
  // 0%: Sharp square corners
  if (roundness === 0) return 'square';
  // 25-50%: Slightly rounded corners
  if (roundness <= 50) return 'extra-rounded';
  // 75%+: Circular corners
  return 'dot';
}

/**
 * Get corner dot type based on roundness.
 * The inner dot of the corner pattern.
 *
 * @param roundness - Roundness percentage (0-100)
 */
export function getCornerDotTypeForRoundness(roundness: number): 'square' | 'dot' {
  // 0-49%: Square inner dot
  if (roundness < 50) return 'square';
  // 50%+: Circular inner dot
  return 'dot';
}
