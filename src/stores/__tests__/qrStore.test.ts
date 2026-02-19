import { describe, it, expect, beforeEach } from 'vitest';
import { useQRStore, escapeVCard, escapeWiFi, escapeICalendar } from '../qrStore';

const defaultStyleOptions = {
  dotsColor: '#000000',
  backgroundColor: '#ffffff',
  dotsType: 'square' as const,
  cornersSquareType: 'square' as const,
  cornersDotType: 'square' as const,
  errorCorrectionLevel: 'H' as const,
};

describe('qrStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useQRStore.setState({
      activeType: 'url',
      urlData: { url: '', useShortened: false },
      textData: { text: '' },
      emailData: { email: '' },
      phoneData: { phone: '' },
      smsData: { phone: '' },
      wifiData: { ssid: '', encryption: 'WPA' },
      vcardData: { firstName: '', lastName: '' },
      eventData: { title: '', startDate: '' },
      locationData: { latitude: '', longitude: '' },
      styleOptions: { ...defaultStyleOptions },
    });
  });

  describe('initial state', () => {
    it('defaults activeType to url', () => {
      expect(useQRStore.getState().activeType).toBe('url');
    });

    it('has empty url data with useShortened false', () => {
      const { urlData } = useQRStore.getState();
      expect(urlData).toEqual({ url: '', useShortened: false });
    });

    it('has empty text data', () => {
      expect(useQRStore.getState().textData).toEqual({ text: '' });
    });

    it('has empty email data', () => {
      expect(useQRStore.getState().emailData).toEqual({ email: '' });
    });

    it('has empty phone data', () => {
      expect(useQRStore.getState().phoneData).toEqual({ phone: '' });
    });

    it('has empty sms data', () => {
      expect(useQRStore.getState().smsData).toEqual({ phone: '' });
    });

    it('has wifi data with WPA encryption default', () => {
      expect(useQRStore.getState().wifiData).toEqual({ ssid: '', encryption: 'WPA' });
    });

    it('has empty vcard data', () => {
      expect(useQRStore.getState().vcardData).toEqual({ firstName: '', lastName: '' });
    });

    it('has empty event data', () => {
      expect(useQRStore.getState().eventData).toEqual({ title: '', startDate: '' });
    });

    it('has empty location data', () => {
      expect(useQRStore.getState().locationData).toEqual({ latitude: '', longitude: '' });
    });

    it('has default style options with high error correction', () => {
      expect(useQRStore.getState().styleOptions).toEqual(defaultStyleOptions);
    });
  });

  describe('setActiveType', () => {
    it('changes the active QR type', () => {
      useQRStore.getState().setActiveType('text');
      expect(useQRStore.getState().activeType).toBe('text');
    });

    it('can set to each valid type', () => {
      const types = ['url', 'text', 'email', 'phone', 'sms', 'wifi', 'vcard', 'event', 'location'] as const;
      for (const type of types) {
        useQRStore.getState().setActiveType(type);
        expect(useQRStore.getState().activeType).toBe(type);
      }
    });
  });

  describe('data update functions', () => {
    it('setUrlData merges partial url data', () => {
      useQRStore.getState().setUrlData({ url: 'https://example.com' });
      expect(useQRStore.getState().urlData).toEqual({
        url: 'https://example.com',
        useShortened: false,
      });
    });

    it('setUrlData preserves existing fields when merging', () => {
      useQRStore.getState().setUrlData({ url: 'https://example.com' });
      useQRStore.getState().setUrlData({ useShortened: true });
      expect(useQRStore.getState().urlData).toEqual({
        url: 'https://example.com',
        useShortened: true,
      });
    });

    it('setUrlData sets shortened url field', () => {
      useQRStore.getState().setUrlData({
        url: 'https://example.com/long-path',
        shortened: 'https://tinyurl.com/abc',
        useShortened: true,
      });
      expect(useQRStore.getState().urlData.shortened).toBe('https://tinyurl.com/abc');
      expect(useQRStore.getState().urlData.useShortened).toBe(true);
    });

    it('setTextData merges partial text data', () => {
      useQRStore.getState().setTextData({ text: 'Hello World' });
      expect(useQRStore.getState().textData).toEqual({ text: 'Hello World' });
    });

    it('setEmailData merges partial email data', () => {
      useQRStore.getState().setEmailData({ email: 'test@test.com' });
      expect(useQRStore.getState().emailData).toEqual({ email: 'test@test.com' });
    });

    it('setEmailData preserves existing fields when adding subject', () => {
      useQRStore.getState().setEmailData({ email: 'test@test.com' });
      useQRStore.getState().setEmailData({ subject: 'Hello' });
      expect(useQRStore.getState().emailData).toEqual({
        email: 'test@test.com',
        subject: 'Hello',
      });
    });

    it('setPhoneData merges partial phone data', () => {
      useQRStore.getState().setPhoneData({ phone: '+1555123456' });
      expect(useQRStore.getState().phoneData).toEqual({ phone: '+1555123456' });
    });

    it('setSmsData merges partial sms data', () => {
      useQRStore.getState().setSmsData({ phone: '+1555123456' });
      expect(useQRStore.getState().smsData).toEqual({ phone: '+1555123456' });
    });

    it('setSmsData preserves phone when adding message', () => {
      useQRStore.getState().setSmsData({ phone: '+1555123456' });
      useQRStore.getState().setSmsData({ message: 'Hi there' });
      expect(useQRStore.getState().smsData).toEqual({
        phone: '+1555123456',
        message: 'Hi there',
      });
    });

    it('setWifiData merges partial wifi data', () => {
      useQRStore.getState().setWifiData({ ssid: 'MyNetwork' });
      expect(useQRStore.getState().wifiData).toEqual({
        ssid: 'MyNetwork',
        encryption: 'WPA',
      });
    });

    it('setWifiData preserves ssid when changing encryption', () => {
      useQRStore.getState().setWifiData({ ssid: 'MyNetwork', password: 'secret' });
      useQRStore.getState().setWifiData({ encryption: 'WEP' });
      expect(useQRStore.getState().wifiData).toEqual({
        ssid: 'MyNetwork',
        password: 'secret',
        encryption: 'WEP',
      });
    });

    it('setVcardData merges partial vcard data', () => {
      useQRStore.getState().setVcardData({ firstName: 'John' });
      expect(useQRStore.getState().vcardData).toEqual({
        firstName: 'John',
        lastName: '',
      });
    });

    it('setVcardData preserves firstName when adding lastName', () => {
      useQRStore.getState().setVcardData({ firstName: 'John' });
      useQRStore.getState().setVcardData({ lastName: 'Doe' });
      expect(useQRStore.getState().vcardData).toEqual({
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('setEventData merges partial event data', () => {
      useQRStore.getState().setEventData({ title: 'Meeting' });
      expect(useQRStore.getState().eventData).toEqual({
        title: 'Meeting',
        startDate: '',
      });
    });

    it('setLocationData merges partial location data', () => {
      useQRStore.getState().setLocationData({ latitude: '40.7128' });
      expect(useQRStore.getState().locationData).toEqual({
        latitude: '40.7128',
        longitude: '',
      });
    });
  });

  describe('setStyleOptions', () => {
    it('merges partial style options', () => {
      useQRStore.getState().setStyleOptions({ dotsColor: '#ff0000' });
      const style = useQRStore.getState().styleOptions;
      expect(style.dotsColor).toBe('#ff0000');
      expect(style.backgroundColor).toBe('#ffffff');
      expect(style.dotsType).toBe('square');
    });

    it('can set multiple style properties at once', () => {
      useQRStore.getState().setStyleOptions({
        dotsColor: '#ff0000',
        backgroundColor: '#0000ff',
        dotsType: 'dots',
      });
      const style = useQRStore.getState().styleOptions;
      expect(style.dotsColor).toBe('#ff0000');
      expect(style.backgroundColor).toBe('#0000ff');
      expect(style.dotsType).toBe('dots');
      expect(style.cornersSquareType).toBe('square');
    });

    it('can set optional style properties like logoUrl', () => {
      useQRStore.getState().setStyleOptions({ logoUrl: 'https://logo.png' });
      expect(useQRStore.getState().styleOptions.logoUrl).toBe('https://logo.png');
    });

    it('can set frame properties', () => {
      useQRStore.getState().setStyleOptions({
        frameStyle: 'bottom-label',
        frameLabel: 'Scan Me',
        frameColor: '#333333',
      });
      const style = useQRStore.getState().styleOptions;
      expect(style.frameStyle).toBe('bottom-label');
      expect(style.frameLabel).toBe('Scan Me');
      expect(style.frameColor).toBe('#333333');
    });
  });

  describe('resetToDefaults', () => {
    it('resets style options to default values', () => {
      useQRStore.getState().setStyleOptions({
        dotsColor: '#ff0000',
        backgroundColor: '#0000ff',
        dotsType: 'dots',
        logoUrl: 'https://logo.png',
        frameStyle: 'rounded',
      });

      useQRStore.getState().resetToDefaults();

      expect(useQRStore.getState().styleOptions).toEqual(defaultStyleOptions);
    });

    it('does not reset data or activeType', () => {
      useQRStore.getState().setActiveType('text');
      useQRStore.getState().setTextData({ text: 'Hello' });
      useQRStore.getState().setStyleOptions({ dotsColor: '#ff0000' });

      useQRStore.getState().resetToDefaults();

      expect(useQRStore.getState().activeType).toBe('text');
      expect(useQRStore.getState().textData.text).toBe('Hello');
      expect(useQRStore.getState().styleOptions).toEqual(defaultStyleOptions);
    });
  });

  describe('applyPreset', () => {
    it('merges preset into existing style options', () => {
      useQRStore.getState().setStyleOptions({ dotsColor: '#111111' });

      useQRStore.getState().applyPreset({
        backgroundColor: '#eeeeee',
        dotsType: 'rounded',
      });

      const style = useQRStore.getState().styleOptions;
      expect(style.dotsColor).toBe('#111111');
      expect(style.backgroundColor).toBe('#eeeeee');
      expect(style.dotsType).toBe('rounded');
    });

    it('overwrites overlapping fields from preset', () => {
      useQRStore.getState().setStyleOptions({ dotsColor: '#111111' });

      useQRStore.getState().applyPreset({ dotsColor: '#222222' });

      expect(useQRStore.getState().styleOptions.dotsColor).toBe('#222222');
    });
  });

  describe('restoreFromHistory', () => {
    it('restores url type entry', () => {
      const entry = {
        type: 'url' as const,
        data: { type: 'url' as const, data: { url: 'https://restored.com', useShortened: false } },
        styleOptions: { ...defaultStyleOptions, dotsColor: '#aabbcc' },
      };

      useQRStore.getState().restoreFromHistory(entry);

      expect(useQRStore.getState().activeType).toBe('url');
      expect(useQRStore.getState().urlData.url).toBe('https://restored.com');
      expect(useQRStore.getState().styleOptions.dotsColor).toBe('#aabbcc');
    });

    it('restores text type entry', () => {
      const entry = {
        type: 'text' as const,
        data: { type: 'text' as const, data: { text: 'Restored text' } },
        styleOptions: { ...defaultStyleOptions },
      };

      useQRStore.getState().restoreFromHistory(entry);

      expect(useQRStore.getState().activeType).toBe('text');
      expect(useQRStore.getState().textData.text).toBe('Restored text');
    });

    it('restores email type entry', () => {
      const entry = {
        type: 'email' as const,
        data: { type: 'email' as const, data: { email: 'a@b.com', subject: 'Hi' } },
        styleOptions: { ...defaultStyleOptions },
      };

      useQRStore.getState().restoreFromHistory(entry);

      expect(useQRStore.getState().activeType).toBe('email');
      expect(useQRStore.getState().emailData.email).toBe('a@b.com');
      expect(useQRStore.getState().emailData.subject).toBe('Hi');
    });

    it('restores phone type entry', () => {
      const entry = {
        type: 'phone' as const,
        data: { type: 'phone' as const, data: { phone: '+1234' } },
        styleOptions: { ...defaultStyleOptions },
      };

      useQRStore.getState().restoreFromHistory(entry);

      expect(useQRStore.getState().activeType).toBe('phone');
      expect(useQRStore.getState().phoneData.phone).toBe('+1234');
    });

    it('restores sms type entry', () => {
      const entry = {
        type: 'sms' as const,
        data: { type: 'sms' as const, data: { phone: '+5678', message: 'Hi' } },
        styleOptions: { ...defaultStyleOptions },
      };

      useQRStore.getState().restoreFromHistory(entry);

      expect(useQRStore.getState().activeType).toBe('sms');
      expect(useQRStore.getState().smsData.phone).toBe('+5678');
      expect(useQRStore.getState().smsData.message).toBe('Hi');
    });

    it('restores wifi type entry', () => {
      const entry = {
        type: 'wifi' as const,
        data: { type: 'wifi' as const, data: { ssid: 'Net', encryption: 'WEP' as const } },
        styleOptions: { ...defaultStyleOptions },
      };

      useQRStore.getState().restoreFromHistory(entry);

      expect(useQRStore.getState().activeType).toBe('wifi');
      expect(useQRStore.getState().wifiData.ssid).toBe('Net');
      expect(useQRStore.getState().wifiData.encryption).toBe('WEP');
    });

    it('restores vcard type entry', () => {
      const entry = {
        type: 'vcard' as const,
        data: { type: 'vcard' as const, data: { firstName: 'Jane', lastName: 'Smith' } },
        styleOptions: { ...defaultStyleOptions },
      };

      useQRStore.getState().restoreFromHistory(entry);

      expect(useQRStore.getState().activeType).toBe('vcard');
      expect(useQRStore.getState().vcardData.firstName).toBe('Jane');
      expect(useQRStore.getState().vcardData.lastName).toBe('Smith');
    });

    it('restores event type entry', () => {
      const entry = {
        type: 'event' as const,
        data: { type: 'event' as const, data: { title: 'Conf', startDate: '2025-06-01' } },
        styleOptions: { ...defaultStyleOptions },
      };

      useQRStore.getState().restoreFromHistory(entry);

      expect(useQRStore.getState().activeType).toBe('event');
      expect(useQRStore.getState().eventData.title).toBe('Conf');
      expect(useQRStore.getState().eventData.startDate).toBe('2025-06-01');
    });

    it('restores location type entry', () => {
      const entry = {
        type: 'location' as const,
        data: { type: 'location' as const, data: { latitude: '51.5', longitude: '-0.12' } },
        styleOptions: { ...defaultStyleOptions },
      };

      useQRStore.getState().restoreFromHistory(entry);

      expect(useQRStore.getState().activeType).toBe('location');
      expect(useQRStore.getState().locationData.latitude).toBe('51.5');
      expect(useQRStore.getState().locationData.longitude).toBe('-0.12');
    });

    it('restores style options alongside data', () => {
      const customStyle = {
        ...defaultStyleOptions,
        dotsColor: '#ff0000',
        dotsType: 'dots' as const,
        frameStyle: 'rounded' as const,
      };
      const entry = {
        type: 'text' as const,
        data: { type: 'text' as const, data: { text: 'Styled' } },
        styleOptions: customStyle,
      };

      useQRStore.getState().restoreFromHistory(entry);

      expect(useQRStore.getState().styleOptions).toEqual(customStyle);
    });
  });

  describe('getCurrentData', () => {
    it('returns url data when activeType is url', () => {
      useQRStore.getState().setUrlData({ url: 'https://test.com' });
      const data = useQRStore.getState().getCurrentData();
      expect(data.type).toBe('url');
      expect(data.data).toEqual({ url: 'https://test.com', useShortened: false });
    });

    it('returns text data when activeType is text', () => {
      useQRStore.getState().setActiveType('text');
      useQRStore.getState().setTextData({ text: 'Hi' });
      const data = useQRStore.getState().getCurrentData();
      expect(data.type).toBe('text');
      expect(data.data).toEqual({ text: 'Hi' });
    });

    it('returns email data when activeType is email', () => {
      useQRStore.getState().setActiveType('email');
      useQRStore.getState().setEmailData({ email: 'a@b.com' });
      const data = useQRStore.getState().getCurrentData();
      expect(data.type).toBe('email');
      expect(data.data).toEqual({ email: 'a@b.com' });
    });

    it('returns phone data when activeType is phone', () => {
      useQRStore.getState().setActiveType('phone');
      useQRStore.getState().setPhoneData({ phone: '+1234' });
      const data = useQRStore.getState().getCurrentData();
      expect(data.type).toBe('phone');
      expect(data.data).toEqual({ phone: '+1234' });
    });

    it('returns sms data when activeType is sms', () => {
      useQRStore.getState().setActiveType('sms');
      useQRStore.getState().setSmsData({ phone: '+5678', message: 'Test' });
      const data = useQRStore.getState().getCurrentData();
      expect(data.type).toBe('sms');
      expect(data.data).toEqual({ phone: '+5678', message: 'Test' });
    });

    it('returns wifi data when activeType is wifi', () => {
      useQRStore.getState().setActiveType('wifi');
      useQRStore.getState().setWifiData({ ssid: 'Net', password: 'pass' });
      const data = useQRStore.getState().getCurrentData();
      expect(data.type).toBe('wifi');
      expect(data.data).toEqual({ ssid: 'Net', password: 'pass', encryption: 'WPA' });
    });

    it('returns vcard data when activeType is vcard', () => {
      useQRStore.getState().setActiveType('vcard');
      useQRStore.getState().setVcardData({ firstName: 'Alice', lastName: 'W' });
      const data = useQRStore.getState().getCurrentData();
      expect(data.type).toBe('vcard');
      expect(data.data).toEqual({ firstName: 'Alice', lastName: 'W' });
    });

    it('returns event data when activeType is event', () => {
      useQRStore.getState().setActiveType('event');
      useQRStore.getState().setEventData({ title: 'Party', startDate: '2025-12-31' });
      const data = useQRStore.getState().getCurrentData();
      expect(data.type).toBe('event');
      expect(data.data).toEqual({ title: 'Party', startDate: '2025-12-31' });
    });

    it('returns location data when activeType is location', () => {
      useQRStore.getState().setActiveType('location');
      useQRStore.getState().setLocationData({ latitude: '0', longitude: '0' });
      const data = useQRStore.getState().getCurrentData();
      expect(data.type).toBe('location');
      expect(data.data).toEqual({ latitude: '0', longitude: '0' });
    });
  });

  describe('getQRValue', () => {
    describe('URL type', () => {
      it('returns default URL when url is empty', () => {
        useQRStore.getState().setActiveType('url');
        expect(useQRStore.getState().getQRValue()).toBe('https://example.com');
      });

      it('returns the provided url', () => {
        useQRStore.getState().setActiveType('url');
        useQRStore.getState().setUrlData({ url: 'https://mysite.com' });
        expect(useQRStore.getState().getQRValue()).toBe('https://mysite.com');
      });

      it('returns shortened url when useShortened is true and shortened exists', () => {
        useQRStore.getState().setActiveType('url');
        useQRStore.getState().setUrlData({
          url: 'https://example.com/very-long-path',
          shortened: 'https://tinyurl.com/abc',
          useShortened: true,
        });
        expect(useQRStore.getState().getQRValue()).toBe('https://tinyurl.com/abc');
      });

      it('returns original url when useShortened is true but shortened is not set', () => {
        useQRStore.getState().setActiveType('url');
        useQRStore.getState().setUrlData({
          url: 'https://example.com/path',
          useShortened: true,
        });
        expect(useQRStore.getState().getQRValue()).toBe('https://example.com/path');
      });

      it('returns original url when useShortened is false even if shortened exists', () => {
        useQRStore.getState().setActiveType('url');
        useQRStore.getState().setUrlData({
          url: 'https://example.com/path',
          shortened: 'https://tinyurl.com/abc',
          useShortened: false,
        });
        expect(useQRStore.getState().getQRValue()).toBe('https://example.com/path');
      });
    });

    describe('Text type', () => {
      beforeEach(() => {
        useQRStore.getState().setActiveType('text');
      });

      it('returns default text when text is empty', () => {
        expect(useQRStore.getState().getQRValue()).toBe('Hello World');
      });

      it('returns the provided text', () => {
        useQRStore.getState().setTextData({ text: 'Custom message' });
        expect(useQRStore.getState().getQRValue()).toBe('Custom message');
      });
    });

    describe('Email type', () => {
      beforeEach(() => {
        useQRStore.getState().setActiveType('email');
      });

      it('returns default mailto when email is empty', () => {
        expect(useQRStore.getState().getQRValue()).toBe('mailto:example@example.com');
      });

      it('returns mailto with email only', () => {
        useQRStore.getState().setEmailData({ email: 'user@test.com' });
        expect(useQRStore.getState().getQRValue()).toBe('mailto:user@test.com');
      });

      it('returns mailto with subject', () => {
        useQRStore.getState().setEmailData({ email: 'user@test.com', subject: 'Hello' });
        expect(useQRStore.getState().getQRValue()).toBe('mailto:user@test.com?subject=Hello');
      });

      it('returns mailto with subject and body', () => {
        useQRStore.getState().setEmailData({
          email: 'user@test.com',
          subject: 'Hello',
          body: 'World',
        });
        expect(useQRStore.getState().getQRValue()).toBe('mailto:user@test.com?subject=Hello&body=World');
      });

      it('encodes special characters in subject and body', () => {
        useQRStore.getState().setEmailData({
          email: 'user@test.com',
          subject: 'Hello & Goodbye',
          body: 'Line 1\nLine 2',
        });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('subject=Hello%20%26%20Goodbye');
        expect(value).toContain('body=Line%201%0ALine%202');
      });

      it('returns mailto with body only (no subject)', () => {
        useQRStore.getState().setEmailData({ email: 'user@test.com', body: 'Just body' });
        expect(useQRStore.getState().getQRValue()).toBe('mailto:user@test.com?body=Just%20body');
      });
    });

    describe('Phone type', () => {
      beforeEach(() => {
        useQRStore.getState().setActiveType('phone');
      });

      it('returns default tel when phone is empty', () => {
        expect(useQRStore.getState().getQRValue()).toBe('tel:+1234567890');
      });

      it('returns tel with provided phone', () => {
        useQRStore.getState().setPhoneData({ phone: '+1555999888' });
        expect(useQRStore.getState().getQRValue()).toBe('tel:+1555999888');
      });
    });

    describe('SMS type', () => {
      beforeEach(() => {
        useQRStore.getState().setActiveType('sms');
      });

      it('returns default sms when phone is empty', () => {
        expect(useQRStore.getState().getQRValue()).toBe('sms:+1234567890');
      });

      it('returns sms with phone only', () => {
        useQRStore.getState().setSmsData({ phone: '+1555111222' });
        expect(useQRStore.getState().getQRValue()).toBe('sms:+1555111222');
      });

      it('returns sms with phone and message', () => {
        useQRStore.getState().setSmsData({ phone: '+1555111222', message: 'Hello there' });
        expect(useQRStore.getState().getQRValue()).toBe('sms:+1555111222?body=Hello%20there');
      });

      it('encodes special characters in sms message', () => {
        useQRStore.getState().setSmsData({ phone: '+1', message: 'Hi & Bye' });
        expect(useQRStore.getState().getQRValue()).toBe('sms:+1?body=Hi%20%26%20Bye');
      });
    });

    describe('WiFi type', () => {
      beforeEach(() => {
        useQRStore.getState().setActiveType('wifi');
      });

      it('returns default wifi string when ssid is empty', () => {
        expect(useQRStore.getState().getQRValue()).toBe('WIFI:S:MyNetwork;T:WPA;P:password;;');
      });

      it('returns wifi string with ssid and password (WPA)', () => {
        useQRStore.getState().setWifiData({ ssid: 'HomeNet', password: 'secret123' });
        expect(useQRStore.getState().getQRValue()).toBe('WIFI:S:HomeNet;T:WPA;P:secret123;;');
      });

      it('returns wifi string with hidden network', () => {
        useQRStore.getState().setWifiData({ ssid: 'HiddenNet', password: 'pass', hidden: true });
        expect(useQRStore.getState().getQRValue()).toBe('WIFI:S:HiddenNet;T:WPA;P:pass;H:true;;');
      });

      it('omits password when encryption is nopass', () => {
        useQRStore.getState().setWifiData({ ssid: 'OpenNet', encryption: 'nopass', password: 'ignored' });
        expect(useQRStore.getState().getQRValue()).toBe('WIFI:S:OpenNet;T:nopass;;');
      });

      it('returns wifi string with WEP encryption', () => {
        useQRStore.getState().setWifiData({ ssid: 'WepNet', password: 'wepkey', encryption: 'WEP' });
        expect(useQRStore.getState().getQRValue()).toBe('WIFI:S:WepNet;T:WEP;P:wepkey;;');
      });

      it('escapes semicolons in SSID', () => {
        useQRStore.getState().setWifiData({ ssid: 'My;Network' });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('S:My\\;Network');
      });

      it('escapes colons in SSID', () => {
        useQRStore.getState().setWifiData({ ssid: 'Net:Work' });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('S:Net\\:Work');
      });

      it('escapes backslashes in SSID', () => {
        useQRStore.getState().setWifiData({ ssid: 'Net\\Work' });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('S:Net\\\\Work');
      });

      it('escapes commas in SSID', () => {
        useQRStore.getState().setWifiData({ ssid: 'My,Network' });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('S:My\\,Network');
      });

      it('escapes special characters in password', () => {
        useQRStore.getState().setWifiData({ ssid: 'Net', password: 'p;a:s\\s,w' });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('P:p\\;a\\:s\\\\s\\,w');
      });
    });

    describe('vCard type', () => {
      beforeEach(() => {
        useQRStore.getState().setActiveType('vcard');
      });

      it('returns default vcard when names are empty', () => {
        const value = useQRStore.getState().getQRValue();
        expect(value).toBe('BEGIN:VCARD\nVERSION:3.0\nN:Doe;John\nFN:John Doe\nEND:VCARD');
      });

      it('returns vcard with first and last name', () => {
        useQRStore.getState().setVcardData({ firstName: 'Alice', lastName: 'Smith' });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('BEGIN:VCARD');
        expect(value).toContain('VERSION:3.0');
        expect(value).toContain('N:Smith;Alice');
        expect(value).toContain('FN:Alice Smith');
        expect(value).toContain('END:VCARD');
      });

      it('returns vcard with all fields populated', () => {
        useQRStore.getState().setVcardData({
          firstName: 'John',
          lastName: 'Doe',
          organization: 'Acme Inc',
          title: 'CEO',
          phone: '+1555000111',
          email: 'john@acme.com',
          website: 'https://acme.com',
          address: '123 Main St',
          note: 'Important contact',
        });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('N:Doe;John');
        expect(value).toContain('FN:John Doe');
        expect(value).toContain('ORG:Acme Inc');
        expect(value).toContain('TITLE:CEO');
        expect(value).toContain('TEL:+1555000111');
        expect(value).toContain('EMAIL:john@acme.com');
        expect(value).toContain('URL:https://acme.com');
        expect(value).toContain('ADR:;;123 Main St;;;;');
        expect(value).toContain('NOTE:Important contact');
      });

      it('omits optional fields when not provided', () => {
        useQRStore.getState().setVcardData({ firstName: 'A', lastName: 'B' });
        const value = useQRStore.getState().getQRValue();
        expect(value).not.toContain('ORG:');
        expect(value).not.toContain('TITLE:');
        expect(value).not.toContain('TEL:');
        expect(value).not.toContain('EMAIL:');
        expect(value).not.toContain('URL:');
        expect(value).not.toContain('ADR:');
        expect(value).not.toContain('NOTE:');
      });

      it('escapes semicolons in names', () => {
        useQRStore.getState().setVcardData({ firstName: 'John;Jr', lastName: 'Doe;Sr' });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('N:Doe\\;Sr;John\\;Jr');
        expect(value).toContain('FN:John\\;Jr Doe\\;Sr');
      });

      it('escapes commas in names', () => {
        useQRStore.getState().setVcardData({ firstName: 'John,Paul', lastName: 'Doe' });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('FN:John\\,Paul Doe');
      });

      it('escapes backslashes in fields', () => {
        useQRStore.getState().setVcardData({ firstName: 'John', lastName: 'O\\Brien' });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('N:O\\\\Brien;John');
      });

      it('escapes newlines in note', () => {
        useQRStore.getState().setVcardData({
          firstName: 'A',
          lastName: 'B',
          note: 'Line 1\nLine 2',
        });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('NOTE:Line 1\\nLine 2');
      });

      it('escapes multiple special characters together', () => {
        useQRStore.getState().setVcardData({
          firstName: 'A',
          lastName: 'B',
          organization: 'Org;With,Special\\Chars\nHere',
        });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('ORG:Org\\;With\\,Special\\\\Chars\\nHere');
      });

      it('handles firstName only (empty lastName)', () => {
        useQRStore.getState().setVcardData({ firstName: 'Solo', lastName: '' });
        const value = useQRStore.getState().getQRValue();
        // firstName is provided, so it won't use the default
        // The N field has lastName;firstName -- lastName is empty string
        expect(value).toContain('N:;Solo');
        expect(value).toContain('FN:Solo ');
      });

      it('handles lastName only (empty firstName)', () => {
        useQRStore.getState().setVcardData({ firstName: '', lastName: 'Only' });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('N:Only;');
        expect(value).toContain('FN: Only');
      });
    });

    describe('Event type', () => {
      beforeEach(() => {
        useQRStore.getState().setActiveType('event');
      });

      it('returns default event when title is empty', () => {
        const value = useQRStore.getState().getQRValue();
        expect(value).toBe('BEGIN:VEVENT\nSUMMARY:Event\nDTSTART:20250101T090000\nEND:VEVENT');
      });

      it('returns event with title only', () => {
        useQRStore.getState().setEventData({ title: 'My Meeting' });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('BEGIN:VEVENT');
        expect(value).toContain('SUMMARY:My Meeting');
        expect(value).toContain('END:VEVENT');
        expect(value).not.toContain('DTSTART:');
        expect(value).not.toContain('LOCATION:');
      });

      it('returns event with full data', () => {
        useQRStore.getState().setEventData({
          title: 'Conference',
          location: 'New York',
          startDate: '2025-06-15',
          startTime: '09:30',
          endDate: '2025-06-15',
          endTime: '17:00',
          description: 'Annual conference',
        });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('SUMMARY:Conference');
        expect(value).toContain('LOCATION:New York');
        expect(value).toContain('DTSTART:20250615T093000');
        expect(value).toContain('DTEND:20250615T170000');
        expect(value).toContain('DESCRIPTION:Annual conference');
      });

      it('formats date without time correctly', () => {
        useQRStore.getState().setEventData({
          title: 'All Day',
          startDate: '2025-12-25',
        });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('DTSTART:20251225T000000');
      });

      it('formats date with time correctly', () => {
        useQRStore.getState().setEventData({
          title: 'Morning',
          startDate: '2025-01-01',
          startTime: '08:15',
        });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('DTSTART:20250101T081500');
      });

      it('escapes semicolons in event title', () => {
        useQRStore.getState().setEventData({
          title: 'Meeting; Important',
          startDate: '2025-01-01',
        });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('SUMMARY:Meeting\\; Important');
      });

      it('escapes commas in event location', () => {
        useQRStore.getState().setEventData({
          title: 'Event',
          location: 'New York, NY',
          startDate: '2025-01-01',
        });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('LOCATION:New York\\, NY');
      });

      it('escapes semicolons in event description', () => {
        useQRStore.getState().setEventData({
          title: 'Event',
          startDate: '2025-01-01',
          description: 'Part 1; Part 2',
        });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('DESCRIPTION:Part 1\\; Part 2');
      });

      it('escapes backslashes in event fields', () => {
        useQRStore.getState().setEventData({
          title: 'Path\\Event',
          startDate: '2025-01-01',
        });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('SUMMARY:Path\\\\Event');
      });

      it('escapes newlines in event description', () => {
        useQRStore.getState().setEventData({
          title: 'Event',
          startDate: '2025-01-01',
          description: 'Line 1\nLine 2',
        });
        const value = useQRStore.getState().getQRValue();
        expect(value).toContain('DESCRIPTION:Line 1\\nLine 2');
      });

      it('omits optional fields when not provided', () => {
        useQRStore.getState().setEventData({
          title: 'Simple',
          startDate: '2025-03-01',
        });
        const value = useQRStore.getState().getQRValue();
        expect(value).not.toContain('LOCATION:');
        expect(value).not.toContain('DTEND:');
        expect(value).not.toContain('DESCRIPTION:');
      });
    });

    describe('Location type', () => {
      beforeEach(() => {
        useQRStore.getState().setActiveType('location');
      });

      it('returns default geo when lat/lng are empty', () => {
        expect(useQRStore.getState().getQRValue()).toBe('geo:40.7128,-74.0060');
      });

      it('returns geo with provided coordinates', () => {
        useQRStore.getState().setLocationData({ latitude: '51.5074', longitude: '-0.1278' });
        expect(useQRStore.getState().getQRValue()).toBe('geo:51.5074,-0.1278');
      });

      it('returns default when only latitude is provided', () => {
        useQRStore.getState().setLocationData({ latitude: '51.5074' });
        // longitude is still empty string from default
        expect(useQRStore.getState().getQRValue()).toBe('geo:40.7128,-74.0060');
      });

      it('returns default when only longitude is provided', () => {
        useQRStore.getState().setLocationData({ longitude: '-0.1278' });
        // latitude is still empty string from default
        expect(useQRStore.getState().getQRValue()).toBe('geo:40.7128,-74.0060');
      });

      it('handles negative coordinates', () => {
        useQRStore.getState().setLocationData({ latitude: '-33.8688', longitude: '151.2093' });
        expect(useQRStore.getState().getQRValue()).toBe('geo:-33.8688,151.2093');
      });

      it('handles zero coordinates', () => {
        useQRStore.getState().setLocationData({ latitude: '0', longitude: '0' });
        expect(useQRStore.getState().getQRValue()).toBe('geo:0,0');
      });
    });
  });
});

describe('escape functions', () => {
  describe('escapeVCard', () => {
    it('returns empty string for undefined', () => {
      expect(escapeVCard(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(escapeVCard('')).toBe('');
    });

    it('returns plain string unchanged', () => {
      expect(escapeVCard('John Doe')).toBe('John Doe');
    });

    it('escapes backslashes', () => {
      expect(escapeVCard('path\\file')).toBe('path\\\\file');
    });

    it('escapes semicolons', () => {
      expect(escapeVCard('a;b')).toBe('a\\;b');
    });

    it('escapes commas', () => {
      expect(escapeVCard('a,b')).toBe('a\\,b');
    });

    it('escapes newlines', () => {
      expect(escapeVCard('line1\nline2')).toBe('line1\\nline2');
    });

    it('escapes combined special characters', () => {
      expect(escapeVCard('a\\b;c,d\ne')).toBe('a\\\\b\\;c\\,d\\ne');
    });
  });

  describe('escapeWiFi', () => {
    it('returns empty string for undefined', () => {
      expect(escapeWiFi(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(escapeWiFi('')).toBe('');
    });

    it('returns plain string unchanged', () => {
      expect(escapeWiFi('MyNetwork')).toBe('MyNetwork');
    });

    it('escapes backslashes', () => {
      expect(escapeWiFi('net\\work')).toBe('net\\\\work');
    });

    it('escapes semicolons', () => {
      expect(escapeWiFi('a;b')).toBe('a\\;b');
    });

    it('escapes colons', () => {
      expect(escapeWiFi('a:b')).toBe('a\\:b');
    });

    it('escapes commas', () => {
      expect(escapeWiFi('a,b')).toBe('a\\,b');
    });

    it('escapes combined special characters', () => {
      expect(escapeWiFi('a\\b;c:d,e')).toBe('a\\\\b\\;c\\:d\\,e');
    });
  });

  describe('escapeICalendar', () => {
    it('returns empty string for undefined', () => {
      expect(escapeICalendar(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(escapeICalendar('')).toBe('');
    });

    it('returns plain string unchanged', () => {
      expect(escapeICalendar('Meeting')).toBe('Meeting');
    });

    it('escapes backslashes', () => {
      expect(escapeICalendar('path\\event')).toBe('path\\\\event');
    });

    it('escapes semicolons', () => {
      expect(escapeICalendar('a;b')).toBe('a\\;b');
    });

    it('escapes commas', () => {
      expect(escapeICalendar('a,b')).toBe('a\\,b');
    });

    it('escapes newlines', () => {
      expect(escapeICalendar('line1\nline2')).toBe('line1\\nline2');
    });

    it('escapes combined special characters', () => {
      expect(escapeICalendar('a\\b;c,d\ne')).toBe('a\\\\b\\;c\\,d\\ne');
    });
  });
});
