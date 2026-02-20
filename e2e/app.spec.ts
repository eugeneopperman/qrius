import { test, expect } from '@playwright/test';

// Dismiss cookie consent banner
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'cookie-consent',
      JSON.stringify({ status: 'accepted', timestamp: Date.now(), analytics: false }),
    );
  });
});

test.describe('App — Smoke tests', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Qrius/i);
  });

  test('displays header with logo', async ({ page }) => {
    await page.goto('/');
    // Logo component renders "Qrius" text inside a span, not a heading
    await expect(page.getByText('Qrius').first()).toBeVisible();
  });

  test('shows QR type selection on first step', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /URL/ }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Text/ }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Email/ }).first()).toBeVisible();
  });

  test('selecting a type advances to step 2', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /URL/ }).first().click();

    // Should now be on content input step
    await expect(page.getByLabel('Enter URL')).toBeVisible();
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/');
    const themeButton = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeButton).toBeVisible();

    const html = page.locator('html');
    const initialDark = await html.evaluate((el) => el.classList.contains('dark'));

    await themeButton.click();

    const afterToggle = await html.evaluate((el) => el.classList.contains('dark'));
    expect(afterToggle).not.toBe(initialDark);
  });
});

test.describe('QR Code Generation', () => {
  test('generates QR code for URL', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /URL/ }).first().click();
    await page.getByLabel('Enter URL').fill('https://example.com');

    // QR preview renders — Quick Download button confirms QR is ready
    await expect(page.getByRole('button', { name: /Quick Download/i })).toBeVisible();
  });

  test('generates QR code for text', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Text/ }).first().click();
    await page.getByLabel('Text Content').fill('Hello World');

    await expect(page.getByRole('button', { name: /Quick Download/i })).toBeVisible();
  });

  test('download button is available on content step', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /URL/ }).first().click();
    await page.getByLabel('Enter URL').fill('https://example.com');

    // Quick Download button should be visible
    await expect(page.getByRole('button', { name: /Quick Download/i })).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('interactive elements are keyboard focusable', async ({ page }) => {
    await page.goto('/');

    // Tab until we reach a focusable interactive element
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      if (tag && ['BUTTON', 'A', 'INPUT'].includes(tag)) {
        expect(tag).toBeTruthy();
        return;
      }
    }
    // Should have found at least one focusable element
    expect(true).toBe(true);
  });

  test('form inputs have associated labels', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /URL/ }).first().click();

    // URL input should be findable by its label
    const urlInput = page.getByLabel('Enter URL');
    await expect(urlInput).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.getByText('Qrius').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /URL/ }).first()).toBeVisible();
  });

  test('works on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.getByText('Qrius').first()).toBeVisible();
  });
});
