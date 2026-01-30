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
export type CornerDotType = 'square' | 'dot';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type FrameStyle = 'none' | 'simple' | 'rounded' | 'bottom-label' | 'top-label' | 'badge';

export interface QRStyleOptions {
  dotsColor: string;
  backgroundColor: string;
  dotsType: DotType;
  cornersSquareType: CornerSquareType;
  cornersDotType: CornerDotType;
  errorCorrectionLevel: ErrorCorrectionLevel;
  logoUrl?: string;
  logoSize?: number;
  frameStyle?: FrameStyle;
  frameLabel?: string;
  frameColor?: string;
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'jpeg' | 'pdf';
  size: number;
  quality?: number;
}
