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
  errorCorrectionLevel: 'M',
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
        let wifi = `WIFI:S:${ssid};T:${encryption};`;
        if (password && encryption !== 'nopass') wifi += `P:${password};`;
        if (hidden) wifi += 'H:true;';
        wifi += ';';
        return wifi;
      }
      case 'vcard': {
        const v = state.vcardData;
        if (!v.firstName && !v.lastName) return 'BEGIN:VCARD\nVERSION:3.0\nN:Doe;John\nFN:John Doe\nEND:VCARD';
        let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
        vcard += `N:${v.lastName || ''};${v.firstName || ''}\n`;
        vcard += `FN:${v.firstName || ''} ${v.lastName || ''}\n`;
        if (v.organization) vcard += `ORG:${v.organization}\n`;
        if (v.title) vcard += `TITLE:${v.title}\n`;
        if (v.phone) vcard += `TEL:${v.phone}\n`;
        if (v.email) vcard += `EMAIL:${v.email}\n`;
        if (v.website) vcard += `URL:${v.website}\n`;
        if (v.address) vcard += `ADR:;;${v.address};;;;\n`;
        if (v.note) vcard += `NOTE:${v.note}\n`;
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
        vevent += `SUMMARY:${e.title}\n`;
        if (e.location) vevent += `LOCATION:${e.location}\n`;
        if (e.startDate) vevent += `DTSTART:${formatDate(e.startDate, e.startTime)}\n`;
        if (e.endDate) vevent += `DTEND:${formatDate(e.endDate, e.endTime)}\n`;
        if (e.description) vevent += `DESCRIPTION:${e.description}\n`;
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
