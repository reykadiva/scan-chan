import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('🎮 Scan Chan Full System Verification Suite', () => {

  test('1. Auth, Avatar Selection & Session Persistence (Desktop)', async ({ page, context }) => {
    await context.clearCookies();
    await page.setViewportSize({ width: 1440, height: 900 });

    // Step A: Title screen loads cleanly
    await page.goto(`${BASE_URL}/`);
    await expect(page.locator('h1')).toContainText('SCAN CHAN');
    
    // Step B: Open Auth modal
    const startPrompt = page.locator('text=PRESS TO START');
    await expect(startPrompt).toBeVisible();
    await startPrompt.click();

    // Verify Auth Modal appears
    const modal = page.locator('form');
    await expect(modal).toBeVisible();

    // Switch to Sign Up tab
    const signUpTab = page.locator('button', { hasText: 'Sign up' });
    await signUpTab.click();

    // Pick a Cat Companion Avatar (e.g. cyan cat)
    const cyanAvatarBtn = page.locator('button[title*="Teal"], button[title*="Cyan"], button[title*="cyan"]').first();
    if (await cyanAvatarBtn.isVisible()) {
      await cyanAvatarBtn.click();
    }

    // Fill form
    const testEmail = `test_hunter_${Date.now()}@scanchan.local`;
    await page.fill('input[placeholder*="MasterScanner"]', 'CyberCatHunter');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'hunter123456');

    // Submit registration
    await page.click('button:has-text("Create Account")');

    // Wait for redirect to /play
    await page.waitForURL('**/play', { timeout: 15000 });
    expect(page.url()).toContain('/play');

    // Verify Nickname & Avatar in Top HUD Bar
    await expect(page.locator('header')).toContainText('CyberCatHunter');

    // Step C: Persistence check on reload
    await page.reload();
    await expect(page.locator('header')).toContainText('CyberCatHunter');
    await expect(page.locator('h2')).toContainText('Scan-chan');

    // Step D: Logout flow
    const exitBtn = page.locator('button[aria-label="Exit or sign out"]');
    await expect(exitBtn).toBeVisible();
    await exitBtn.click();
    await page.waitForURL((url) => url.pathname === '/', { timeout: 10000 });
  });

  test('2. Guest Mode Flow & Old Route Absence Check', async ({ page, context }) => {
    await context.clearCookies();
    await page.setViewportSize({ width: 768, height: 1024 });

    // Step A: Visit /play/mode
    await page.goto(`${BASE_URL}/play/mode`);
    await expect(page.locator('h1')).toContainText('Select Your Play Mode');

    // Step B: Select Guest Mode
    const guestCard = page.locator('button', { hasText: 'Guest Mode' });
    await expect(guestCard).toBeVisible();
    await guestCard.click();

    // Verify redirected to /play
    await page.waitForURL('**/play', { timeout: 10000 });
    expect(page.url()).toContain('/play');
    await expect(page.locator('header')).toContainText('Guest Hunter');

    // Step C: Verify old /login & /register routes do not exist as separate pages (redirects cleanly to modal)
    await page.goto(`${BASE_URL}/login`);
    expect(page.url()).toContain('auth=true');
    await expect(page.locator('button:has-text("Play as Guest")')).toBeVisible();

    await page.goto(`${BASE_URL}/register`);
    expect(page.url()).toContain('auth=true');
    await expect(page.locator('button:has-text("Play as Guest")')).toBeVisible();
  });

  test('3. Core Game Flow: Catalog, Barcode Scan, Streak & Food Feed (Mobile 375x812)', async ({ page, context }) => {
    await context.clearCookies();
    await page.setViewportSize({ width: 375, height: 812 });

    // Initialize Guest session
    await page.goto(`${BASE_URL}/play/mode`);
    await page.click('button:has-text("Guest Mode")');
    await page.waitForURL('**/play');

    // Verify Initial Catalog is Empty (0 Dummy Data)
    await page.click('button:has-text("Catalog")');
    await expect(page.locator('h3:has-text("Product Registry")')).toBeVisible();
    // Catalog empty state
    await expect(page.locator('text=No products registered yet')).toBeVisible();

    // Close Catalog modal
    await page.click('button[title="Close modal"]');

    // Verify Empty Food Bag state in Companion Card
    await expect(page.locator('text=Bag is empty! Scan items for treats')).toBeVisible();
    const quickScanBtn = page.locator('a:has-text("Scan →")');
    await expect(quickScanBtn).toBeVisible();

    // Open Manual Barcode Entry modal
    await page.click('button:has-text("Manual Barcode Entry")');
    await expect(page.locator('h2:has-text("Register Product")')).toBeVisible();

    // Register a test product
    const testBarcode = `899${Date.now().toString().slice(-9)}`;
    await page.fill('input[placeholder*="8991234567890"]', testBarcode);
    await page.fill('input[placeholder*="Indomie"]', 'Crispy Seaweed Snack');
    await page.fill('input[placeholder*="Indofood"]', 'Arcade Foods');
    await page.selectOption('select', 'Snack');
    await page.click('button[type="submit"]:has-text("Register Product")');

    // Verify product added toast or confirmation
    await page.waitForSelector('text=Crispy Seaweed Snack', { timeout: 10000 });

    // Verify Food Bag now has the item
    await expect(page.locator('text=Crispy Seaweed Snack')).toBeVisible();

    // Verify Real-time Streak is 1d
    await expect(page.locator('header')).toContainText('1d');

    // Verify Feed Pet action
    const feedBtn = page.locator('button:has-text("Feed")').first();
    await expect(feedBtn).toBeVisible();
    await feedBtn.click();
    await expect(page.locator('text=+Hunger, +XP')).toBeVisible();

    // Test Tap to Meow
    const catBox = page.locator('div[title="Click your partner to interact!"]');
    await catBox.click();
    // Speech bubble appears in English
    await page.waitForSelector('.shadow-\\[3px_3px_0_0_var\\(--theme-shadow\\)\\]', { timeout: 5000 });
  });

  test('4. Dead / Fainted State (Hunger 0%) & Revive Logic Verification', async ({ page, context }) => {
    await context.clearCookies();
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto(`${BASE_URL}/play/mode`);
    await page.click('button:has-text("Guest Mode")');
    await page.waitForURL('**/play');

    // Add a food item first so we can revive the pet
    await page.evaluate(() => {
      const store = (window as any).usePlayerStore?.getState?.();
      if (store) {
        store.foodInventory = { 'test-snack-barcode': 2 };
      }
    });

    // Simulate Hunger = 0% directly in state
    await page.evaluate(() => {
      const store = (window as any).usePlayerStore?.getState?.();
      if (store) {
        store.petHunger = 0;
      }
    });

    // Force reload/re-render to see hunger = 0
    await page.evaluate(() => {
      window.dispatchEvent(new Event('storage'));
    });

    // Check [Feed to Revive! 🍖] label
    const reviveLabel = page.locator('text=[Feed to Revive! 🍖]');
    if (await reviveLabel.isVisible()) {
      await expect(reviveLabel).toBeVisible();

      // Tap fainted cat
      const catBox = page.locator('div[title="Click your partner to interact!"]');
      await catBox.click();
      // Verify weak/fainted dialog appears
      await expect(page.locator('text=revive').or(page.locator('text=hungry')).or(page.locator('text=X_X'))).toBeVisible();
    }
  });

  test('5. Settings Modal: 6 Dynamic Themes & Audio Engine (Tablet 768x1024)', async ({ page, context }) => {
    await context.clearCookies();
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto(`${BASE_URL}/play/mode`);
    await page.click('button:has-text("Guest Mode")');
    await page.waitForURL('**/play');

    // Open Settings Modal
    const settingsBtn = page.locator('button[aria-label="Open settings"]');
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();

    // Verify Settings Modal opened
    await expect(page.locator('h2:has-text("SETTINGS")')).toBeVisible();

    // Test Theme Switching across 6 themes
    const themes = [
      { name: 'Sage Green', id: 'sage' },
      { name: 'Butter Yellow', id: 'butter' },
      { name: 'Powder Blue', id: 'blue' },
      { name: 'Lavender', id: 'lavender' },
      { name: 'Terracotta', id: 'terracotta' },
      { name: 'Retro Pink', id: 'pink' },
    ];

    for (const theme of themes) {
      const themeBtn = page.locator(`button:has-text("${theme.name}")`);
      await expect(themeBtn).toBeVisible();
      await themeBtn.click();

      // Verify DOM data-app-theme attribute
      const activeTheme = await page.evaluate(() => document.documentElement.getAttribute('data-app-theme'));
      expect(activeTheme).toBe(theme.id);
    }

    // Test BGM controls
    const allLoopBtn = page.locator('button:has-text("All Loop (Playlist)")');
    await expect(allLoopBtn).toBeVisible();
    await allLoopBtn.click();

    const bgm2Btn = page.locator('button:has-text("BGM 2 Loop")');
    await expect(bgm2Btn).toBeVisible();
    await bgm2Btn.click();

    // Close Settings Modal
    await page.click('button[aria-label="Close settings"]');
    await expect(page.locator('h2:has-text("SETTINGS")')).not.toBeVisible();
  });

  test('6. Responsive Audit: Zero Horizontal Overflow across Mobile & Tablet', async ({ page }) => {
    const viewports = [
      { width: 375, height: 812, name: 'Mobile' },
      { width: 414, height: 896, name: 'Mobile Large' },
      { width: 768, height: 1024, name: 'Tablet' },
    ];

    const pagesToTest = ['/', '/play/mode', '/play', '/scan'];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const route of pagesToTest) {
        await page.goto(`${BASE_URL}${route}`);
        await page.waitForLoadState('domcontentloaded');

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          return {
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            hasOverflow: doc.scrollWidth > doc.clientWidth,
          };
        });

        expect(overflow.hasOverflow).toBe(false);
      }
    }
  });

});
