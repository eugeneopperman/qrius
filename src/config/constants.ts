/**
 * Centralized constants for the QR Code Generator application.
 * Extracts magic numbers and repeated values for better maintainability.
 */

/** App version — bump by 0.01 with each release */
export const APP_VERSION = '0.20';

// ============================================================================
// QR Code Configuration
// ============================================================================

export const QR_CONFIG = {
  /** Default QR code display size in pixels */
  SIZE: 280,
  /** Default margin around QR code in pixels */
  MARGIN: 10,
  /** Maximum characters for standard QR encoding */
  MAX_DATA_LENGTH: 2953,
  /** PDF export size in mm */
  PDF_SIZE_MM: 80,
  /** Placeholder data for ghost QR preview when no content is entered */
  GHOST_DATA: 'https://qrius.app',
} as const;

// ============================================================================
// Logo Configuration
// ============================================================================

export const LOGO_CONFIG = {
  /** Maximum file size in bytes (2MB) */
  MAX_FILE_SIZE: 2 * 1024 * 1024,
  /** Default logo size as percentage of QR code (0-1) */
  DEFAULT_SIZE: 0.3,
  /** Default logo margin in pixels */
  DEFAULT_MARGIN: 5,
  /** Available logo size presets */
  SIZE_OPTIONS: [
    { value: 0.2, label: 'Small (20%)' },
    { value: 0.3, label: 'Medium (30%)' },
    { value: 0.35, label: 'Large (35%)' },
    { value: 0.4, label: 'Extra Large (40%)' },
  ],
  /** Available logo padding options */
  PADDING_OPTIONS: [
    { value: 0, label: 'None' },
    { value: 5, label: 'Small' },
    { value: 10, label: 'Medium' },
  ],
} as const;

// ============================================================================
// Color Palettes
// ============================================================================

/** Default color swatches for ColorPicker */
export const COLOR_PRESETS = [
  '#000000', '#374151', '#6B7280', '#9CA3AF',
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#EC4899', '#F43F5E',
] as const;

/** Color palette presets for solid QR codes */
export const COLOR_PALETTES = [
  { name: 'Classic', qrColor: '#000000', bgColor: '#FFFFFF' },
  { name: 'Indigo', qrColor: '#4F46E5', bgColor: '#FFFFFF' },
  { name: 'Ocean', qrColor: '#0369A1', bgColor: '#F0F9FF' },
  { name: 'Forest', qrColor: '#166534', bgColor: '#F0FDF4' },
  { name: 'Sunset', qrColor: '#C2410C', bgColor: '#FFF7ED' },
  { name: 'Berry', qrColor: '#9D174D', bgColor: '#FDF2F8' },
  { name: 'Slate', qrColor: '#334155', bgColor: '#F8FAFC' },
  { name: 'Inverted', qrColor: '#FFFFFF', bgColor: '#000000' },
] as const;

/** Gradient presets for QR codes */
export const GRADIENT_PRESETS: Array<{
  name: string;
  gradient: {
    type: 'linear' | 'radial';
    rotation?: number;
    colorStops: Array<{ offset: number; color: string }>;
  };
}> = [
  {
    name: 'Indigo to Pink',
    gradient: { type: 'linear', rotation: 45, colorStops: [{ offset: 0, color: '#6366F1' }, { offset: 1, color: '#EC4899' }] },
  },
  {
    name: 'Blue to Cyan',
    gradient: { type: 'linear', rotation: 90, colorStops: [{ offset: 0, color: '#3B82F6' }, { offset: 1, color: '#06B6D4' }] },
  },
  {
    name: 'Green to Yellow',
    gradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#22C55E' }, { offset: 1, color: '#EAB308' }] },
  },
  {
    name: 'Purple to Orange',
    gradient: { type: 'linear', rotation: 45, colorStops: [{ offset: 0, color: '#8B5CF6' }, { offset: 1, color: '#F97316' }] },
  },
  {
    name: 'Red to Pink',
    gradient: { type: 'radial', colorStops: [{ offset: 0, color: '#EF4444' }, { offset: 1, color: '#EC4899' }] },
  },
  {
    name: 'Teal Radial',
    gradient: { type: 'radial', colorStops: [{ offset: 0, color: '#14B8A6' }, { offset: 1, color: '#0F172A' }] },
  },
];

/** Default gradient configuration */
export const DEFAULT_GRADIENT = {
  type: 'linear' as const,
  rotation: 45,
  colorStops: [
    { offset: 0, color: '#6366F1' },
    { offset: 1, color: '#EC4899' },
  ],
};

// ============================================================================
// Frame Configuration
// ============================================================================

export const FRAME_CONFIG = {
  /** Maximum characters for frame label */
  MAX_LABEL_LENGTH: 30,
  /** Default frame label suggestions */
  DEFAULT_LABELS: [
    'Scan Me',
    'Learn More',
    'Visit Us',
    'Download App',
    'Get Coupon',
    'Follow Us',
    'Order Now',
    'Shop Now',
    'Book Now',
    'Free Trial',
    'Watch Video',
    'Sign Up',
  ],
} as const;

/** Frame type categories for the visual frame picker */
export const FRAME_CATEGORIES = [
  {
    label: 'Basic',
    frames: [
      { id: 'none', label: 'None' },
      { id: 'simple', label: 'Simple' },
      { id: 'rounded', label: 'Rounded' },
      { id: 'minimal-line', label: 'Minimal Line' },
    ],
  },
  {
    label: 'Label',
    frames: [
      { id: 'bottom-label', label: 'Bottom Label' },
      { id: 'top-label', label: 'Top Label' },
      { id: 'badge', label: 'Badge' },
      { id: 'banner-bottom', label: 'Bottom Banner' },
      { id: 'banner-top', label: 'Top Banner' },
    ],
  },
  {
    label: 'Decorative',
    frames: [
      { id: 'speech-bubble', label: 'Speech Bubble' },
      { id: 'ribbon', label: 'Ribbon' },
      { id: 'sticker', label: 'Sticker' },
      { id: 'decorative-corners', label: 'Corners' },
    ],
  },
  {
    label: 'Shaped & Effects',
    frames: [
      { id: 'circular', label: 'Circular' },
      { id: 'gradient-border', label: 'Gradient' },
      { id: 'shadow-3d', label: '3D Shadow' },
    ],
  },
] as const;

// ============================================================================
// Timing & Debounce
// ============================================================================

export const TIMING = {
  /** Debounce delay for scannability analysis (ms) */
  SCANNABILITY_DEBOUNCE: 300,
  /** Toast notification display duration (ms) */
  TOAST_DURATION: 3000,
  /** Clipboard success indicator duration (ms) */
  COPY_SUCCESS_DURATION: 2000,
  /** Scroll threshold for sticky header (px) */
  SCROLL_THRESHOLD: 50,
} as const;

// ============================================================================
// Validation Limits
// ============================================================================

export const VALIDATION = {
  /** Phone number constraints */
  PHONE: {
    MIN_DIGITS: 7,
    MAX_DIGITS: 15,
  },
  /** WiFi constraints */
  WIFI: {
    MAX_SSID_LENGTH: 32,
    WPA_MIN_PASSWORD: 8,
    WPA_MAX_PASSWORD: 63,
    WEP_KEY_LENGTHS: [5, 10, 13, 26],
  },
  /** SMS constraints */
  SMS: {
    MAX_MESSAGE_LENGTH: 160,
  },
  /** Location constraints */
  LOCATION: {
    LATITUDE_MIN: -90,
    LATITUDE_MAX: 90,
    LONGITUDE_MIN: -180,
    LONGITUDE_MAX: 180,
  },
} as const;

// ============================================================================
// Keyboard Shortcuts
// ============================================================================

export const SHORTCUTS = [
  { keys: ['Ctrl', '1-9'], description: 'Switch QR code type' },
  { keys: ['Ctrl', 'S'], description: 'Download QR code (PNG)' },
  { keys: ['Ctrl', 'Shift', 'S'], description: 'Download with format picker' },
  { keys: ['Ctrl', 'C'], description: 'Copy QR code to clipboard' },
  { keys: ['Ctrl', 'D'], description: 'Toggle dark mode' },
  { keys: ['Ctrl', 'R'], description: 'Open QR code reader' },
  { keys: ['Ctrl', 'H'], description: 'Open history' },
  { keys: ['Ctrl', 'T'], description: 'Open templates' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
] as const;

// ============================================================================
// QR Type Configuration
// ============================================================================

export const QR_TYPES = [
  'url',
  'text',
  'email',
  'phone',
  'sms',
  'wifi',
  'vcard',
  'event',
  'location',
] as const;
