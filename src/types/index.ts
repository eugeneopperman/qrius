export type QRCodeType =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'vcard'
  | 'event'
  | 'location';

export interface QRCodeTypeInfo {
  id: QRCodeType;
  label: string;
  icon: string;
  description: string;
}

export interface URLData {
  url: string;
  shortened?: string;
  useShortened?: boolean;
  // Tracking-related fields
  trackingEnabled?: boolean;
  trackingUrl?: string;        // The tracking URL (e.g., https://qrius.app/r/xK9mP2)
  trackingId?: string;         // The trackable QR code ID
  trackingShortCode?: string;  // The short code for display
}

export interface TextData {
  text: string;
}

export interface EmailData {
  email: string;
  subject?: string;
  body?: string;
}

export interface PhoneData {
  phone: string;
}

export interface SMSData {
  phone: string;
  message?: string;
}

export interface WiFiData {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  note?: string;
}

export interface EventData {
  title: string;
  location?: string;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  description?: string;
}

export interface LocationData {
  latitude: string;
  longitude: string;
}

export type QRData =
  | { type: 'url'; data: URLData }
  | { type: 'text'; data: TextData }
  | { type: 'email'; data: EmailData }
  | { type: 'phone'; data: PhoneData }
  | { type: 'sms'; data: SMSData }
  | { type: 'wifi'; data: WiFiData }
  | { type: 'vcard'; data: VCardData }
  | { type: 'event'; data: EventData }
  | { type: 'location'; data: LocationData };

export type DotType = 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
export type CornerSquareType = 'square' | 'dot' | 'extra-rounded';
export type CornerDotType = 'square' | 'dot' | 'extra-rounded';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type FrameStyle = 'none' | 'simple' | 'rounded' | 'bottom-label' | 'top-label' | 'badge';

export type FrameFontSize = 'sm' | 'base' | 'lg' | 'xl';
export type FrameFontFamily = 'sans' | 'serif' | 'mono' | 'rounded';
export type FrameIconPosition = 'left' | 'right' | 'none';
export type FrameIcon = 'none' | 'qr-code' | 'smartphone' | 'camera' | 'arrow-right' | 'download' | 'external-link' | 'scan' | 'finger-print';

export type LogoShape = 'square' | 'rounded' | 'circle';

export type GradientType = 'linear' | 'radial';

export interface GradientOptions {
  type: GradientType;
  rotation?: number; // 0-360 degrees, only for linear
  colorStops: Array<{
    offset: number; // 0-1
    color: string;
  }>;
}

export interface QRStyleOptions {
  dotsColor: string;
  backgroundColor: string;
  dotsType: DotType;
  cornersSquareType: CornerSquareType;
  cornersDotType: CornerDotType;
  errorCorrectionLevel: ErrorCorrectionLevel;
  logoUrl?: string;
  logoSvgContent?: string; // Raw SVG content for vector preservation
  logoSize?: number;
  logoShape?: LogoShape;
  logoMargin?: number;
  frameStyle?: FrameStyle;
  frameLabel?: string;
  frameColor?: string;
  frameFontSize?: FrameFontSize;
  frameFontFamily?: FrameFontFamily;
  frameIcon?: FrameIcon;
  frameIconPosition?: FrameIconPosition;
  useGradient?: boolean;
  gradient?: GradientOptions;
  showFallbackUrl?: boolean;
  qrRoundness?: number; // 0-100% for smooth continuous roundness
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'jpeg' | 'pdf';
  size: number;
  quality?: number;
}

export interface BrandKit {
  id: string;
  name: string;
  createdAt: number;
  style: Partial<QRStyleOptions>;
}

// Brand Template types (new template wizard feature)
export interface BrandTemplateStyle extends QRStyleOptions {
  qrRoundness?: number;         // 0-100 (%) - maps to dot type
  frameBorderRadius?: number;   // 0-32 (px)
  googleFontFamily?: string;    // Google Font name
  googleFontWeight?: number;    // 400, 500, 600, 700
}

export interface BrandTemplate {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  style: BrandTemplateStyle;
}

export type GoogleFontCategory = 'sans-serif' | 'serif' | 'display';

export interface GoogleFontOption {
  name: string;
  category: GoogleFontCategory;
  weights: number[];
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: QRCodeType;
  data: QRData;
  styleOptions: QRStyleOptions;
  qrValue: string;
  thumbnail?: string;
  // Tracking-related fields
  trackingId?: string;          // ID of the trackable QR code in the backend
  trackingShortCode?: string;   // Short code for display
  totalScans?: number;          // Cached scan count
}

// Branded URL Shortener types
export type BrandedUrlProvider = 'none' | 'rebrandly' | 'shortio';

export interface RebrandlyConfig {
  apiKey: string;
  workspaceId?: string;
  domain?: string; // Custom domain e.g., "acme.link"
}

export interface ShortIoConfig {
  apiKey: string;
  domain: string; // Required for Short.io
}

export interface BrandedUrlSettings {
  provider: BrandedUrlProvider;
  rebrandly?: RebrandlyConfig;
  shortio?: ShortIoConfig;
  fallbackToGeneric: boolean; // Fall back to TinyURL/is.gd if branded fails
}

// QR Code Scan Tracking types
export interface TrackableQRCode {
  id: string;
  shortCode: string;
  trackingUrl: string;        // e.g., https://qrius.app/r/xK9mP2
  destinationUrl: string;
  qrType: string;
  originalData?: QRData;
  isActive: boolean;
  totalScans: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrackableQRCodeWithStats extends TrackableQRCode {
  scansToday: number;
  scansThisWeek: number;
  scansThisMonth: number;
  topCountries: Array<{ countryCode: string; count: number }>;
  deviceBreakdown: Array<{ deviceType: string; count: number }>;
  recentScans: ScanEvent[];
}

export interface ScanEvent {
  id: string;
  qrCodeId: string;
  scannedAt: string;
  countryCode?: string;
  city?: string;
  deviceType?: string;
  userAgent?: string;
}

export interface TrackingSettings {
  enabled: boolean;
  apiBaseUrl: string;         // '' for same-origin, can be set for external API
}
