import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'cookie-consent',
      JSON.stringify({ status: 'accepted', timestamp: Date.now(), analytics: false }),
    );
  });
});

test.describe('Keyboard shortcuts', () => {
  test('? opens shortcuts dialog', async ({ page }) => {
    await page.goto('/');
    // Wait for the page to fully render and keyboard handler to attach
    await expect(
      page.getByRole('heading', { name: 'What would you like to create?' }),
    ).toBeVisible();

    await page.keyboard.press('Shift+Slash');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Keyboard Shortcuts' }),
    ).toBeVisible();
  });

  test('Escape closes shortcuts dialog', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'What would you like to create?' }),
    ).toBeVisible();

    await page.keyboard.press('Shift+Slash');
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('close button closes shortcuts dialog', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'What would you like to create?' }),
    ).toBeVisible();

    await page.keyboard.press('Shift+Slash');
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: /close keyboard shortcuts/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('Ctrl/Meta+D toggles dark mode', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(
      page.getByRole('heading', { name: 'What would you like to create?' }),
    ).toBeVisible();

    const wasDark = await html.evaluate((el) => el.classList.contains('dark'));

    // Use Meta+d on macOS, Control+d on others
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+d' : 'Control+d');

    const isDark = await html.evaluate((el) => el.classList.contains('dark'));
    expect(isDark).not.toBe(wasDark);
  });

  test('shortcuts dialog lists expected entries', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'What would you like to create?' }),
    ).toBeVisible();

    await page.keyboard.press('Shift+Slash');
    await expect(page.getByRole('dialog')).toBeVisible();

    await expect(page.getByText('Toggle dark mode')).toBeVisible();
    await expect(page.getByText('Download QR code (PNG)')).toBeVisible();
    await expect(page.getByText('Show keyboard shortcuts')).toBeVisible();
  });

  test('shortcut ignored when input is focused', async ({ page }) => {
    await page.goto('/');

    // Navigate to step 2 with URL type selected
    await page.getByRole('button', { name: /URL/ }).first().click();
    const input = page.getByLabel('Enter URL');
    await input.focus();

    // Press ? — dialog should NOT open
    await page.keyboard.press('Shift+Slash');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
