import type {
  QRStyleOptions,
  DotType,
  GradientOptions,
  FrameFontSize,
  FrameFontFamily,
  FrameIcon,
} from '@/types';
import {
  getDotPath,
  cornerSquarePaths,
  cornerDotPath,
  type Neighbors,
} from './qrPathGenerators';

/**
 * Interface for the QR matrix from qr-code-styling
 */
interface QRMatrix {
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
}

/**
 * Options for SVG export
 */
export interface SVGExportOptions {
  qrMatrix: QRMatrix;
  size: number;
  margin: number;
  styleOptions: QRStyleOptions;
  processedLogoUrl?: string; // Logo with shape mask already applied
}

/**
 * Frame icon SVG paths (simplified versions of lucide icons)
 */
const frameIconPaths: Record<FrameIcon, string> = {
  'none': '',
  'qr-code': 'M3 3h6v6H3zm2 2v2h2V5zm7-2h6v6h-6zm2 2v2h2V5zM3 12h6v6H3zm2 2v2h2v-2zm13-2h1v3h-3v-1h2zm-3 3h1v3h-1zm2 0h3v1h-3zm0 2h3v1h-2v1h-1z',
  'smartphone': 'M12 18h.01M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2z',
  'camera': 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z',
  'arrow-right': 'M5 12h14m-7-7l7 7-7 7',
  'download': 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3',
  'external-link': 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3',
  'scan': 'M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2m-10 0H5a2 2 0 01-2-2v-2',
  'finger-print': 'M2 12C2 6.5 6.5 2 12 2a10 10 0 018 4m-4 8a4 4 0 00-8 0m-1.3-2a6 6 0 0111.6 0M12 12v4',
};

/**
 * Font size to pixel mapping
 */
const fontSizeMap: Record<FrameFontSize, number> = {
  'sm': 12,
  'base': 14,
  'lg': 16,
  'xl': 18,
};

/**
 * Font family mapping
 */
const fontFamilyMap: Record<FrameFontFamily, string> = {
  'sans': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  'serif': 'Georgia, "Times New Roman", serif',
  'mono': '"SF Mono", Monaco, "Cascadia Code", monospace',
  'rounded': '"SF Pro Rounded", system-ui, sans-serif',
};

/**
 * Generate a clean, Illustrator-ready SVG from QR code data
 */
export async function generateIllustratorSVG(options: SVGExportOptions): Promise<string> {
  const { qrMatrix, size, margin, styleOptions, processedLogoUrl } = options;

  const moduleCount = qrMatrix.getModuleCount();
  const dotSize = (size - 2 * margin) / moduleCount;
  const totalSize = size;

  // Calculate frame extra space if needed
  const frameStyle = styleOptions.frameStyle || 'none';
  const frameLabel = styleOptions.frameLabel || '';
  const hasFrame = frameStyle !== 'none';
  const hasLabel = hasFrame && frameLabel.trim().length > 0;

  // Frame adds extra space
  const framePadding = hasFrame ? 16 : 0;
  const labelHeight = hasLabel ? 32 : 0;
  const topLabelSpace = (frameStyle === 'top-label' || frameStyle === 'badge') && hasLabel ? labelHeight : 0;
  const bottomLabelSpace = frameStyle === 'bottom-label' && hasLabel ? labelHeight : 0;

  const svgWidth = totalSize + (hasFrame ? framePadding * 2 : 0);
  const svgHeight = totalSize + (hasFrame ? framePadding * 2 : 0) + topLabelSpace + bottomLabelSpace;

  // Offset for QR code within the SVG
  const qrOffsetX = hasFrame ? framePadding : 0;
  const qrOffsetY = (hasFrame ? framePadding : 0) + topLabelSpace;

  // Build SVG
  const parts: string[] = [];

  // XML declaration and SVG opening
  parts.push('<?xml version="1.0" encoding="UTF-8"?>');
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">`);

  // Defs section for gradients
  parts.push('  <defs>');
  if (styleOptions.useGradient && styleOptions.gradient) {
    parts.push(generateGradientDef(styleOptions.gradient, 'qr-gradient'));
  }
  parts.push('  </defs>');

  // Background layer
  parts.push('  <g id="background">');
  if (hasFrame) {
    const frameRadius = frameStyle === 'rounded' ? 40 : frameStyle === 'simple' ? 0 : 16;
    parts.push(`    <rect fill="${styleOptions.backgroundColor}" width="${svgWidth}" height="${svgHeight}" rx="${frameRadius}"/>`);
  } else {
    parts.push(`    <rect fill="${styleOptions.backgroundColor}" width="${totalSize}" height="${totalSize}"/>`);
  }
  parts.push('  </g>');

  // Frame layer (if applicable)
  if (hasFrame) {
    parts.push('  <g id="frame">');
    const frameColor = styleOptions.frameColor || '#1f2937';
    const frameRadius = frameStyle === 'rounded' ? 40 : frameStyle === 'simple' ? 0 : 16;
    parts.push(`    <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" rx="${frameRadius}" fill="none" stroke="${frameColor}" stroke-width="4"/>`);

    // Top label (for top-label style)
    if (frameStyle === 'top-label' && hasLabel) {
      const fontSize = fontSizeMap[styleOptions.frameFontSize || 'base'];
      const fontFamily = fontFamilyMap[styleOptions.frameFontFamily || 'sans'];
      const labelWidth = frameLabel.length * fontSize * 0.6 + 24; // Approximate width
      const labelX = svgWidth / 2;
      const labelY = framePadding / 2;

      parts.push(`    <rect x="${labelX - labelWidth / 2}" y="${labelY - 12}" width="${labelWidth}" height="24" rx="12" fill="${frameColor}"/>`);
      parts.push(`    <text x="${labelX}" y="${labelY + 5}" text-anchor="middle" fill="white" font-family="${fontFamily}" font-size="${fontSize}" font-weight="600">${escapeXml(frameLabel)}</text>`);
    }

    // Badge style label
    if (frameStyle === 'badge' && hasLabel) {
      const fontSize = fontSizeMap[styleOptions.frameFontSize || 'base'];
      const fontFamily = fontFamilyMap[styleOptions.frameFontFamily || 'sans'];
      const labelX = svgWidth / 2;
      const labelY = framePadding + fontSize;

      parts.push(`    <text x="${labelX}" y="${labelY}" text-anchor="middle" fill="${frameColor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="700" letter-spacing="0.1em" text-transform="uppercase">${escapeXml(frameLabel.toUpperCase())}</text>`);
    }

    // Bottom label
    if (frameStyle === 'bottom-label' && hasLabel) {
      const fontSize = fontSizeMap[styleOptions.frameFontSize || 'base'];
      const fontFamily = fontFamilyMap[styleOptions.frameFontFamily || 'sans'];
      const labelX = svgWidth / 2;
      const labelY = svgHeight - framePadding + fontSize / 2;

      // Add icon if specified
      const iconSize = fontSize;
      const iconPath = styleOptions.frameIcon && styleOptions.frameIcon !== 'none' ? frameIconPaths[styleOptions.frameIcon] : '';
      const iconPosition = styleOptions.frameIconPosition || 'none';

      if (iconPath && iconPosition !== 'none') {
        const iconOffset = iconPosition === 'left' ? -(frameLabel.length * fontSize * 0.3 + iconSize) : (frameLabel.length * fontSize * 0.3 + 4);
        parts.push(`    <g transform="translate(${labelX + iconOffset - iconSize / 2}, ${labelY - iconSize / 2})">`);
        parts.push(`      <path d="${iconPath}" fill="none" stroke="${frameColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" transform="scale(${iconSize / 24})"/>`);
        parts.push('    </g>');
      }

      parts.push(`    <text x="${labelX}" y="${labelY}" text-anchor="middle" fill="${frameColor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="600">${escapeXml(frameLabel)}</text>`);
    }

    parts.push('  </g>');
  }

  // QR Code layer
  parts.push('  <g id="qr-code">');

  // Determine fill color/gradient
  const fillAttr = styleOptions.useGradient && styleOptions.gradient
    ? 'url(#qr-gradient)'
    : styleOptions.dotsColor;

  // Calculate logo exclusion area (if logo exists)
  let logoExclusionArea: { x: number; y: number; size: number } | null = null;
  const logoUrl = processedLogoUrl || styleOptions.logoUrl;
  if (logoUrl) {
    const logoSize = (styleOptions.logoSize || 0.3) * size * 0.8;
    const logoMargin = styleOptions.logoMargin ?? 5;
    const exclusionSize = logoSize + logoMargin * 2;
    logoExclusionArea = {
      x: qrOffsetX + (size - exclusionSize) / 2,
      y: qrOffsetY + (size - exclusionSize) / 2,
      size: exclusionSize,
    };
  }

  // Generate data module paths (excluding position patterns and logo area)
  const dataPaths = generateDataModulePaths(
    qrMatrix,
    dotSize,
    margin,
    qrOffsetX,
    qrOffsetY,
    styleOptions.dotsType,
    logoExclusionArea
  );

  parts.push(`    <path id="qr-dots" fill="${fillAttr}" fill-rule="nonzero" d="${dataPaths}"/>`);

  // Generate corner squares (position patterns)
  const cornerPositions = [
    { x: 0, y: 0, id: 'top-left' },
    { x: moduleCount - 7, y: 0, id: 'top-right' },
    { x: 0, y: moduleCount - 7, id: 'bottom-left' },
  ];

  for (const corner of cornerPositions) {
    const cornerX = margin + corner.x * dotSize + qrOffsetX;
    const cornerY = margin + corner.y * dotSize + qrOffsetY;
    const cornerSize = 7 * dotSize;

    const paths = cornerSquarePaths(cornerX, cornerY, cornerSize, styleOptions.cornersSquareType);

    parts.push(`    <g id="corner-${corner.id}">`);
    parts.push(`      <path id="corner-${corner.id}-outer" fill="${fillAttr}" fill-rule="evenodd" d="${paths.outer}"/>`);

    // Inner dot
    const innerX = cornerX + 2 * dotSize;
    const innerY = cornerY + 2 * dotSize;
    const innerSize = 3 * dotSize;
    const innerPath = cornerDotPath(innerX, innerY, innerSize, styleOptions.cornersDotType);
    parts.push(`      <path id="corner-${corner.id}-inner" fill="${fillAttr}" d="${innerPath}"/>`);

    parts.push('    </g>');
  }

  parts.push('  </g>');

  // Logo layer (if applicable)
  // logoUrl was already calculated above for the exclusion area
  if (logoUrl) {
    const logoSize = (styleOptions.logoSize || 0.3) * size * 0.8;
    const logoX = qrOffsetX + (size - logoSize) / 2;
    const logoY = qrOffsetY + (size - logoSize) / 2;
    const logoShape = styleOptions.logoShape || 'square';

    // Generate clip path for logo shape if not square
    let clipPathAttr = '';
    if (logoShape !== 'square') {
      const clipPathId = 'logo-clip';
      let clipPathContent = '';

      if (logoShape === 'circle') {
        const cx = logoX + logoSize / 2;
        const cy = logoY + logoSize / 2;
        const r = logoSize / 2;
        clipPathContent = `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
      } else if (logoShape === 'rounded') {
        const rx = logoSize * 0.15; // 15% corner radius
        clipPathContent = `<rect x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" rx="${rx}"/>`;
      }

      // Insert clip path into defs (find the closing </defs> and insert before it)
      const defsEndIndex = parts.findIndex(p => p.includes('</defs>'));
      if (defsEndIndex !== -1) {
        parts.splice(defsEndIndex, 0, `    <clipPath id="${clipPathId}">${clipPathContent}</clipPath>`);
      }

      clipPathAttr = ` clip-path="url(#${clipPathId})"`;
    }

    // Check if we have SVG content to preserve as vector
    if (styleOptions.logoSvgContent) {
      const embeddedSvg = embedSvgLogo(styleOptions.logoSvgContent, logoX, logoY, logoSize);
      if (embeddedSvg) {
        parts.push(`  <g id="logo"${clipPathAttr}>`);
        parts.push(embeddedSvg);
        parts.push('  </g>');
      }
    } else {
      // Fall back to raster image embedding
      const logoDataUrl = await convertToDataUrl(logoUrl);

      if (logoDataUrl && logoDataUrl.startsWith('data:image/')) {
        parts.push(`  <g id="logo"${clipPathAttr}>`);
        parts.push(`    <image xlink:href="${logoDataUrl}" href="${logoDataUrl}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid slice"/>`);
        parts.push('  </g>');
      }
    }
  }

  // Close SVG
  parts.push('</svg>');

  return parts.join('\n');
}

/**
 * Generate gradient definition
 */
function generateGradientDef(gradient: GradientOptions, id: string): string {
  if (gradient.type === 'radial') {
    const stops = gradient.colorStops
      .map(stop => `      <stop offset="${stop.offset * 100}%" stop-color="${stop.color}"/>`)
      .join('\n');
    return `    <radialGradient id="${id}" cx="50%" cy="50%" r="50%">\n${stops}\n    </radialGradient>`;
  } else {
    const rotation = gradient.rotation || 0;
    // Convert rotation to x1,y1,x2,y2
    const rad = (rotation * Math.PI) / 180;
    const x1 = 50 - Math.cos(rad) * 50;
    const y1 = 50 - Math.sin(rad) * 50;
    const x2 = 50 + Math.cos(rad) * 50;
    const y2 = 50 + Math.sin(rad) * 50;

    const stops = gradient.colorStops
      .map(stop => `      <stop offset="${stop.offset * 100}%" stop-color="${stop.color}"/>`)
      .join('\n');
    return `    <linearGradient id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">\n${stops}\n    </linearGradient>`;
  }
}

/**
 * Generate paths for data modules (excluding position patterns, timing patterns, and logo area)
 */
function generateDataModulePaths(
  qrMatrix: QRMatrix,
  dotSize: number,
  margin: number,
  offsetX: number,
  offsetY: number,
  dotType: DotType,
  logoExclusionArea: { x: number; y: number; size: number } | null = null
): string {
  const moduleCount = qrMatrix.getModuleCount();
  const paths: string[] = [];

  // Position pattern areas to exclude (7x7 in each corner + 1 cell separator)
  const isPositionPattern = (row: number, col: number): boolean => {
    // Top-left
    if (row < 8 && col < 8) return true;
    // Top-right
    if (row < 8 && col >= moduleCount - 8) return true;
    // Bottom-left
    if (row >= moduleCount - 8 && col < 8) return true;
    return false;
  };

  // Check if a module is within the logo exclusion area
  const isInLogoArea = (row: number, col: number): boolean => {
    if (!logoExclusionArea) return false;

    const x = margin + col * dotSize + offsetX;
    const y = margin + row * dotSize + offsetY;

    // Check if the module overlaps with the logo area
    return (
      x + dotSize > logoExclusionArea.x &&
      x < logoExclusionArea.x + logoExclusionArea.size &&
      y + dotSize > logoExclusionArea.y &&
      y < logoExclusionArea.y + logoExclusionArea.size
    );
  };

  // Get neighbor information for context-aware dot styles
  const getNeighbors = (row: number, col: number): Neighbors => {
    return {
      top: row > 0 && qrMatrix.isDark(row - 1, col) && !isPositionPattern(row - 1, col) && !isInLogoArea(row - 1, col),
      right: col < moduleCount - 1 && qrMatrix.isDark(row, col + 1) && !isPositionPattern(row, col + 1) && !isInLogoArea(row, col + 1),
      bottom: row < moduleCount - 1 && qrMatrix.isDark(row + 1, col) && !isPositionPattern(row + 1, col) && !isInLogoArea(row + 1, col),
      left: col > 0 && qrMatrix.isDark(row, col - 1) && !isPositionPattern(row, col - 1) && !isInLogoArea(row, col - 1),
    };
  };

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      // Skip position patterns
      if (isPositionPattern(row, col)) continue;

      // Skip modules in logo area
      if (isInLogoArea(row, col)) continue;

      if (qrMatrix.isDark(row, col)) {
        const x = margin + col * dotSize + offsetX;
        const y = margin + row * dotSize + offsetY;
        const neighbors = getNeighbors(row, col);

        paths.push(getDotPath(dotType, x, y, dotSize, neighbors));
      }
    }
  }

  return paths.join(' ');
}

/**
 * Embed SVG logo as inline vector graphics
 * Extracts the SVG content and applies positioning/scaling
 */
function embedSvgLogo(svgContent: string, x: number, y: number, size: number): string | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svg = doc.documentElement;

    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      if (import.meta.env.DEV) console.error('Failed to parse SVG logo');
      return null;
    }

    // Get the original viewBox or dimensions
    let viewBox = svg.getAttribute('viewBox');
    const originalWidth = parseFloat(svg.getAttribute('width') || '100');
    const originalHeight = parseFloat(svg.getAttribute('height') || '100');

    if (!viewBox) {
      viewBox = `0 0 ${originalWidth} ${originalHeight}`;
    }

    // Parse viewBox to get dimensions
    const vbParts = viewBox.split(/[\s,]+/).map(parseFloat);
    const vbWidth = vbParts[2] || originalWidth;
    const vbHeight = vbParts[3] || originalHeight;

    // Calculate scale to fit within the logo size
    const scale = Math.min(size / vbWidth, size / vbHeight);

    // Calculate offset to center the logo
    const scaledWidth = vbWidth * scale;
    const scaledHeight = vbHeight * scale;
    const offsetX = x + (size - scaledWidth) / 2;
    const offsetY = y + (size - scaledHeight) / 2;

    // Extract inner content of the SVG (everything inside <svg>)
    const innerContent = svg.innerHTML;

    // Create a group with transform for positioning and scaling
    return `    <g id="logo-vector" transform="translate(${offsetX}, ${offsetY}) scale(${scale})">
${innerContent.split('\n').map(line => '      ' + line).join('\n')}
    </g>`;
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error embedding SVG logo:', error);
    return null;
  }
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Convert any image URL to a base64 data URL by loading it into a canvas
 * This is the most reliable way to embed images in SVG files
 */
async function convertToDataUrl(url: string): Promise<string | null> {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Trim whitespace
  url = url.trim();

  // If it's already a valid data URL, verify and return
  if (url.startsWith('data:image/')) {
    // Additional validation: ensure it has actual data
    if (url.includes(',') && url.split(',')[1]?.length > 10) {
      return url;
    }
  }

  // Skip obvious file paths that can't be loaded in browser
  if (url.startsWith('/') && !url.startsWith('/Users') === false) {
    // Allow blob URLs and http URLs
  }

  // Load image and convert via canvas - most reliable method
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (import.meta.env.DEV) console.error('Could not get canvas context for logo conversion');
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0);

        // Convert to PNG data URL
        const dataUrl = canvas.toDataURL('image/png');

        if (dataUrl && dataUrl.startsWith('data:image/')) {
          resolve(dataUrl);
        } else {
          if (import.meta.env.DEV) console.error('Canvas did not produce valid data URL');
          resolve(null);
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error converting logo to data URL:', error);
        resolve(null);
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      if (import.meta.env.DEV) console.error('Failed to load logo image for SVG embedding');
      resolve(null);
    };

    // Set a timeout in case the image hangs
    const timeoutId = setTimeout(() => {
      if (!img.complete) {
        if (import.meta.env.DEV) console.error('Logo image load timed out');
        resolve(null);
      }
    }, 5000);

    img.src = url;
  });
}

/**
 * Download SVG string as a file
 */
export function downloadSVG(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
