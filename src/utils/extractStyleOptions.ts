import type { QRStyleOptionsForPreview } from '@/components/ui/QRMiniPreview';

/**
 * Safely extract style_options from QR code metadata.
 * Returns undefined if metadata is missing or malformed.
 */
export function extractStyleOptions(metadata: unknown): QRStyleOptionsForPreview | undefined {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return undefined;
  const m = metadata as Record<string, unknown>;
  if (!m.style_options || typeof m.style_options !== 'object' || Array.isArray(m.style_options)) return undefined;
  return m.style_options as QRStyleOptionsForPreview;
}
