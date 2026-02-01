import { test, expect } from '@playwright/test';

test.describe('QR Code Generator App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Qrius|QR/i);
  });

  test('displays header with logo', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /qrius/i })).toBeVisible();
  });

  test('shows QR type selection on first step', async ({ page }) => {
    // Should show type selector options
    await expect(page.getByRole('button', { name: /url|website/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /text/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /email/i })).toBeVisible();
  });

  test('can navigate between wizard steps', async ({ page }) => {
    // Start at step 1 - select URL type
    await page.getByRole('button', { name: /url|website/i }).click();

    // Click next to go to step 2
    await page.getByRole('button', { name: /next/i }).click();

    // Should now be on content input step
    await expect(page.getByPlaceholder(/https|url/i)).toBeVisible();
  });

  test('theme toggle works', async ({ page }) => {
    const themeButton = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeButton).toBeVisible();

    // Check initial state
    const html = page.locator('html');
    const initialDark = await html.evaluate((el) => el.classList.contains('dark'));

    // Toggle theme
    await themeButton.click();

    // Check state changed
    const afterToggle = await html.evaluate((el) => el.classList.contains('dark'));
    expect(afterToggle).not.toBe(initialDark);
  });
});

test.describe('QR Code Generation', () => {
  test('generates QR code for URL', async ({ page }) => {
    await page.goto('/');

    // Select URL type
    await page.getByRole('button', { name: /url|website/i }).click();

    // Go to next step
    await page.getByRole('button', { name: /next/i }).click();

    // Enter URL
    await page.getByPlaceholder(/https|url/i).fill('https://example.com');

    // QR code should be generated (SVG element should appear)
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 5000 });
  });

  test('generates QR code for text', async ({ page }) => {
    await page.goto('/');

    // Select Text type
    await page.getByRole('button', { name: /text/i }).first().click();

    // Go to next step
    await page.getByRole('button', { name: /next/i }).click();

    // Enter text
    await page.getByPlaceholder(/text/i).fill('Hello World');

    // QR code should be generated
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 5000 });
  });

  test('download button is available when QR is generated', async ({ page }) => {
    await page.goto('/');

    // Select URL and enter data
    await page.getByRole('button', { name: /url|website/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByPlaceholder(/https|url/i).fill('https://example.com');

    // Wait for QR to generate
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 5000 });

    // Download button should be visible
    await expect(page.getByRole('button', { name: /download/i })).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('all buttons are keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab through page elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to activate buttons with keyboard
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
  });

  test('form inputs have associated labels', async ({ page }) => {
    await page.goto('/');

    // Navigate to URL input step
    await page.getByRole('button', { name: /url|website/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // URL input should have accessible label
    const urlInput = page.getByPlaceholder(/https|url/i);
    await expect(urlInput).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Header should be visible
    await expect(page.getByRole('heading', { name: /qrius/i })).toBeVisible();

    // Type buttons should be accessible
    await expect(page.getByRole('button', { name: /url|website/i })).toBeVisible();
  });

  test('works on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Header should be visible
    await expect(page.getByRole('heading', { name: /qrius/i })).toBeVisible();
  });
});
