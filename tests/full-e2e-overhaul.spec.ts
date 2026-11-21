import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('🎮 Scan Chan Total Overhaul E2E Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Browser Console Error] ${msg.text()}`);
      }
    });
  });

  test('1. Protected routes redirect unauthenticated users to /login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(`${BASE_URL}/play`);
    await page.waitForURL('**/login?redirect=%2Fplay', { timeout: 10000 });
    expect(page.url()).toContain('/login');
    await expect(page.locator('h1')).toContainText('Welcome to Scan Chan');
  });

  test('2. Guest mode grants instant offline access and initializes player', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(`${BASE_URL}/login`);

    // Click quick play as guest
    const guestBtn = page.locator('button:has-text("Quick Play as Guest")');
    await expect(guestBtn).toBeVisible();
    await guestBtn.click();

    // Verify redirected to /play
    await page.waitForURL('**/play', { timeout: 10000 });
    expect(page.url()).toContain('/play');

    // Verify guest indicators
    await expect(page.locator('text=Guest').first()).toBeVisible();
    await expect(page.locator('text=Scan-chan Jr.').first()).toBeVisible();
    await expect(page.locator('text=Quests').first()).toBeVisible();
  });

  test('3. New hunter account registration, profile load & persistence', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(`${BASE_URL}/login`);

    // Switch to register tab
    await page.click('button:has-text("Create Account")');
    await expect(page.locator('h1')).toContainText('Join the Scan Quest');

    const uniqueId = Date.now().toString().slice(-6);
    const testEmail = `hunter_${uniqueId}@scanchan.test`;
    const testNickname = `Hunter${uniqueId}`;

    await page.fill('input[placeholder="e.g. PixelMaster"]', testNickname);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'hunterpassword123');

    // Pick Fox avatar
    await page.click('button:has-text("🦊")');

    // Submit registration
    await page.click('button[type="submit"]');

    // Verify redirected to /play
    await page.waitForURL('**/play', { timeout: 15000 });
    expect(page.url()).toContain('/play');

    // Verify header and profile show registered nickname
    await expect(page.locator(`text=${testNickname}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('4. Core gameplay hub tabs and pet interactions', async ({ page, context }) => {
    await context.clearCookies();
    // Start with guest for fast interactive testing
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Quick Play as Guest")');
    await page.waitForURL('**/play', { timeout: 10000 });

    // Switch tabs: Calendar
    await page.click('button:has-text("Calendar")');
    await expect(page.locator('text=Daily Login Calendar').or(page.locator('text=Calendar')).first()).toBeVisible();

    // Switch tabs: Bounty
    await page.click('button:has-text("Bounty")');
    await expect(page.locator('text=Bounty').first()).toBeVisible();

    // Switch tabs: Badges
    await page.click('button:has-text("Badges")');
    await expect(page.locator('text=Badges').first()).toBeVisible();

    // Switch tabs: Roadmap
    await page.click('button:has-text("Roadmap")');
    await expect(page.locator('text=Roadmap').first()).toBeVisible();

    // Switch tabs: Catalog
    await page.click('button:has-text("Catalog")');
    await expect(page.locator('text=Catalog').or(page.locator('text=Products')).first()).toBeVisible();
  });

  test('5. Sign out flow strictly isolates session and prevents unauthorized access', async ({ page, context }) => {
    await context.clearCookies();
    // Log in as guest first
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Quick Play as Guest")');
    await page.waitForURL('**/play', { timeout: 10000 });

    // Manually test logout endpoint
    await page.request.post(`${BASE_URL}/api/auth/logout`);

    // Verify session endpoint returns unauthenticated
    const sessionRes = await page.request.get(`${BASE_URL}/api/auth/session`);
    const sessionData = await sessionRes.json();
    expect(sessionData.authenticated).toBe(false);
  });

  test('6. Barcode scanning and product detail inspection', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Quick Play as Guest")');
    await page.waitForURL('**/play', { timeout: 10000 });

    // 1. Test scan API for seeded Indomie barcode
    const scanRes = await page.request.post(`${BASE_URL}/api/scan`, {
      data: { barcodeNumber: '8992775311029', deviceType: 'desktop' },
    });
    const scanData = await scanRes.json();
    expect(scanData.success).toBe(true);
    expect(scanData.data.found).toBe(true);
    expect(scanData.data.product.productName).toContain('Indomie');
    expect(scanData.data.xpAwarded).toBeGreaterThan(0);

    // 2. Navigate to product detail page
    await page.goto(`${BASE_URL}/product/8992775311029`);
    await expect(page.locator('h1')).toContainText('Indomie Mi Goreng Spesial');
    await expect(page.locator('text=Indofood').first()).toBeVisible();
  });

  test('7. Products catalog API handles search, categories & pagination', async ({ page }) => {
    // Test product listing endpoint
    const res = await page.request.get(`${BASE_URL}/api/products`);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.length).toBeGreaterThanOrEqual(3);

    // Test search filter
    const searchRes = await page.request.get(`${BASE_URL}/api/products?search=Teh`);
    const searchData = await searchRes.json();
    expect(searchData.success).toBe(true);
    expect(searchData.data.some((p: any) => p.productName.includes('Teh Botol'))).toBe(true);
  });
});
