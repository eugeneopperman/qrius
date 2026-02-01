import type { DotType, CornerSquareType, CornerDotType } from '../types';

/**
 * Neighbor information for connected dot styles
 */
export interface Neighbors {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

/**
 * Generate SVG path for a square dot
 */
export function squareDotPath(x: number, y: number, size: number): string {
  return `M ${x} ${y} h ${size} v ${size} h ${-size} Z`;
}

/**
 * Generate SVG path for a circular dot
 */
export function circleDotPath(x: number, y: number, size: number): string {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;
  // Circle as two arcs
  return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
}

/**
 * Generate SVG path for a rounded dot (context-aware rounding)
 */
export function roundedDotPath(
  x: number,
  y: number,
  size: number,
  neighbors: Neighbors
): string {
  const radius = size / 2;

  // Corner radii based on neighbors
  const topLeft = !neighbors.top && !neighbors.left ? radius : 0;
  const topRight = !neighbors.top && !neighbors.right ? radius : 0;
  const bottomRight = !neighbors.bottom && !neighbors.right ? radius : 0;
  const bottomLeft = !neighbors.bottom && !neighbors.left ? radius : 0;

  return roundedRectPath(x, y, size, size, topLeft, topRight, bottomRight, bottomLeft);
}

/**
 * Generate SVG path for an extra-rounded dot (larger corner radius)
 */
export function extraRoundedDotPath(
  x: number,
  y: number,
  size: number,
  neighbors: Neighbors
): string {
  const radius = size / 2;

  // All corners rounded when exposed
  const topLeft = !neighbors.top && !neighbors.left ? radius : 0;
  const topRight = !neighbors.top && !neighbors.right ? radius : 0;
  const bottomRight = !neighbors.bottom && !neighbors.right ? radius : 0;
  const bottomLeft = !neighbors.bottom && !neighbors.left ? radius : 0;

  return roundedRectPath(x, y, size, size, topLeft, topRight, bottomRight, bottomLeft);
}

/**
 * Generate SVG path for a classy dot (only one corner rounded based on position)
 */
export function classyDotPath(
  x: number,
  y: number,
  size: number,
  neighbors: Neighbors
): string {
  const radius = size / 2;

  // Classy style: bottom-right corner rounded when exposed
  let topLeft = 0;
  let topRight = 0;
  let bottomRight = 0;
  let bottomLeft = 0;

  if (!neighbors.bottom && !neighbors.right) {
    bottomRight = radius;
  }

  return roundedRectPath(x, y, size, size, topLeft, topRight, bottomRight, bottomLeft);
}

/**
 * Generate SVG path for a classy-rounded dot (all exposed corners rounded)
 */
export function classyRoundedDotPath(
  x: number,
  y: number,
  size: number,
  neighbors: Neighbors
): string {
  const radius = size / 2;

  // All corners rounded when exposed
  const topLeft = !neighbors.top && !neighbors.left ? radius : 0;
  const topRight = !neighbors.top && !neighbors.right ? radius : 0;
  const bottomRight = !neighbors.bottom && !neighbors.right ? radius : 0;
  const bottomLeft = !neighbors.bottom && !neighbors.left ? radius : 0;

  return roundedRectPath(x, y, size, size, topLeft, topRight, bottomRight, bottomLeft);
}

/**
 * Helper to generate a rounded rectangle path with custom corner radii
 */
function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  tl: number,
  tr: number,
  br: number,
  bl: number
): string {
  // Clamp radii to prevent overflow
  const maxRadius = Math.min(width, height) / 2;
  tl = Math.min(tl, maxRadius);
  tr = Math.min(tr, maxRadius);
  br = Math.min(br, maxRadius);
  bl = Math.min(bl, maxRadius);

  const path: string[] = [];

  // Start at top-left after the curve
  path.push(`M ${x + tl} ${y}`);

  // Top edge and top-right corner
  path.push(`L ${x + width - tr} ${y}`);
  if (tr > 0) {
    path.push(`A ${tr} ${tr} 0 0 1 ${x + width} ${y + tr}`);
  }

  // Right edge and bottom-right corner
  path.push(`L ${x + width} ${y + height - br}`);
  if (br > 0) {
    path.push(`A ${br} ${br} 0 0 1 ${x + width - br} ${y + height}`);
  }

  // Bottom edge and bottom-left corner
  path.push(`L ${x + bl} ${y + height}`);
  if (bl > 0) {
    path.push(`A ${bl} ${bl} 0 0 1 ${x} ${y + height - bl}`);
  }

  // Left edge and top-left corner
  path.push(`L ${x} ${y + tl}`);
  if (tl > 0) {
    path.push(`A ${tl} ${tl} 0 0 1 ${x + tl} ${y}`);
  }

  path.push('Z');

  return path.join(' ');
}

/**
 * Get the appropriate dot path generator based on dot type
 */
export function getDotPath(
  dotType: DotType,
  x: number,
  y: number,
  size: number,
  neighbors: Neighbors
): string {
  switch (dotType) {
    case 'square':
      return squareDotPath(x, y, size);
    case 'dots':
      return circleDotPath(x, y, size);
    case 'rounded':
      return roundedDotPath(x, y, size, neighbors);
    case 'extra-rounded':
      return extraRoundedDotPath(x, y, size, neighbors);
    case 'classy':
      return classyDotPath(x, y, size, neighbors);
    case 'classy-rounded':
      return classyRoundedDotPath(x, y, size, neighbors);
    default:
      return squareDotPath(x, y, size);
  }
}

// ============================================================================
// Corner Square Path Generators
// ============================================================================

/**
 * Generate paths for a corner square (the outer 7x7 positioning pattern)
 * Returns both outer and inner paths
 */
export function cornerSquarePaths(
  x: number,
  y: number,
  size: number,
  cornerType: CornerSquareType
): { outer: string; inner: string } {
  const dotSize = size / 7;

  switch (cornerType) {
    case 'dot':
      return cornerSquareCirclePaths(x, y, size, dotSize);
    case 'extra-rounded':
      // Use ~25% corner radius for rounded squares (not 50% which makes circles)
      return cornerSquareRoundedPaths(x, y, size, dotSize, dotSize * 1.5);
    case 'square':
    default:
      return cornerSquareRectPaths(x, y, size, dotSize);
  }
}

function cornerSquareRectPaths(
  x: number,
  y: number,
  size: number,
  dotSize: number
): { outer: string; inner: string } {
  // Outer: 7x7 square with 5x5 hole (leaving 1 dot border)
  const outer = `M ${x} ${y} h ${size} v ${size} h ${-size} Z ` +
    `M ${x + dotSize} ${y + dotSize} v ${size - 2 * dotSize} h ${size - 2 * dotSize} v ${-(size - 2 * dotSize)} Z`;

  // Inner: 3x3 centered square
  const innerX = x + 2 * dotSize;
  const innerY = y + 2 * dotSize;
  const innerSize = 3 * dotSize;
  const inner = `M ${innerX} ${innerY} h ${innerSize} v ${innerSize} h ${-innerSize} Z`;

  return { outer, inner };
}

function cornerSquareCirclePaths(
  x: number,
  y: number,
  size: number,
  dotSize: number
): { outer: string; inner: string } {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const outerRadius = size / 2;
  const innerHoleRadius = size / 2 - dotSize;
  const innerDotRadius = 1.5 * dotSize;

  // Outer ring (circle with circular hole)
  const outer =
    `M ${cx - outerRadius} ${cy} ` +
    `A ${outerRadius} ${outerRadius} 0 1 0 ${cx + outerRadius} ${cy} ` +
    `A ${outerRadius} ${outerRadius} 0 1 0 ${cx - outerRadius} ${cy} Z ` +
    `M ${cx - innerHoleRadius} ${cy} ` +
    `A ${innerHoleRadius} ${innerHoleRadius} 0 1 1 ${cx + innerHoleRadius} ${cy} ` +
    `A ${innerHoleRadius} ${innerHoleRadius} 0 1 1 ${cx - innerHoleRadius} ${cy} Z`;

  // Inner dot (center circle)
  const inner =
    `M ${cx - innerDotRadius} ${cy} ` +
    `A ${innerDotRadius} ${innerDotRadius} 0 1 0 ${cx + innerDotRadius} ${cy} ` +
    `A ${innerDotRadius} ${innerDotRadius} 0 1 0 ${cx - innerDotRadius} ${cy} Z`;

  return { outer, inner };
}

function cornerSquareRoundedPaths(
  x: number,
  y: number,
  size: number,
  dotSize: number,
  cornerRadius: number
): { outer: string; inner: string } {
  const innerCornerRadius = cornerRadius - dotSize;

  // Outer rounded square with rounded hole
  const outer =
    roundedRectPath(x, y, size, size, cornerRadius, cornerRadius, cornerRadius, cornerRadius) + ' ' +
    roundedRectPathReversed(
      x + dotSize,
      y + dotSize,
      size - 2 * dotSize,
      size - 2 * dotSize,
      innerCornerRadius,
      innerCornerRadius,
      innerCornerRadius,
      innerCornerRadius
    );

  // Inner: rounded square centered
  const innerX = x + 2 * dotSize;
  const innerY = y + 2 * dotSize;
  const innerSize = 3 * dotSize;
  const innerRadius = innerSize / 2;
  const inner = roundedRectPath(innerX, innerY, innerSize, innerSize, innerRadius, innerRadius, innerRadius, innerRadius);

  return { outer, inner };
}

/**
 * Helper to generate a rounded rectangle path in reverse direction (for cutouts)
 */
function roundedRectPathReversed(
  x: number,
  y: number,
  width: number,
  height: number,
  tl: number,
  tr: number,
  br: number,
  bl: number
): string {
  // Clamp radii to prevent overflow
  const maxRadius = Math.min(width, height) / 2;
  tl = Math.min(tl, maxRadius);
  tr = Math.min(tr, maxRadius);
  br = Math.min(br, maxRadius);
  bl = Math.min(bl, maxRadius);

  const path: string[] = [];

  // Start at top-left after the curve (going counter-clockwise)
  path.push(`M ${x + tl} ${y}`);

  // Top-left corner and left edge
  if (tl > 0) {
    path.push(`A ${tl} ${tl} 0 0 0 ${x} ${y + tl}`);
  }
  path.push(`L ${x} ${y + height - bl}`);

  // Bottom-left corner and bottom edge
  if (bl > 0) {
    path.push(`A ${bl} ${bl} 0 0 0 ${x + bl} ${y + height}`);
  }
  path.push(`L ${x + width - br} ${y + height}`);

  // Bottom-right corner and right edge
  if (br > 0) {
    path.push(`A ${br} ${br} 0 0 0 ${x + width} ${y + height - br}`);
  }
  path.push(`L ${x + width} ${y + tr}`);

  // Top-right corner and top edge
  if (tr > 0) {
    path.push(`A ${tr} ${tr} 0 0 0 ${x + width - tr} ${y}`);
  }
  path.push(`L ${x + tl} ${y}`);

  path.push('Z');

  return path.join(' ');
}

// ============================================================================
// Corner Dot Path Generators
// ============================================================================

/**
 * Generate path for corner dot (the inner dot of positioning pattern)
 */
export function cornerDotPath(
  x: number,
  y: number,
  size: number,
  cornerDotType: CornerDotType
): string {
  switch (cornerDotType) {
    case 'dot':
      return circleDotPath(x, y, size);
    case 'extra-rounded': {
      const radius = size / 2;
      return roundedRectPath(x, y, size, size, radius, radius, radius, radius);
    }
    case 'square':
    default:
      return squareDotPath(x, y, size);
  }
}
