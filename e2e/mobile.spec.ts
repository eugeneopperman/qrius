import { test, expect } from '@playwright/test';

test.describe('Mobile viewport (375x667)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'cookie-consent',
        JSON.stringify({ status: 'accepted', timestamp: Date.now(), analytics: false }),
      );
    });
  });

  test('homepage renders wizard heading', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'What would you like to create?' }),
    ).toBeVisible();
  });

  test('wizard type buttons are visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /URL/ }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Text/ }).first()).toBeVisible();
  });

  test('sign-in page renders on mobile', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('sign-in illustration is hidden on mobile', async ({ page }) => {
    await page.goto('/signin');
    // The gradient illustration panel has "10M+" text — should not be visible on mobile
    await expect(page.getByText('10M+')).not.toBeVisible();
  });

  test('sign-up page renders on mobile', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByText('Create your account')).toBeVisible();
  });

  test('can complete wizard on mobile', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /URL/ }).first().click();
    await page.getByLabel('Enter URL').fill('https://example.com');
    await page.getByRole('button', { name: /Customize/ }).click();
    await expect(
      page.getByRole('heading', { name: /Customize your QR code/i }),
    ).toBeVisible();
  });

  test('download buttons visible on step 4', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /URL/ }).first().click();
    await page.getByLabel('Enter URL').fill('https://example.com');
    await page.getByRole('button', { name: /Customize/ }).click();
    await page.getByRole('button', { name: /Download/ }).click();

    await expect(
      page.getByRole('button', { name: /Quick Download/i }),
    ).toBeVisible();
  });
});
