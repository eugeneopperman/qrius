/**
 * Utility for applying smooth continuous roundness to QR code SVGs.
 *
 * The qr-code-styling library only supports discrete dot types (square, rounded, etc.),
 * so we post-process the SVG to apply custom border-radius values for smooth transitions.
 */

/**
 * Apply smooth roundness to all rect elements in a QR code SVG.
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

  // Find all rect elements (QR modules, corner squares)
  const rects = svg.querySelectorAll('rect');

  rects.forEach((rect) => {
    const width = parseFloat(rect.getAttribute('width') || '0');
    const height = parseFloat(rect.getAttribute('height') || '0');

    // Skip if dimensions are invalid
    if (width <= 0 || height <= 0) return;

    // Use the smaller dimension to calculate radius
    const minDim = Math.min(width, height);

    // Calculate radius: 0% = 0, 100% = minDim/2 (perfect circle/pill shape)
    const radius = (clampedRoundness / 100) * (minDim / 2);

    // Apply rounded corners
    rect.setAttribute('rx', radius.toFixed(2));
    rect.setAttribute('ry', radius.toFixed(2));
  });

  // Handle circle elements - at lower roundness, we might want to convert to rects
  // but for simplicity, we leave circles as-is (they're already at 100% roundness)

  // Handle path elements for corner patterns
  // The corner squares and dots may use paths - we can't easily modify those
  // but the main modules (rects) will have smooth roundness
}

/**
 * Get the base dot type to use for a given roundness level.
 * We always use 'square' to get rect elements that we can then post-process.
 *
 * For corner elements, we still need discrete types since they use paths.
 */
export function getBaseDotType(): 'square' {
  return 'square';
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
