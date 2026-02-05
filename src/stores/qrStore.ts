import { create } from 'zustand';
import type {
  QRCodeType,
  QRData,
  QRStyleOptions,
  URLData,
  TextData,
  EmailData,
  PhoneData,
  SMSData,
  WiFiData,
  VCardData,
  EventData,
  LocationData,
} from '../types';

// Escape functions for QR code formats

/**
 * Escape special characters for vCard format
 * vCard requires escaping: backslash, semicolon, comma, newline
 */
function escapeVCard(str: string | undefined): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Escape special characters for WiFi QR format
 * WiFi format requires escaping: backslash, semicolon, colon, comma
 */
function escapeWiFi(str: string | undefined): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/:/g, '\\:')
    .replace(/,/g, '\\,');
}

/**
 * Escape special characters for iCalendar/vEvent format
 * iCalendar requires escaping: backslash, semicolon, comma, newline
 */
function escapeICalendar(str: string | undefined): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

interface HistoryEntry {
  type: QRCodeType;
  data: QRData;
  styleOptions: QRStyleOptions;
}

interface QRStore {
  // Current QR type
  activeType: QRCodeType;
  setActiveType: (type: QRCodeType) => void;

  // Data for each type
  urlData: URLData;
  textData: TextData;
  emailData: EmailData;
  phoneData: PhoneData;
  smsData: SMSData;
  wifiData: WiFiData;
  vcardData: VCardData;
  eventData: EventData;
  locationData: LocationData;

  // Update functions
  setUrlData: (data: Partial<URLData>) => void;
  setTextData: (data: Partial<TextData>) => void;
  setEmailData: (data: Partial<EmailData>) => void;
  setPhoneData: (data: Partial<PhoneData>) => void;
  setSmsData: (data: Partial<SMSData>) => void;
  setWifiData: (data: Partial<WiFiData>) => void;
  setVcardData: (data: Partial<VCardData>) => void;
  setEventData: (data: Partial<EventData>) => void;
  setLocationData: (data: Partial<LocationData>) => void;

  // Style options
  styleOptions: QRStyleOptions;
  setStyleOptions: (options: Partial<QRStyleOptions>) => void;

  // Batch update actions
  restoreFromHistory: (entry: HistoryEntry) => void;
  applyPreset: (preset: Partial<QRStyleOptions>) => void;
  resetToDefaults: () => void;

  // Get current QR data
  getCurrentData: () => QRData;
  getQRValue: () => string;
}

const defaultStyleOptions: QRStyleOptions = {
  dotsColor: '#000000',
  backgroundColor: '#ffffff',
  dotsType: 'square',
  cornersSquareType: 'square',
  cornersDotType: 'square',
  errorCorrectionLevel: 'H', // Always use high (30%) for best logo support
};

export const useQRStore = create<QRStore>((set, get) => ({
  activeType: 'url',
  setActiveType: (type) => set({ activeType: type }),

  // Default data values
  urlData: { url: '', useShortened: false },
  textData: { text: '' },
  emailData: { email: '' },
  phoneData: { phone: '' },
  smsData: { phone: '' },
  wifiData: { ssid: '', encryption: 'WPA' },
  vcardData: { firstName: '', lastName: '' },
  eventData: { title: '', startDate: '' },
  locationData: { latitude: '', longitude: '' },

  // Update functions
  setUrlData: (data) => set((state) => ({ urlData: { ...state.urlData, ...data } })),
  setTextData: (data) => set((state) => ({ textData: { ...state.textData, ...data } })),
  setEmailData: (data) => set((state) => ({ emailData: { ...state.emailData, ...data } })),
  setPhoneData: (data) => set((state) => ({ phoneData: { ...state.phoneData, ...data } })),
  setSmsData: (data) => set((state) => ({ smsData: { ...state.smsData, ...data } })),
  setWifiData: (data) => set((state) => ({ wifiData: { ...state.wifiData, ...data } })),
  setVcardData: (data) => set((state) => ({ vcardData: { ...state.vcardData, ...data } })),
  setEventData: (data) => set((state) => ({ eventData: { ...state.eventData, ...data } })),
  setLocationData: (data) => set((state) => ({ locationData: { ...state.locationData, ...data } })),

  // Style options
  styleOptions: defaultStyleOptions,
  setStyleOptions: (options) =>
    set((state) => ({ styleOptions: { ...state.styleOptions, ...options } })),

  // Batch update actions - restore from history entry in a single update
  restoreFromHistory: (entry) => {
    const updates: Partial<{
      activeType: QRCodeType;
      urlData: URLData;
      textData: TextData;
      emailData: EmailData;
      phoneData: PhoneData;
      smsData: SMSData;
      wifiData: WiFiData;
      vcardData: VCardData;
      eventData: EventData;
      locationData: LocationData;
      styleOptions: QRStyleOptions;
    }> = {
      activeType: entry.type,
      styleOptions: entry.styleOptions,
    };

    // Set the correct data based on type
    switch (entry.data.type) {
      case 'url':
        updates.urlData = entry.data.data;
        break;
      case 'text':
        updates.textData = entry.data.data;
        break;
      case 'email':
        updates.emailData = entry.data.data;
        break;
      case 'phone':
        updates.phoneData = entry.data.data;
        break;
      case 'sms':
        updates.smsData = entry.data.data;
        break;
      case 'wifi':
        updates.wifiData = entry.data.data;
        break;
      case 'vcard':
        updates.vcardData = entry.data.data;
        break;
      case 'event':
        updates.eventData = entry.data.data;
        break;
      case 'location':
        updates.locationData = entry.data.data;
        break;
    }

    set(updates);
  },

  // Apply a style preset (e.g., from brand kits)
  applyPreset: (preset) =>
    set((state) => ({ styleOptions: { ...state.styleOptions, ...preset } })),

  // Reset to default options
  resetToDefaults: () =>
    set({ styleOptions: defaultStyleOptions }),

  // Get current data based on active type
  getCurrentData: () => {
    const state = get();
    switch (state.activeType) {
      case 'url':
        return { type: 'url' as const, data: state.urlData };
      case 'text':
        return { type: 'text' as const, data: state.textData };
      case 'email':
        return { type: 'email' as const, data: state.emailData };
      case 'phone':
        return { type: 'phone' as const, data: state.phoneData };
      case 'sms':
        return { type: 'sms' as const, data: state.smsData };
      case 'wifi':
        return { type: 'wifi' as const, data: state.wifiData };
      case 'vcard':
        return { type: 'vcard' as const, data: state.vcardData };
      case 'event':
        return { type: 'event' as const, data: state.eventData };
      case 'location':
        return { type: 'location' as const, data: state.locationData };
    }
  },

  // Generate QR value string
  getQRValue: () => {
    const state = get();
    switch (state.activeType) {
      case 'url': {
        const url = state.urlData.useShortened && state.urlData.shortened
          ? state.urlData.shortened
          : state.urlData.url;
        return url || 'https://example.com';
      }
      case 'text':
        return state.textData.text || 'Hello World';
      case 'email': {
        const { email, subject, body } = state.emailData;
        if (!email) return 'mailto:example@example.com';
        let mailto = `mailto:${email}`;
        const params: string[] = [];
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        if (params.length) mailto += `?${params.join('&')}`;
        return mailto;
      }
      case 'phone':
        return `tel:${state.phoneData.phone || '+1234567890'}`;
      case 'sms': {
        const { phone, message } = state.smsData;
        let sms = `sms:${phone || '+1234567890'}`;
        if (message) sms += `?body=${encodeURIComponent(message)}`;
        return sms;
      }
      case 'wifi': {
        const { ssid, password, encryption, hidden } = state.wifiData;
        if (!ssid) return 'WIFI:S:MyNetwork;T:WPA;P:password;;';
        let wifi = `WIFI:S:${escapeWiFi(ssid)};T:${encryption};`;
        if (password && encryption !== 'nopass') wifi += `P:${escapeWiFi(password)};`;
        if (hidden) wifi += 'H:true;';
        wifi += ';';
        return wifi;
      }
      case 'vcard': {
        const v = state.vcardData;
        if (!v.firstName && !v.lastName) return 'BEGIN:VCARD\nVERSION:3.0\nN:Doe;John\nFN:John Doe\nEND:VCARD';
        let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
        vcard += `N:${escapeVCard(v.lastName)};${escapeVCard(v.firstName)}\n`;
        vcard += `FN:${escapeVCard(v.firstName)} ${escapeVCard(v.lastName)}\n`;
        if (v.organization) vcard += `ORG:${escapeVCard(v.organization)}\n`;
        if (v.title) vcard += `TITLE:${escapeVCard(v.title)}\n`;
        if (v.phone) vcard += `TEL:${escapeVCard(v.phone)}\n`;
        if (v.email) vcard += `EMAIL:${escapeVCard(v.email)}\n`;
        if (v.website) vcard += `URL:${escapeVCard(v.website)}\n`;
        if (v.address) vcard += `ADR:;;${escapeVCard(v.address)};;;;\n`;
        if (v.note) vcard += `NOTE:${escapeVCard(v.note)}\n`;
        vcard += 'END:VCARD';
        return vcard;
      }
      case 'event': {
        const e = state.eventData;
        if (!e.title) return 'BEGIN:VEVENT\nSUMMARY:Event\nDTSTART:20250101T090000\nEND:VEVENT';
        const formatDate = (date: string, time?: string) => {
          const d = date.replace(/-/g, '');
          const t = time ? time.replace(/:/g, '') + '00' : '000000';
          return d + 'T' + t;
        };
        let vevent = 'BEGIN:VEVENT\n';
        vevent += `SUMMARY:${escapeICalendar(e.title)}\n`;
        if (e.location) vevent += `LOCATION:${escapeICalendar(e.location)}\n`;
        if (e.startDate) vevent += `DTSTART:${formatDate(e.startDate, e.startTime)}\n`;
        if (e.endDate) vevent += `DTEND:${formatDate(e.endDate, e.endTime)}\n`;
        if (e.description) vevent += `DESCRIPTION:${escapeICalendar(e.description)}\n`;
        vevent += 'END:VEVENT';
        return vevent;
      }
      case 'location': {
        const { latitude, longitude } = state.locationData;
        if (!latitude || !longitude) return 'geo:40.7128,-74.0060';
        return `geo:${latitude},${longitude}`;
      }
      default:
        return 'https://example.com';
    }
  },
}));
