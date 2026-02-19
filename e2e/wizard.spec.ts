import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'cookie-consent',
      JSON.stringify({ status: 'accepted', timestamp: Date.now(), analytics: false }),
    );
  });
});

// Helper: go home and select a QR type (auto-advances to step 2)
async function selectType(page: import('@playwright/test').Page, typeRegex: RegExp) {
  await page.goto('/');
  await page.getByRole('button', { name: typeRegex }).first().click();
}

// ---------------------------------------------------------------------------
// QR type form fields
// ---------------------------------------------------------------------------
test.describe('Wizard — QR type forms', () => {
  test('URL type shows URL input', async ({ page }) => {
    await selectType(page, /URL/);
    await expect(page.getByLabel('Enter URL')).toBeVisible();
  });

  test('Text type shows textarea', async ({ page }) => {
    await selectType(page, /Text/);
    await expect(page.getByLabel('Text Content')).toBeVisible();
  });

  test('Email type shows email, subject, body fields', async ({ page }) => {
    await selectType(page, /Email/);
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel(/Subject/)).toBeVisible();
    await expect(page.getByLabel(/Body/)).toBeVisible();
  });

  test('Phone type shows phone input', async ({ page }) => {
    await selectType(page, /Phone/);
    await expect(page.getByLabel('Phone Number')).toBeVisible();
  });

  test('SMS type shows phone and message fields', async ({ page }) => {
    await selectType(page, /SMS/);
    await expect(page.getByLabel('Phone Number')).toBeVisible();
    await expect(page.getByLabel(/Message/)).toBeVisible();
  });

  test('WiFi type shows SSID, security, password', async ({ page }) => {
    await selectType(page, /WiFi/);
    await expect(page.getByLabel(/Network Name/)).toBeVisible();
    await expect(page.getByLabel(/Security Type/)).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('vCard type shows personal and contact fields', async ({ page }) => {
    await selectType(page, /vCard/);
    await expect(page.getByLabel('First Name')).toBeVisible();
    await expect(page.getByLabel('Last Name')).toBeVisible();
    await expect(page.getByLabel('Organization')).toBeVisible();
    await expect(page.getByLabel('Phone')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('Event type shows title and date fields', async ({ page }) => {
    await selectType(page, /Event/);
    await expect(page.getByLabel('Event Title')).toBeVisible();
    await expect(page.getByLabel('Start Date')).toBeVisible();
  });

  test('Location type shows latitude and longitude', async ({ page }) => {
    await selectType(page, /Location/);
    await expect(page.getByLabel('Latitude')).toBeVisible();
    await expect(page.getByLabel('Longitude')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Content input and Customize button
// ---------------------------------------------------------------------------
test.describe('Wizard — Customize button activation', () => {
  test('URL data fills and Customize advances', async ({ page }) => {
    await selectType(page, /URL/);
    await page.getByLabel('Enter URL').fill('https://example.com');
    const btn = page.getByRole('button', { name: /Customize/ });
    await expect(btn).toBeEnabled();
    await btn.click();
    await expect(
      page.getByRole('heading', { name: /Customize your QR code/i }),
    ).toBeVisible();
  });

  test('Email data fills and Customize advances', async ({ page }) => {
    await selectType(page, /Email/);
    await page.getByLabel('Email Address').fill('user@example.com');
    const btn = page.getByRole('button', { name: /Customize/ });
    await expect(btn).toBeEnabled();
    await btn.click();
    await expect(
      page.getByRole('heading', { name: /Customize your QR code/i }),
    ).toBeVisible();
  });

  test('Phone data fills and Customize advances', async ({ page }) => {
    await selectType(page, /Phone/);
    await page.getByLabel('Phone Number').fill('+15551234567');
    const btn = page.getByRole('button', { name: /Customize/ });
    await expect(btn).toBeEnabled();
    await btn.click();
    await expect(
      page.getByRole('heading', { name: /Customize your QR code/i }),
    ).toBeVisible();
  });

  test('vCard data fills and Customize advances', async ({ page }) => {
    await selectType(page, /vCard/);
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    const btn = page.getByRole('button', { name: /Customize/ });
    await expect(btn).toBeEnabled();
    await btn.click();
    await expect(
      page.getByRole('heading', { name: /Customize your QR code/i }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// WiFi: "No Password" hides password field
// ---------------------------------------------------------------------------
test.describe('Wizard — WiFi specifics', () => {
  test('selecting No Password hides password field', async ({ page }) => {
    await selectType(page, /WiFi/);
    await expect(page.getByLabel('Password')).toBeVisible();

    await page.getByLabel(/Security Type/).selectOption('nopass');
    await expect(page.getByLabel('Password')).not.toBeVisible();
  });

  test('switching back to WPA shows password field', async ({ page }) => {
    await selectType(page, /WiFi/);
    await page.getByLabel(/Security Type/).selectOption('nopass');
    await expect(page.getByLabel('Password')).not.toBeVisible();

    await page.getByLabel(/Security Type/).selectOption('WPA');
    await expect(page.getByLabel('Password')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Full 4-step flow
// ---------------------------------------------------------------------------
test.describe('Wizard — Full flow', () => {
  test('complete URL flow: type → content → customize → download', async ({ page }) => {
    await page.goto('/');

    // Step 1: select URL (auto-advances)
    await page.getByRole('button', { name: /URL/ }).first().click();

    // Step 2: enter content
    await page.getByLabel('Enter URL').fill('https://example.com');
    await page.getByRole('button', { name: /Customize/ }).click();

    // Step 3: customize (just verify heading then advance)
    await expect(
      page.getByRole('heading', { name: /Customize your QR code/i }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Download', exact: true }).click();

    // Step 4: download page
    await expect(
      page.getByRole('heading', { name: /Your QR code is ready/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Quick Download/i }),
    ).toBeVisible();
  });

  test('Quick Download skips customization', async ({ page }) => {
    await selectType(page, /URL/);
    await page.getByLabel('Enter URL').fill('https://example.com');
    await page.getByRole('button', { name: /Quick Download/i }).click();

    // Should jump to step 4
    await expect(
      page.getByRole('heading', { name: /Your QR code is ready/i }),
    ).toBeVisible();
  });

  test('Create Another resets to step 1', async ({ page }) => {
    // Go through full flow first
    await page.goto('/');
    await page.getByRole('button', { name: /URL/ }).first().click();
    await page.getByLabel('Enter URL').fill('https://example.com');
    await page.getByRole('button', { name: /Quick Download/i }).click();

    await expect(
      page.getByRole('heading', { name: /Your QR code is ready/i }),
    ).toBeVisible();

    await page.getByRole('button', { name: /Create Another/i }).click();

    // Should be back at step 1
    await expect(
      page.getByRole('heading', { name: 'What would you like to create?' }),
    ).toBeVisible();
  });

  test('Back button on step 2 returns to step 1', async ({ page }) => {
    await selectType(page, /URL/);
    await page.getByRole('button', { name: /Back/ }).click();

    await expect(
      page.getByRole('heading', { name: 'What would you like to create?' }),
    ).toBeVisible();
  });
});
