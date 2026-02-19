import { test, expect } from '@playwright/test';

// Dismiss cookie consent banner before each test
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'cookie-consent',
      JSON.stringify({ status: 'accepted', timestamp: Date.now(), analytics: false }),
    );
  });
});

test.describe('Navigation — Homepage', () => {
  test('renders wizard heading', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'What would you like to create?' }),
    ).toBeVisible();
  });

  test('renders public footer with copyright', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/© \d{4} Qrius/)).toBeVisible();
  });

  test('footer links to Terms, Privacy, Cookies', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Terms' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Privacy' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cookies' })).toBeVisible();
  });

  test('beta badge is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Beta v\d+\.\d+/)).toBeVisible();
  });
});

test.describe('Navigation — Auth pages', () => {
  test('sign-in page renders form', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('sign-up page renders form', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByText('Create your account')).toBeVisible();
  });

  test('sign-in links to sign-up', async ({ page }) => {
    await page.goto('/signin');
    const link = page.getByRole('link', { name: /sign up/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('sign-up links to sign-in', async ({ page }) => {
    await page.goto('/signup');
    const link = page.getByRole('link', { name: /sign in/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/signin/);
  });
});

test.describe('Navigation — Legal pages', () => {
  test('terms page renders content', async ({ page }) => {
    await page.goto('/terms');
    await expect(
      page.getByRole('heading', { name: 'Terms of Service', level: 1 }),
    ).toBeVisible();
  });

  test('privacy page renders content', async ({ page }) => {
    await page.goto('/privacy');
    await expect(
      page.getByRole('heading', { name: 'Privacy Policy', level: 1 }),
    ).toBeVisible();
  });

  test('cookies page renders content', async ({ page }) => {
    await page.goto('/cookies');
    await expect(
      page.getByRole('heading', { name: 'Cookie Policy', level: 1 }),
    ).toBeVisible();
  });
});
