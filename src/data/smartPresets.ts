import type { QRCodeType, QRStyleOptions, URLData, WiFiData, VCardData, EventData } from '@/types';

export interface SmartPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: QRCodeType;
  defaultData: Partial<URLData | WiFiData | VCardData | EventData>;
  styleOptions: Partial<QRStyleOptions>;
}

export const smartPresets: SmartPreset[] = [
  {
    id: 'wifi-guest',
    name: 'WiFi Guest Network',
    description: 'Share your guest WiFi credentials easily',
    icon: 'Wifi',
    type: 'wifi',
    defaultData: {
      ssid: 'Guest Network',
      encryption: 'WPA',
      hidden: false,
    } as Partial<WiFiData>,
    styleOptions: {
      dotsColor: '#0EA5E9',
      backgroundColor: '#ffffff',
      dotsType: 'rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
      errorCorrectionLevel: 'M',
      frameStyle: 'bottom-label',
      frameLabel: 'Scan for WiFi',
    },
  },
  {
    id: 'business-card',
    name: 'Business Card',
    description: 'Professional contact card with your details',
    icon: 'UserCircle',
    type: 'vcard',
    defaultData: {
      firstName: '',
      lastName: '',
      organization: '',
      title: '',
      phone: '',
      email: '',
      website: '',
    } as Partial<VCardData>,
    styleOptions: {
      dotsColor: '#1F2937',
      backgroundColor: '#ffffff',
      dotsType: 'square',
      cornersSquareType: 'square',
      cornersDotType: 'square',
      errorCorrectionLevel: 'Q',
      frameStyle: 'simple',
    },
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Eye-catching QR for promotional materials',
    icon: 'Megaphone',
    type: 'url',
    defaultData: {
      url: '',
      useShortened: true,
    } as Partial<URLData>,
    styleOptions: {
      dotsColor: '#7C3AED',
      backgroundColor: '#ffffff',
      dotsType: 'extra-rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
      errorCorrectionLevel: 'H',
      frameStyle: 'badge',
      frameLabel: 'SCAN ME',
      useGradient: true,
      gradient: {
        type: 'linear',
        rotation: 45,
        colorStops: [
          { offset: 0, color: '#7C3AED' },
          { offset: 1, color: '#EC4899' },
        ],
      },
    },
  },
  {
    id: 'social-media',
    name: 'Social Media Link',
    description: 'Optimized for small sizes on social posts',
    icon: 'Share2',
    type: 'url',
    defaultData: {
      url: '',
      useShortened: true,
    } as Partial<URLData>,
    styleOptions: {
      dotsColor: '#000000',
      backgroundColor: '#ffffff',
      dotsType: 'dots',
      cornersSquareType: 'dot',
      cornersDotType: 'dot',
      errorCorrectionLevel: 'L',
      frameStyle: 'none',
    },
  },
  {
    id: 'event-checkin',
    name: 'Event Check-in',
    description: 'Large, easy-to-scan QR for event registration',
    icon: 'CalendarCheck',
    type: 'event',
    defaultData: {
      title: '',
      location: '',
      startDate: '',
      startTime: '',
    } as Partial<EventData>,
    styleOptions: {
      dotsColor: '#059669',
      backgroundColor: '#ffffff',
      dotsType: 'square',
      cornersSquareType: 'square',
      cornersDotType: 'square',
      errorCorrectionLevel: 'H',
      frameStyle: 'top-label',
      frameLabel: 'CHECK IN',
    },
  },
  {
    id: 'restaurant-menu',
    name: 'Restaurant Menu',
    description: 'Clean design for table-top menu access',
    icon: 'UtensilsCrossed',
    type: 'url',
    defaultData: {
      url: '',
    } as Partial<URLData>,
    styleOptions: {
      dotsColor: '#78350F',
      backgroundColor: '#FEF3C7',
      dotsType: 'classy',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
      errorCorrectionLevel: 'M',
      frameStyle: 'bottom-label',
      frameLabel: 'View Menu',
    },
  },
  {
    id: 'payment',
    name: 'Payment Link',
    description: 'Secure-looking QR for payment requests',
    icon: 'CreditCard',
    type: 'url',
    defaultData: {
      url: '',
    } as Partial<URLData>,
    styleOptions: {
      dotsColor: '#166534',
      backgroundColor: '#ffffff',
      dotsType: 'rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
      errorCorrectionLevel: 'H',
      frameStyle: 'rounded',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Simple black and white classic design',
    icon: 'Minimize2',
    type: 'url',
    defaultData: {
      url: '',
    } as Partial<URLData>,
    styleOptions: {
      dotsColor: '#000000',
      backgroundColor: '#ffffff',
      dotsType: 'square',
      cornersSquareType: 'square',
      cornersDotType: 'square',
      errorCorrectionLevel: 'M',
      frameStyle: 'none',
      useGradient: false,
    },
  },
];

export function getPresetById(id: string): SmartPreset | undefined {
  return smartPresets.find((preset) => preset.id === id);
}
