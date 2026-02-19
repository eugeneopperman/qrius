import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'cookie-consent',
      JSON.stringify({ status: 'accepted', timestamp: Date.now(), analytics: false }),
    );
  });
});

test.describe('404 — Not Found', () => {
  test('invalid route shows 404 text', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Page not found')).toBeVisible();
  });

  test('Go Back button navigates back', async ({ page }) => {
    // Start on homepage so there's history to go back to
    await page.goto('/');
    await page.goto('/some-bad-route');
    await expect(page.getByText('404')).toBeVisible();

    await page.getByRole('button', { name: /go back/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('Home button navigates to homepage', async ({ page }) => {
    await page.goto('/does-not-exist');
    await page.getByRole('link', { name: /home/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('multiple invalid paths all show 404', async ({ page }) => {
    for (const path of ['/abc', '/foo/bar', '/random-123']) {
      await page.goto(path);
      await expect(page.getByText('404')).toBeVisible();
    }
  });
});
