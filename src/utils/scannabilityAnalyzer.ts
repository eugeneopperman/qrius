export interface ScannabilityResult {
  score: 'excellent' | 'good' | 'warning' | 'poor';
  percentage: number;
  issues: ScannabilityIssue[];
  suggestions: string[];
}

export interface ScannabilityIssue {
  type: 'contrast' | 'logo' | 'color' | 'complexity';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

function isProblematicColorCombo(fg: string, bg: string): boolean {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);

  if (!fgRgb || !bgRgb) return false;

  // Check for red-green color blindness issues
  const isRedGreen =
    (fgRgb.r > 150 && fgRgb.g < 100 && bgRgb.g > 150 && bgRgb.r < 100) ||
    (bgRgb.r > 150 && bgRgb.g < 100 && fgRgb.g > 150 && fgRgb.r < 100);

  return isRedGreen;
}

export function analyzeScannability(options: {
  dotsColor: string;
  backgroundColor: string;
  logoSize?: number;
  hasLogo?: boolean;
  dataLength?: number;
  errorCorrectionLevel?: string;
}): ScannabilityResult {
  const issues: ScannabilityIssue[] = [];
  const suggestions: string[] = [];
  let deductions = 0;

  // Analyze contrast
  const contrastRatio = getContrastRatio(options.dotsColor, options.backgroundColor);

  if (contrastRatio < 3) {
    issues.push({
      type: 'contrast',
      severity: 'high',
      message: 'Very low contrast between QR code and background',
    });
    suggestions.push('Increase contrast by using darker QR code or lighter background');
    deductions += 40;
  } else if (contrastRatio < 4.5) {
    issues.push({
      type: 'contrast',
      severity: 'medium',
      message: 'Contrast could be improved for better scanning',
    });
    suggestions.push('Consider using higher contrast colors');
    deductions += 20;
  } else if (contrastRatio < 7) {
    deductions += 5;
  }

  // Check for problematic color combinations
  if (isProblematicColorCombo(options.dotsColor, options.backgroundColor)) {
    issues.push({
      type: 'color',
      severity: 'medium',
      message: 'Color combination may be difficult for colorblind users',
    });
    suggestions.push('Avoid red-green color combinations');
    deductions += 15;
  }

  // Check if background is darker than foreground (inverted)
  const fgRgb = hexToRgb(options.dotsColor);
  const bgRgb = hexToRgb(options.backgroundColor);
  if (fgRgb && bgRgb) {
    const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

    if (fgLuminance > bgLuminance) {
      issues.push({
        type: 'contrast',
        severity: 'low',
        message: 'Light QR code on dark background (inverted)',
      });
      suggestions.push('Some scanners work better with dark QR codes on light backgrounds');
      deductions += 10;
    }
  }

  // Analyze logo
  if (options.hasLogo && options.logoSize) {
    if (options.logoSize > 0.25) {
      issues.push({
        type: 'logo',
        severity: 'medium',
        message: 'Logo is quite large and may affect scanning',
      });
      suggestions.push('Consider reducing logo size or using High error correction');
      deductions += 15;

      if (options.errorCorrectionLevel !== 'H') {
        issues.push({
          type: 'logo',
          severity: 'high',
          message: 'Large logo without High error correction',
        });
        suggestions.push('Set error correction to High (30%) when using large logos');
        deductions += 20;
      }
    } else if (options.logoSize > 0.2) {
      if (options.errorCorrectionLevel === 'L') {
        issues.push({
          type: 'logo',
          severity: 'medium',
          message: 'Logo with Low error correction may cause scanning issues',
        });
        suggestions.push('Increase error correction level to Medium or higher');
        deductions += 15;
      }
    }
  }

  // Analyze data complexity
  if (options.dataLength && options.dataLength > 200) {
    issues.push({
      type: 'complexity',
      severity: 'low',
      message: 'Long data creates a dense QR code',
    });
    suggestions.push('Consider shortening the URL for easier scanning at small sizes');
    deductions += 10;
  }

  // Calculate final score
  const percentage = Math.max(0, Math.min(100, 100 - deductions));

  let score: ScannabilityResult['score'];
  if (percentage >= 85) {
    score = 'excellent';
  } else if (percentage >= 70) {
    score = 'good';
  } else if (percentage >= 50) {
    score = 'warning';
  } else {
    score = 'poor';
  }

  return {
    score,
    percentage,
    issues,
    suggestions,
  };
}
