import type QRCodeStyling from 'qr-code-styling';

/**
 * Robust QR code rasterization with multiple fallbacks.
 *
 * 1. Try library's getRawData (canvas.toBlob — works when type is 'canvas')
 * 2. Fallback: access internal canvas directly and export
 * 3. Fallback: serialize SVG to Blob URL and rasterize (avoids btoa)
 */
export async function rasterizeQRToBlob(
  qrInstance: QRCodeStyling,
  format: 'png' | 'jpeg' = 'png',
  quality?: number
): Promise<Blob> {
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

  // Approach 1: library's getRawData (uses canvas.toBlob directly for canvas type)
  try {
    const rawData = await qrInstance.getRawData(format);
    if (rawData && rawData instanceof Blob) {
      return rawData;
    }
  } catch (e) {
    if (import.meta.env.DEV) console.warn('QR getRawData failed, trying fallback:', e);
  }

  const instance = qrInstance as unknown as {
    _svg?: SVGElement;
    _domCanvas?: HTMLCanvasElement;
    _svgDrawingPromise?: Promise<void>;
    _canvasDrawingPromise?: Promise<void>;
  };

  // Approach 2: access internal canvas directly
  if (instance._canvasDrawingPromise) {
    try {
      await instance._canvasDrawingPromise;
    } catch { /* ignore */ }
  }

  if (instance._domCanvas) {
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        instance._domCanvas!.toBlob((b) => resolve(b), mimeType, quality);
      });
      if (blob) return blob;
    } catch (e) {
      console.warn('QR canvas.toBlob failed, trying SVG fallback:', e);
    }
  }

  // Approach 3: SVG → Blob URL → Image → Canvas → Blob (avoids btoa)
  if (instance._svgDrawingPromise) {
    try {
      await instance._svgDrawingPromise;
    } catch { /* ignore */ }
  }

  const svg = instance._svg;
  if (!svg) throw new Error('No QR canvas or SVG available');

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
