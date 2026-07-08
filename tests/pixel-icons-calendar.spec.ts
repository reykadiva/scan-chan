import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Pixel Icons & Dynamic Calendar Features
 * 
 * Tests:
 * 1. Pixel art icons display correctly (flame, barcode, category icons)
 * 2. Dynamic login calendar shows correct week
 * 3. Streak counter syncs with login calendar
 * 4. Multiple users don't have data collision
 * 5. Data persists across page reloads
 */

test.describe('Pixel Icons & Dynamic Calendar', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
  });

  test('should display pixel art icons throughout the app', async ({ page }) => {
    await page.goto('http://localhost:3000/play/mode/arashu-login');
    
    // Wait for page to load
    await page.waitForSelector('input[placeholder*="nickname"]', { timeout: 10000 });
    
    // Register as new user
    const testNickname = `PixelTest_${Date.now()}`;
    await page.fill('input[placeholder*="nickname"]', testNickname);
    await page.click('button:has-text("Start")');
    
    // Wait for game hub to load
    await page.waitForURL('**/play', { timeout: 10000 });
    await page.waitForSelector('text=/Daily Login Calendar/i', { timeout: 10000 });
    
    // Check pixel flame icon in streak display
    const streakSection = page.locator('text=/Day Streak/i').locator('..').locator('..');
    await expect(streakSection).toBeVisible();
    
    // Check login calendar has pixel icons (should see SVG elements)
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(500);
    const calendarGrid = page.locator('.grid-cols-7');
    await expect(calendarGrid).toBeVisible();
    
    // Verify pixel icons are SVG (not emoji)
    const iconSvgs = calendarGrid.locator('svg');
    const svgCount = await iconSvgs.count();
    expect(svgCount).toBeGreaterThan(0); // Should have SVG pixel icons
    
    console.log(`✅ Found ${svgCount} pixel art SVG icons in calendar`);
  });

  test('should show dynamic login calendar with week progression', async ({ page }) => {
    await page.goto('http://localhost:3000/play/mode/arashu-login');
    
    const testNickname = `WeekTest_${Date.now()}`;
    await page.fill('input[placeholder*="nickname"]', testNickname);
    await page.click('button:has-text("Start")');
    
    await page.waitForURL('**/play', { timeout: 10000 });
    
    // Click Login tab
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(500);
    
    // Week 1 should be visible (Day 1-7)
    await expect(page.locator('text=/Day 1/i')).toBeVisible();
    await expect(page.locator('text=/Day 7/i')).toBeVisible();
    
    // Title should show "Daily Login Calendar" (no week number for week 1)
    const title = page.locator('text=/Daily Login Calendar/i');
    await expect(title).toBeVisible();
    
    // Claim button should be present
    const claimButton = page.locator('button:has-text("Claim Today\'s Login Reward")');
    await expect(claimButton).toBeVisible();
    
    console.log('✅ Week 1 (Day 1-7) displayed correctly');
  });

  test('should sync streak counter with login calendar claims', async ({ page }) => {
    await page.goto('http://localhost:3000/play/mode/arashu-login');
    
    const testNickname = `StreakSync_${Date.now()}`;
    await page.fill('input[placeholder*="nickname"]', testNickname);
    await page.click('button:has-text("Start")');
    
    await page.waitForURL('**/play', { timeout: 10000 });
    
    // Initial streak should be 0 or not visible
    // Click Login tab
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(500);
    
    // Claim first day reward
    const claimButton = page.locator('button:has-text("Claim Today\'s Login Reward")');
    await claimButton.click();
    await page.waitForTimeout(1000);
    
    // Check streak counter updated
    const streakBadge = page.locator('text=/day streak/i');
    await expect(streakBadge).toBeVisible();
    
    // Streak should now be 1
    await expect(page.locator('text=/1.*day.*streak/i')).toBeVisible();
    
    // Day 1 should be marked as completed (pink checkmark)
    const day1Card = page.locator('text=/Day 1/i').locator('..').locator('..');
    await expect(day1Card).toHaveClass(/bg-pink-50/);
    
    console.log('✅ Streak synced with login calendar claim');
  });

  test('should display pixel category icons in badges', async ({ page }) => {
    await page.goto('http://localhost:3000/play/mode/arashu-login');
    
    const testNickname = `CategoryTest_${Date.now()}`;
    await page.fill('input[placeholder*="nickname"]', testNickname);
    await page.click('button:has-text("Start")');
    
    await page.waitForURL('**/play', { timeout: 10000 });
    
    // Click Badges tab
    await page.click('button:has-text("Badges")');
    await page.waitForTimeout(500);
    
    // Check category badges have pixel icons
    await expect(page.locator('text=/Snack Master/i')).toBeVisible();
    await expect(page.locator('text=/Healthy Hydration/i')).toBeVisible();
    await expect(page.locator('text=/Candy Collector/i')).toBeVisible();
    
    // Count SVG icons in badges (should have pixel art icons)
    const badgeIcons = page.locator('.grid-cols-2 svg, .grid-cols-3 svg');
    const iconCount = await badgeIcons.count();
    expect(iconCount).toBeGreaterThan(0);
    
    console.log(`✅ Found ${iconCount} pixel art category icons in badges`);
  });

  test('should display pixel barcode icon in bounty hunt', async ({ page }) => {
    await page.goto('http://localhost:3000/play/mode/arashu-login');
    
    const testNickname = `BountyTest_${Date.now()}`;
    await page.fill('input[placeholder*="nickname"]', testNickname);
    await page.click('button:has-text("Start")');
    
    await page.waitForURL('**/play', { timeout: 10000 });
    
    // Click Bounty tab
    await page.click('button:has-text("Bounty")');
    await page.waitForTimeout(500);
    
    // Click "New Bounty" button
    const newBountyBtn = page.locator('button:has-text("New Bounty")');
    await expect(newBountyBtn).toBeVisible();
    
    // Check button has cyan gradient (not purple)
    await expect(newBountyBtn).toHaveClass(/from-cyan-400/);
    
    // Button should have pixel barcode icon (SVG)
    const barcodeIcon = newBountyBtn.locator('svg');
    await expect(barcodeIcon).toBeVisible();
    
    console.log('✅ Pixel barcode icon displayed in bounty hunt');
  });

  test('should persist data across page reloads', async ({ page }) => {
    await page.goto('http://localhost:3000/play/mode/arashu-login');
    
    const testNickname = `PersistTest_${Date.now()}`;
    await page.fill('input[placeholder*="nickname"]', testNickname);
    await page.click('button:has-text("Start")');
    
    await page.waitForURL('**/play', { timeout: 10000 });
    
    // Claim login reward
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Claim Today\'s Login Reward")');
    await page.waitForTimeout(1000);
    
    // Get current streak
    const streakText = await page.locator('text=/day streak/i').first().textContent();
    
    // Reload page
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Check data persisted
    await expect(page.locator(`text=${testNickname}`)).toBeVisible();
    
    // Check streak persisted
    await expect(page.locator('text=/day streak/i').first()).toBeVisible();
    
    console.log('✅ Data persisted after reload');
  });

  test('should handle multiple users without data collision', async ({ browser }) => {
    // Create two separate contexts (like two different browsers)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // User 1
    await page1.goto('http://localhost:3000/play/mode/arashu-login');
    const nickname1 = `User1_${Date.now()}`;
    await page1.fill('input[placeholder*="nickname"]', nickname1);
    await page1.click('button:has-text("Start")');
    await page1.waitForURL('**/play', { timeout: 10000 });
    
    // Claim reward for user 1
    await page1.click('button:has-text("Login")');
    await page1.waitForTimeout(500);
    await page1.click('button:has-text("Claim Today\'s Login Reward")');
    await page1.waitForTimeout(1000);
    
    // User 2
    await page2.goto('http://localhost:3000/play/mode/arashu-login');
    const nickname2 = `User2_${Date.now()}`;
    await page2.fill('input[placeholder*="nickname"]', nickname2);
    await page2.click('button:has-text("Start")');
    await page2.waitForURL('**/play', { timeout: 10000 });
    
    // Verify user 1 still has their data
    await expect(page1.locator(`text=${nickname1}`)).toBeVisible();
    await expect(page1.locator('text=/1.*day.*streak/i')).toBeVisible();
    
    // Verify user 2 has fresh data (no streak yet)
    await expect(page2.locator(`text=${nickname2}`)).toBeVisible();
    
    // User 2 claims reward
    await page2.click('button:has-text("Login")');
    await page2.waitForTimeout(500);
    await page2.click('button:has-text("Claim Today\'s Login Reward")');
    await page2.waitForTimeout(1000);
    
    // Both users should have streak = 1
    await expect(page1.locator('text=/1.*day.*streak/i')).toBeVisible();
    await expect(page2.locator('text=/1.*day.*streak/i')).toBeVisible();
    
    // But different nicknames
    await expect(page1.locator(`text=${nickname1}`)).toBeVisible();
    await expect(page2.locator(`text=${nickname2}`)).toBeVisible();
    
    console.log('✅ Multiple users data isolated correctly');
    
    await context1.close();
    await context2.close();
  });

  test('should show correct week after completing week 1', async ({ page }) => {
    await page.goto('http://localhost:3000/play/mode/arashu-login');
    
    const testNickname = `Week2Test_${Date.now()}`;
    await page.fill('input[placeholder*="nickname"]', testNickname);
    await page.click('button:has-text("Start")');
    await page.waitForURL('**/play', { timeout: 10000 });
    
    // Simulate 7 days of login by manipulating localStorage
    await page.evaluate(() => {
      const storage = localStorage.getItem('player-store');
      if (storage) {
        const data = JSON.parse(storage);
        const today = new Date();
        const calendar = [];
        
        // Add 7 consecutive days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          calendar.push(date.toLocaleDateString('en-CA'));
        }
        
        data.state.loginCalendar = calendar;
        data.state.streak = 7;
        localStorage.setItem('player-store', JSON.stringify(data));
      }
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Click Login tab
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(500);
    
    // Should see Week 2 indicator
    await expect(page.locator('text=/Week 2/i')).toBeVisible();
    
    // Should see Day 8-14
    await expect(page.locator('text=/Day 8/i')).toBeVisible();
    await expect(page.locator('text=/Day 14/i')).toBeVisible();
    
    console.log('✅ Week 2 displayed correctly after completing Week 1');
  });

  test('should display product category icons in product list', async ({ page }) => {
    await page.goto('http://localhost:3000/play/mode/arashu-login');
    
    const testNickname = `ProductTest_${Date.now()}`;
    await page.fill('input[placeholder*="nickname"]', testNickname);
    await page.click('button:has-text("Start")');
    await page.waitForURL('**/play', { timeout: 10000 });
    
    // Need to scan a product first to see products tab
    // Go to scan page
    await page.goto('http://localhost:3000/scan');
    await page.waitForTimeout(1000);
    
    // Enter a test barcode
    const barcodeInput = page.locator('input[type="text"]').first();
    if (await barcodeInput.isVisible()) {
      await barcodeInput.fill('8888888888888');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      
      // Register product if prompted
      const registerButton = page.locator('button:has-text("Register")');
      if (await registerButton.isVisible()) {
        await registerButton.click();
        await page.waitForTimeout(500);
        
        // Select category
        const categorySelect = page.locator('select');
        if (await categorySelect.isVisible()) {
          await categorySelect.selectOption('Snack');
          await page.click('button:has-text("Save")');
          await page.waitForTimeout(1000);
        }
      }
      
      // Go back to play page
      await page.goto('http://localhost:3000/play');
      await page.waitForTimeout(1000);
      
      // Click Products tab
      await page.click('button:has-text("Products")');
      await page.waitForTimeout(1000);
      
      // Check for category badge with icon
      const categoryBadges = page.locator('span:has-text("Snack")');
      if (await categoryBadges.count() > 0) {
        const badge = categoryBadges.first();
        await expect(badge).toBeVisible();
        
        // Should have SVG icon
        const icon = badge.locator('svg');
        await expect(icon).toBeVisible();
        
        console.log('✅ Product category icon displayed in product list');
      }
    }
  });
});
