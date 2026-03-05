import type QRCodeStyling from 'qr-code-styling';

/** Race a promise against a timeout. Rejects with a descriptive error on timeout. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Download timed out. Please try again.')), ms)
    ),
  ]);
}

/** Default timeout for individual download operations (ms) */
const DOWNLOAD_TIMEOUT = 10_000;

/**
 * Robust QR code rasterization with multiple fallbacks.
 *
 * 1. Try library's getRawData (canvas.toBlob — works when type is 'canvas')
 * 2. Fallback: access internal canvas directly and export
 * 3. Fallback: serialize SVG to Blob URL and rasterize (avoids btoa)
 *
 * Each approach is guarded by a timeout to prevent indefinite hangs
 * (e.g. if the library's internal drawing promise never resolves).
 */
export async function rasterizeQRToBlob(
  qrInstance: QRCodeStyling,
  format: 'png' | 'jpeg' = 'png',
  quality?: number
): Promise<Blob> {
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

  // Approach 1: library's getRawData (uses canvas.toBlob directly for canvas type)
  try {
    const rawData = await withTimeout(qrInstance.getRawData(format), DOWNLOAD_TIMEOUT);
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
      await withTimeout(instance._canvasDrawingPromise, DOWNLOAD_TIMEOUT);
    } catch { /* ignore — fall through to try canvas anyway */ }
  }

  if (instance._domCanvas) {
    try {
      const blob = await withTimeout(
        new Promise<Blob | null>((resolve) => {
          instance._domCanvas!.toBlob((b) => resolve(b), mimeType, quality);
        }),
        DOWNLOAD_TIMEOUT,
      );
      if (blob) return blob;
    } catch (e) {
      if (import.meta.env.DEV) console.warn('QR canvas.toBlob failed, trying SVG fallback:', e);
    }
  }

  // Approach 3: SVG → Blob URL → Image → Canvas → Blob (avoids btoa)
  if (instance._svgDrawingPromise) {
    try {
      await withTimeout(instance._svgDrawingPromise, DOWNLOAD_TIMEOUT);
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
