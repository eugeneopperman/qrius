import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to test module-level constants, so we re-import for each scenario
// by resetting the module registry.

describe('domain utility', () => {
  const originalLocation = window.location;

  function mockLocation(hostname: string, protocol = 'https:') {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, hostname, protocol, pathname: '/', search: '' },
      writable: true,
      configurable: true,
    });
  }

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  describe('when VITE_BASE_DOMAIN is not set (local dev)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_BASE_DOMAIN', '');
      mockLocation('localhost');
    });

    it('hasRealDomain is false', async () => {
      const mod = await import('../domain');
      expect(mod.hasRealDomain).toBe(false);
    });

    it('isLocalDev is true', async () => {
      const mod = await import('../domain');
      expect(mod.isLocalDev).toBe(true);
    });

    it('isAppSubdomain is false', async () => {
      const mod = await import('../domain');
      expect(mod.isAppSubdomain).toBe(false);
    });

    it('isRootDomain is false', async () => {
      const mod = await import('../domain');
      expect(mod.isRootDomain).toBe(false);
    });

    it('getRootUrl returns a same-origin path', async () => {
      const mod = await import('../domain');
      expect(mod.getRootUrl('/signin')).toBe('/signin');
    });

    it('getAppUrl returns a same-origin path', async () => {
      const mod = await import('../domain');
      expect(mod.getAppUrl('/dashboard')).toBe('/dashboard');
    });

    it('getCookieDomain returns null', async () => {
      const mod = await import('../domain');
      expect(mod.getCookieDomain()).toBeNull();
    });
  });

  describe('when on root domain (qrius.app)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_BASE_DOMAIN', 'qrius.app');
      mockLocation('qrius.app');
    });

    it('hasRealDomain is true', async () => {
      const mod = await import('../domain');
      expect(mod.hasRealDomain).toBe(true);
    });

    it('isLocalDev is false', async () => {
      const mod = await import('../domain');
      expect(mod.isLocalDev).toBe(false);
    });

    it('isRootDomain is true', async () => {
      const mod = await import('../domain');
      expect(mod.isRootDomain).toBe(true);
    });

    it('isAppSubdomain is false', async () => {
      const mod = await import('../domain');
      expect(mod.isAppSubdomain).toBe(false);
    });

    it('getRootUrl builds absolute root URL', async () => {
      const mod = await import('../domain');
      expect(mod.getRootUrl('/signin')).toBe('https://qrius.app/signin');
    });

    it('getAppUrl builds absolute app subdomain URL', async () => {
      const mod = await import('../domain');
      expect(mod.getAppUrl('/dashboard')).toBe('https://app.qrius.app/dashboard');
    });

    it('getCookieDomain returns parent domain', async () => {
      const mod = await import('../domain');
      expect(mod.getCookieDomain()).toBe('.qrius.app');
    });
  });

  describe('when on app subdomain (app.qrius.app)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_BASE_DOMAIN', 'qrius.app');
      mockLocation('app.qrius.app');
    });

    it('isAppSubdomain is true', async () => {
      const mod = await import('../domain');
      expect(mod.isAppSubdomain).toBe(true);
    });

    it('isRootDomain is false', async () => {
      const mod = await import('../domain');
      expect(mod.isRootDomain).toBe(false);
    });

    it('getRootUrl returns root domain URL', async () => {
      const mod = await import('../domain');
      expect(mod.getRootUrl('/')).toBe('https://qrius.app/');
    });

    it('getAppUrl returns app subdomain URL', async () => {
      const mod = await import('../domain');
      expect(mod.getAppUrl('/settings')).toBe('https://app.qrius.app/settings');
    });
  });
});
