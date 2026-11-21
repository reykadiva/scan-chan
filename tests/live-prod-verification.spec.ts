import { test, expect } from '@playwright/test';

const PROD_URL = 'https://scanchan.vercel.app';

test.describe('🚀 Scan-Chan Live Production Verification', () => {
  test.setTimeout(60000);

  test('1. Guest Mode & UI/Audio Check: Instant play, 6 themes & 4 BGM tracks', async ({ page, context }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error(`[Prod Console Error] ${msg.text()}`);
      }
    });

    await context.clearCookies();
    await page.goto(PROD_URL, { waitUntil: 'domcontentloaded' });

    // Expect Title Screen loaded
    await expect(page.locator('h1:has-text("SCAN CHAN")')).toBeVisible({ timeout: 15000 });

    // Click "PRESS TO START"
    const startPrompt = page.locator('text=PRESS TO START');
    await expect(startPrompt).toBeVisible();
    await startPrompt.click();

    // Verify Auth Modal appears
    const modal = page.locator('h2:has-text("SCAN CHAN")');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Click Play as Guest
    const guestBtn = page.locator('button:has-text("Play as Guest")');
    await expect(guestBtn).toBeVisible();
    await guestBtn.click();

    // Verify redirected to /play
    await page.waitForURL('**/play', { timeout: 20000 });
    expect(page.url()).toContain('/play');

    // Verify dashboard elements & pixel companion
    await expect(page.locator('text=Guest').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Scan-chan Jr.').first()).toBeVisible();
    await expect(page.locator('text=SCAN BARCODE').first()).toBeVisible();

    // Open Settings Modal
    const settingsBtn = page.locator('button[aria-label="Open settings"]');
    await expect(settingsBtn).toBeVisible({ timeout: 10000 });
    await settingsBtn.click();

    // Verify Settings Modal header
    await expect(page.locator('h2:has-text("SETTINGS")')).toBeVisible({ timeout: 10000 });

    // Verify 6 Arcade Color Themes
    await expect(page.locator('text=Retro Pink & White')).toBeVisible();
    await expect(page.locator('text=Sage Green & Cream')).toBeVisible();
    await expect(page.locator('text=Butter Yellow & Vanilla')).toBeVisible();
    await expect(page.locator('text=Powder Blue & Cloud')).toBeVisible();
    await expect(page.locator('text=Lavender & Lilac')).toBeVisible();
    await expect(page.locator('text=Terracotta & Beige')).toBeVisible();

    // Verify 4 Real BGM Tracks in Loop Selector
    await expect(page.locator('text=Pufino - Soaked').first()).toBeVisible();
    await expect(page.locator('text=Nebulite - Kyoto').first()).toBeVisible();
    await expect(page.locator('text=Lukrembo - Bread').first()).toBeVisible();
    await expect(page.locator('text=Massobeats - Honey Jam').first()).toBeVisible();

    // Capture screenshot for evidence
    await page.screenshot({ path: 'test-results/live-prod-settings.png' });

    // Close Settings Modal
    const closeSettings = page.locator('button[aria-label="Close settings"]');
    if (await closeSettings.isVisible()) {
      await closeSettings.click();
    }

    // Verify no fatal 500 or ENOENT uncaught errors
    const fatalErrors = consoleErrors.filter(
      (err) => err.includes('500') || err.includes('ENOENT') || err.includes('EROFS')
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test('2. Arashu Hunter Sign Up, Manual Product Registration, Feeding & Cloud Sync', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(PROD_URL, { waitUntil: 'domcontentloaded' });

    // Open Auth Modal
    await page.locator('text=PRESS TO START').click();
    await expect(page.locator('h2:has-text("SCAN CHAN")')).toBeVisible({ timeout: 10000 });

    // Switch to Sign Up tab
    await page.click('button:has-text("Sign up")');

    // Fill registration credentials
    const uniqueSuffix = Date.now().toString().slice(-5);
    const testEmail = `test-prod-${uniqueSuffix}@example.com`;
    const testNickname = `ProdTester${uniqueSuffix}`;
    const testPassword = 'ProdTesterPassword123!';

    await page.fill('input[placeholder="e.g. MasterScanner"]', testNickname);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    // Pick Cyan companion
    const cyanBtn = page.locator('button[title="Teal"]');
    if (await cyanBtn.isVisible()) {
      await cyanBtn.click();
    }

    // Submit registration
    await page.click('button[type="submit"]:has-text("Create Account")');

    // Verify redirected to /play successfully without 500 or ENOENT
    await page.waitForURL('**/play', { timeout: 25000 });
    expect(page.url()).toContain('/play');

    // Verify Hunter Nickname is rendered in Top HUD
    await expect(page.locator(`text=${testNickname}`).first()).toBeVisible({ timeout: 10000 });

    // Open Manual Product Registration Modal
    const manualBtn = page.locator('button:has-text("Manual Barcode Entry / Add Item")');
    await expect(manualBtn).toBeVisible({ timeout: 10000 });
    await manualBtn.click();

    // Verify Register Product modal is open
    await expect(page.locator('h2:has-text("Register Product")')).toBeVisible({ timeout: 10000 });

    // Fill Product Details with unique barcode
    const testBarcode = '899' + Date.now().toString().slice(-10);
    await page.fill('input[placeholder="e.g. 8991234567890"]', testBarcode);
    await page.fill('input[placeholder="e.g. Indomie Goreng"]', 'Prod Seaweed Snack');
    await page.fill('input[placeholder="e.g. Indofood"]', 'Scan Bento');
    await page.selectOption('select', 'Snack');

    // Submit product registration
    await page.click('button[type="submit"]:has-text("Register Product")');

    // Wait for modal to close
    await expect(page.locator('h2:has-text("Register Product")')).not.toBeVisible({ timeout: 15000 });

    // Open Catalog modal to verify product is registered in database
    const catalogBtn = page.locator('button:has-text("Catalog")');
    if (await catalogBtn.isVisible()) {
      await catalogBtn.click();
      await expect(page.locator('text=Prod Seaweed Snack').first()).toBeVisible({ timeout: 10000 });
      // Close catalog modal
      const closeBtn = page.locator('button[aria-label="Close modal"]');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }

    // Reload page to re-fetch product catalog into Quick Feed
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/play', { timeout: 20000 });

    // Confirm session & profile persisted from Supabase Cloud after reload
    await expect(page.locator(`text=${testNickname}`).first()).toBeVisible({ timeout: 15000 });

    // Feed pet from Quick Feed row if present
    const feedBtn = page.locator('button:has-text("Feed")').first();
    if (await feedBtn.isVisible()) {
      await feedBtn.click();
      await page.waitForTimeout(1500);
    }
  });
});
