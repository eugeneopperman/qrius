import type { LogoShape } from '@/types';

/**
 * Applies a shape mask to a logo image and returns a data URL.
 * This is used to prepare logos for QR code generation with the correct shape.
 */
export async function applyLogoMask(
  imageDataUrl: string,
  shape: LogoShape
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!imageDataUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Create clipping path based on shape
      ctx.beginPath();
      switch (shape) {
        case 'circle':
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          break;
        case 'rounded': {
          // Rounded rectangle with ~20% corner radius
          const radius = size * 0.2;
          ctx.moveTo(radius, 0);
          ctx.lineTo(size - radius, 0);
          ctx.quadraticCurveTo(size, 0, size, radius);
          ctx.lineTo(size, size - radius);
          ctx.quadraticCurveTo(size, size, size - radius, size);
          ctx.lineTo(radius, size);
          ctx.quadraticCurveTo(0, size, 0, size - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
          break;
        }
        case 'square':
        default:
          ctx.rect(0, 0, size, size);
          break;
      }
      ctx.closePath();
      ctx.clip();

      // Draw image centered and cropped to square
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

      // Return as PNG data URL
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageDataUrl;
  });
}
