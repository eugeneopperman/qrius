import { useEffect, useRef } from 'react';
import { isSystemFont, getGoogleFontUrl, getFontByName } from '@/config/fonts';

/**
 * Cache to track loaded fonts to avoid duplicate requests
 */
const loadedFonts = new Set<string>();

/**
 * Hook to dynamically load a Google Font on-demand
 *
 * @param fontName - The Google Font family name (e.g., "Inter", "Roboto")
 * @param weight - Font weight to load (default: 400)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useGoogleFont('Inter', 600);
 *   return <p style={{ fontFamily: 'Inter' }}>Hello</p>;
 * }
 * ```
 */
export function useGoogleFont(fontName?: string, weight: number = 400): void {
  const linkRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    // Skip if no font name, system font, or already loaded
    if (!fontName || isSystemFont(fontName)) return;

    const cacheKey = `${fontName}:${weight}`;
    if (loadedFonts.has(cacheKey)) return;

    // Get the font config to check available weights
    const fontConfig = getFontByName(fontName);
    const weightsToLoad = fontConfig?.weights ?? [400, 700];

    // Create and append the link element
    const link = document.createElement('link');
    link.href = getGoogleFontUrl(fontName, weightsToLoad);
    link.rel = 'stylesheet';
    link.setAttribute('data-font', fontName);

    document.head.appendChild(link);
    linkRef.current = link;
    loadedFonts.add(cacheKey);

    // Cleanup is not needed as we want fonts to persist
    // However, we store the ref in case we need it later
  }, [fontName, weight]);
}

/**
 * Preload multiple fonts at once (useful for font selector)
 *
 * @param fontNames - Array of font family names to preload
 */
export function preloadFonts(fontNames: string[]): void {
  fontNames.forEach((name) => {
    if (isSystemFont(name) || loadedFonts.has(`${name}:400`)) return;

    const fontConfig = getFontByName(name);
    const weights = fontConfig?.weights ?? [400, 700];

    const link = document.createElement('link');
    link.href = getGoogleFontUrl(name, weights);
    link.rel = 'stylesheet';
    link.setAttribute('data-font', name);
    document.head.appendChild(link);
    loadedFonts.add(`${name}:400`);
  });
}

/**
 * Check if a font has been loaded
 */
export function isFontLoaded(fontName: string): boolean {
  return loadedFonts.has(`${fontName}:400`);
}

/**
 * Get CSS font-family value for a font name
 * Returns the font name with fallbacks
 */
export function getFontFamily(fontName?: string): string {
  if (!fontName || isSystemFont(fontName)) {
    // Map system font keywords to actual font stacks
    switch (fontName) {
      case 'sans':
        return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      case 'serif':
        return 'Georgia, Cambria, "Times New Roman", Times, serif';
      case 'mono':
        return 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';
      case 'rounded':
        return '"SF Pro Rounded", system-ui, -apple-system, sans-serif';
      default:
        return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    }
  }

  // For Google Fonts, return with fallback
  const fontConfig = getFontByName(fontName);
  const fallback = fontConfig?.category === 'serif'
    ? 'serif'
    : 'sans-serif';

  return `"${fontName}", ${fallback}`;
}
