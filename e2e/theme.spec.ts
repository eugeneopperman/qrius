import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'cookie-consent',
      JSON.stringify({ status: 'accepted', timestamp: Date.now(), analytics: false }),
    );
  });
});

test.describe('Theme toggle', () => {
  test('toggle switches between light and dark', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const themeBtn = page.getByRole('button', { name: /toggle theme/i });

    const wasDark = await html.evaluate((el) => el.classList.contains('dark'));
    await themeBtn.click();
    const isDark = await html.evaluate((el) => el.classList.contains('dark'));
    expect(isDark).not.toBe(wasDark);
  });

  test('persists across navigation', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const themeBtn = page.getByRole('button', { name: /toggle theme/i });

    // Ensure dark mode is on
    const wasDark = await html.evaluate((el) => el.classList.contains('dark'));
    if (!wasDark) await themeBtn.click();
    expect(await html.evaluate((el) => el.classList.contains('dark'))).toBe(true);

    // Navigate to sign-in page
    await page.goto('/signin');
    expect(await html.evaluate((el) => el.classList.contains('dark'))).toBe(true);
  });

  test('persists after reload', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const themeBtn = page.getByRole('button', { name: /toggle theme/i });

    // Ensure dark mode is on
    const wasDark = await html.evaluate((el) => el.classList.contains('dark'));
    if (!wasDark) await themeBtn.click();
    expect(await html.evaluate((el) => el.classList.contains('dark'))).toBe(true);

    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    expect(await html.evaluate((el) => el.classList.contains('dark'))).toBe(true);
  });

  test('works on sign-in page', async ({ page }) => {
    await page.goto('/signin');
    const html = page.locator('html');
    const themeBtn = page.getByRole('button', { name: /toggle theme/i });

    const wasDark = await html.evaluate((el) => el.classList.contains('dark'));
    await themeBtn.click();
    const isDark = await html.evaluate((el) => el.classList.contains('dark'));
    expect(isDark).not.toBe(wasDark);
  });
});
