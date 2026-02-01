/**
 * Curated Google Fonts configuration for the Brand Template Wizard.
 * 25 fonts organized by category for professional QR code frame typography.
 */

import type { GoogleFontOption, GoogleFontCategory } from '../types';

// ============================================================================
// Curated Google Fonts List
// ============================================================================

export const GOOGLE_FONTS: GoogleFontOption[] = [
  // Sans-Serif fonts (13)
  { name: 'Inter', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { name: 'Roboto', category: 'sans-serif', weights: [400, 500, 700] },
  { name: 'Open Sans', category: 'sans-serif', weights: [400, 600, 700] },
  { name: 'Lato', category: 'sans-serif', weights: [400, 700] },
  { name: 'Montserrat', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { name: 'Poppins', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { name: 'Nunito', category: 'sans-serif', weights: [400, 600, 700] },
  { name: 'Source Sans Pro', category: 'sans-serif', weights: [400, 600, 700] },
  { name: 'Work Sans', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { name: 'DM Sans', category: 'sans-serif', weights: [400, 500, 700] },
  { name: 'Space Grotesk', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { name: 'Manrope', category: 'sans-serif', weights: [400, 500, 600, 700] },
  { name: 'Plus Jakarta Sans', category: 'sans-serif', weights: [400, 500, 600, 700] },

  // Serif fonts (3)
  { name: 'Playfair Display', category: 'serif', weights: [400, 500, 600, 700] },
  { name: 'Merriweather', category: 'serif', weights: [400, 700] },
  { name: 'Lora', category: 'serif', weights: [400, 500, 600, 700] },

  // Display fonts (9)
  { name: 'Raleway', category: 'display', weights: [400, 500, 600, 700] },
  { name: 'Quicksand', category: 'display', weights: [400, 500, 600, 700] },
  { name: 'Outfit', category: 'display', weights: [400, 500, 600, 700] },
  { name: 'Sora', category: 'display', weights: [400, 500, 600, 700] },
  { name: 'Lexend', category: 'display', weights: [400, 500, 600, 700] },
  { name: 'Red Hat Display', category: 'display', weights: [400, 500, 600, 700] },
  { name: 'Rubik', category: 'display', weights: [400, 500, 600, 700] },
  { name: 'Figtree', category: 'display', weights: [400, 500, 600, 700] },
  { name: 'Barlow', category: 'display', weights: [400, 500, 600, 700] },
];

// ============================================================================
// Font Utilities
// ============================================================================

/**
 * Get fonts filtered by category
 */
export function getFontsByCategory(category: GoogleFontCategory): GoogleFontOption[] {
  return GOOGLE_FONTS.filter((font) => font.category === category);
}

/**
 * Get a font by name
 */
export function getFontByName(name: string): GoogleFontOption | undefined {
  return GOOGLE_FONTS.find((font) => font.name === name);
}

/**
 * Check if a font is a system font (not a Google Font)
 */
export function isSystemFont(fontName?: string): boolean {
  if (!fontName) return true;
  const systemFonts = ['sans', 'serif', 'mono', 'rounded', 'sans-serif', 'system-ui'];
  return systemFonts.includes(fontName.toLowerCase());
}

/**
 * Get available font weights for a given font
 */
export function getFontWeights(fontName: string): number[] {
  const font = getFontByName(fontName);
  return font?.weights ?? [400, 700];
}

/**
 * Generate Google Fonts CSS URL for a font with specific weights
 */
export function getGoogleFontUrl(fontName: string, weights: number[] = [400, 700]): string {
  const encodedName = encodeURIComponent(fontName);
  const weightsParam = weights.join(';');
  return `https://fonts.googleapis.com/css2?family=${encodedName}:wght@${weightsParam}&display=swap`;
}

/**
 * Font weight labels for UI
 */
export const FONT_WEIGHT_LABELS: Record<number, string> = {
  400: 'Regular',
  500: 'Medium',
  600: 'Semi Bold',
  700: 'Bold',
};

/**
 * Category labels for UI
 */
export const FONT_CATEGORY_LABELS: Record<GoogleFontCategory, string> = {
  'sans-serif': 'Sans Serif',
  'serif': 'Serif',
  'display': 'Display',
};
