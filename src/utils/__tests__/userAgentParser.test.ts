import { describe, it, expect } from 'vitest';
import { parseUserAgent } from '../../../api/_lib/userAgentParser';

describe('parseUserAgent', () => {
  describe('browser detection', () => {
    it('detects Chrome', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      expect(parseUserAgent(ua).browser).toBe('Chrome');
    });

    it('detects Safari', () => {
      const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15';
      expect(parseUserAgent(ua).browser).toBe('Safari');
    });

    it('detects Firefox', () => {
      const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0';
      expect(parseUserAgent(ua).browser).toBe('Firefox');
    });

    it('detects Edge (Chromium)', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
      expect(parseUserAgent(ua).browser).toBe('Edge');
    });

    it('detects Samsung Internet', () => {
      const ua = 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36';
      expect(parseUserAgent(ua).browser).toBe('Samsung Internet');
    });

    it('detects Opera', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0';
      expect(parseUserAgent(ua).browser).toBe('Opera');
    });

    it('detects Internet Explorer', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko';
      expect(parseUserAgent(ua).browser).toBe('Internet Explorer');
    });

    it('returns Unknown for null UA', () => {
      expect(parseUserAgent(null).browser).toBe('Unknown');
    });

    it('returns Other for unknown browser', () => {
      expect(parseUserAgent('SomeRandomBot/1.0').browser).toBe('Other');
    });
  });

  describe('OS detection', () => {
    it('detects iOS (iPhone)', () => {
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
      expect(parseUserAgent(ua).os).toBe('iOS');
    });

    it('detects iOS (iPad)', () => {
      const ua = 'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
      expect(parseUserAgent(ua).os).toBe('iOS');
    });

    it('detects Android', () => {
      const ua = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
      expect(parseUserAgent(ua).os).toBe('Android');
    });

    it('detects Windows', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      expect(parseUserAgent(ua).os).toBe('Windows');
    });

    it('detects macOS', () => {
      const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15';
      expect(parseUserAgent(ua).os).toBe('macOS');
    });

    it('detects Linux', () => {
      const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0';
      expect(parseUserAgent(ua).os).toBe('Linux');
    });

    it('detects Chrome OS', () => {
      const ua = 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      expect(parseUserAgent(ua).os).toBe('Chrome OS');
    });

    it('returns Unknown for null UA', () => {
      expect(parseUserAgent(null).os).toBe('Unknown');
    });

    it('returns Other for unknown OS', () => {
      expect(parseUserAgent('SomeRandomBot/1.0').os).toBe('Other');
    });
  });
});
