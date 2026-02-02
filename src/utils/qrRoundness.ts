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

import type { QRPattern, DotType } from '../types';

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
 * For 'solid' pattern: Always use 'square' so we get rect elements to post-process
 * For 'dots' pattern: Map roundness to discrete dot types for individual dots look
 *
 * @param pattern - 'solid' or 'dots'
 * @param roundness - Roundness percentage (0-100)
 */
export function getDotTypeForPattern(pattern: QRPattern, roundness: number): DotType {
  if (pattern === 'solid') {
    // Solid pattern: use 'square' for post-processing with smooth roundness
    return 'square';
  }

  // Dots pattern: use discrete types that create individual separated dots
  // Map roundness to appropriate dot type for visual consistency
  if (roundness < 20) return 'square';
  if (roundness < 40) return 'rounded';
  if (roundness < 60) return 'extra-rounded';
  return 'dots'; // Fully circular dots
}

/**
 * Check if we should apply post-processing roundness.
 * Only applies to 'solid' pattern where we use 'square' type and post-process.
 *
 * @param pattern - 'solid' or 'dots'
 */
export function shouldApplyRoundnessPostProcessing(pattern: QRPattern): boolean {
  return pattern === 'solid';
}

/**
 * Get corner square type based on roundness.
 * Corner squares use paths, so we use the closest discrete type.
 *
 * @param roundness - Roundness percentage (0-100)
 */
export function getCornerSquareTypeForRoundness(roundness: number): 'square' | 'extra-rounded' | 'dot' {
  // More gradual transitions for corner squares
  if (roundness < 25) return 'square';
  if (roundness < 70) return 'extra-rounded';
  return 'dot';
}

/**
 * Get corner dot type based on roundness.
 *
 * @param roundness - Roundness percentage (0-100)
 */
export function getCornerDotTypeForRoundness(roundness: number): 'square' | 'dot' {
  // Simple threshold - square for sharp, dot for rounded
  if (roundness < 40) return 'square';
  return 'dot';
}
