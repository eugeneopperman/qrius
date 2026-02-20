import type QRCodeStyling from 'qr-code-styling';

/**
 * Robust QR code rasterization that avoids the btoa() bug in qr-code-styling.
 *
 * The library's internal SVG→canvas pipeline uses btoa(svgString) which throws
 * DOMException when the SVG contains non-Latin1 characters. Our fallback uses
 * Blob URL → Image → Canvas which bypasses btoa() entirely.
 */
export async function rasterizeQRToBlob(
  qrInstance: QRCodeStyling,
  format: 'png' | 'jpeg' = 'png',
  quality?: number
): Promise<Blob> {
  // First, try the library's getRawData (uses internal canvas pipeline)
  try {
    const rawData = await qrInstance.getRawData(format);
    if (rawData && rawData instanceof Blob) {
      return rawData;
    }
  } catch {
    // Library method failed (likely btoa issue), fall through to manual conversion
  }

  // Fallback: convert SVG → Blob URL → Image → Canvas → Blob
  const instance = qrInstance as unknown as {
    _svg?: SVGElement;
    _svgDrawingPromise?: Promise<void>;
  };

  if (instance._svgDrawingPromise) {
    await instance._svgDrawingPromise;
  }

  const svg = instance._svg;
  if (!svg) throw new Error('QR code SVG not available');

  const svgString = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    return await new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const w = parseInt(svg.getAttribute('width') || '280') * 2;
          const h = parseInt(svg.getAttribute('height') || '280') * 2;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
          ctx.drawImage(img, 0, 0, w, h);

          const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
          canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Blob creation failed')),
            mimeType,
            quality
          );
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('Failed to load SVG as image'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Trigger a browser file download from a Blob. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
