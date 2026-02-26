#!/usr/bin/env node
/**
 * Generate a 1200x630 Open Graph image for Qrius.
 * Uses sharp to create a branded gradient background with text overlay.
 * Run: node scripts/generate-og-image.mjs
 */
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;

// Create an SVG with branded gradient and text
const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#f59e0b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f97316;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="qr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.25)" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.1)" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" rx="0"/>

  <!-- Decorative QR-like grid pattern -->
  <g opacity="0.12">
    ${Array.from({ length: 8 }, (_, r) =>
      Array.from({ length: 8 }, (_, c) => {
        const on = ((r + c) % 3 !== 0) && (r < 3 || r > 4 || c < 3 || c > 4);
        if (!on) return '';
        const x = 780 + c * 48;
        const y = 120 + r * 48;
        return `<rect x="${x}" y="${y}" width="40" height="40" rx="8" fill="white"/>`;
      }).join('')
    ).join('')}
  </g>

  <!-- QR icon placeholder -->
  <rect x="810" y="150" width="160" height="160" rx="24" fill="url(#qr-grad)" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
  <rect x="840" y="180" width="30" height="30" rx="6" fill="rgba(255,255,255,0.5)"/>
  <rect x="910" y="180" width="30" height="30" rx="6" fill="rgba(255,255,255,0.5)"/>
  <rect x="840" y="250" width="30" height="30" rx="6" fill="rgba(255,255,255,0.5)"/>
  <rect x="875" y="215" width="30" height="30" rx="4" fill="rgba(255,255,255,0.35)"/>

  <!-- Text -->
  <text x="80" y="260" font-family="Inter, -apple-system, system-ui, sans-serif" font-weight="800" font-size="72" fill="white">
    Qrius
  </text>
  <text x="80" y="330" font-family="Inter, -apple-system, system-ui, sans-serif" font-weight="400" font-size="32" fill="rgba(255,255,255,0.9)">
    QR Code Generator
  </text>

  <text x="80" y="420" font-family="Inter, -apple-system, system-ui, sans-serif" font-weight="500" font-size="22" fill="rgba(255,255,255,0.75)">
    Beautiful, customizable QR codes with
  </text>
  <text x="80" y="455" font-family="Inter, -apple-system, system-ui, sans-serif" font-weight="500" font-size="22" fill="rgba(255,255,255,0.75)">
    analytics &amp; team collaboration
  </text>

  <!-- Bottom bar -->
  <rect x="80" y="530" width="120" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
  <text x="80" y="570" font-family="Inter, -apple-system, system-ui, sans-serif" font-weight="400" font-size="18" fill="rgba(255,255,255,0.5)">
    qrius.app
  </text>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile('public/og-image.png');

console.log('Generated public/og-image.png (1200x630)');
