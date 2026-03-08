// Brand constants for email templates

export const BRAND = {
  // Colors
  snow: '#FAFAF8',
  white: '#FFFFFF',
  ink: '#1A1A1A',
  charcoal: '#4A4A4A',
  ember: '#F97316',
  emberLight: '#FFF3E8',
  mist: '#E8E6E3',
  success: '#22C55E',
  warning: '#F43F5E',
  info: '#0EA5E9',

  // Typography
  serifFont: 'Georgia, "Times New Roman", serif',
  sansFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',

  // Layout
  maxWidth: 600,
  borderRadius: '12px',
  buttonRadius: '8px',

  // URLs
  iconUrl: 'https://qriuscodes.com/icon.svg',
  appUrl: 'https://qriuscodes.com',
  dashboardUrl: 'https://qriuscodes.com/dashboard',

  // Sender addresses
  fromHello: 'Qrius Codes <hello@qrcodes.com>',
  fromNoreply: 'Qrius Codes <noreply@qrcodes.com>',

  // Tagline
  tagline: 'Stay qrius.',
} as const;
