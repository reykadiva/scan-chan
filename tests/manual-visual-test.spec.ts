import { test } from '@playwright/test';

/**
 * Manual Visual Test - Complete User Journey
 * This will open browser and navigate through the entire app
 * so we can visually verify all pixel icons
 */

test('MANUAL VISUAL TEST: Complete pixel icons verification', async ({ page }) => {
  console.log('\n🚀 Starting Manual Visual Test...\n');
  
  // Step 1: Choose Game Mode
  console.log('📍 Step 1: Navigate to game mode selection');
  await page.goto('http://localhost:3000/play/mode');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/manual-01-game-mode.png', fullPage: true });
  console.log('✅ Screenshot: manual-01-game-mode.png');
  
  // Step 2: Click Guest mode
  console.log('\n📍 Step 2: Click Guest mode');
  const guestButton = page.locator('text=Guest').locator('..');
  await guestButton.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/manual-02-after-guest-click.png', fullPage: true });
  console.log('✅ Screenshot: manual-02-after-guest-click.png');
  
  // Step 3: Wait for play page to load
  console.log('\n📍 Step 3: Waiting for play page...');
  await page.waitForURL('**/play', { timeout: 10000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/manual-03-play-page-loaded.png', fullPage: true });
  console.log('✅ Screenshot: manual-03-play-page-loaded.png');
  
  // Step 4: Check Streak Display (should have PixelFlame)
  console.log('\n📍 Step 4: Checking streak display with PixelFlame icon');
  const streakDisplay = page.locator('text=/day streak/i').first();
  if (await streakDisplay.isVisible()) {
    await streakDisplay.locator('..').screenshot({ path: 'test-results/manual-04-streak-flame-icon.png' });
    console.log('✅ Screenshot: manual-04-streak-flame-icon.png');
    console.log('   🔍 CHECK: Should see pixel art flame icon (not emoji)');
  }
  
  // Step 5: Click Login Tab - Check Login Calendar
  console.log('\n📍 Step 5: Opening Login Calendar');
  const loginTab = page.locator('button:has-text("Login")');
  await loginTab.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/manual-05-login-calendar-full.png', fullPage: true });
  console.log('✅ Screenshot: manual-05-login-calendar-full.png');
  console.log('   🔍 CHECK: Should see pixel star, heart, crown icons (not emoji)');
  console.log('   🔍 CHECK: Pink checkmarks for completed days');
  console.log('   🔍 CHECK: Week number if past week 1');
  
  // Capture just the calendar grid
  const calendarGrid = page.locator('.grid-cols-7').first();
  if (await calendarGrid.isVisible()) {
    await calendarGrid.screenshot({ path: 'test-results/manual-06-calendar-grid-closeup.png' });
    console.log('✅ Screenshot: manual-06-calendar-grid-closeup.png');
  }
  
  // Step 6: Click Bounty Tab - Check Cyan Theme
  console.log('\n📍 Step 6: Opening Bounty Hunt');
  const bountyTab = page.locator('button:has-text("Bounty")');
  await bountyTab.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/manual-07-bounty-hunt-full.png', fullPage: true });
  console.log('✅ Screenshot: manual-07-bounty-hunt-full.png');
  console.log('   🔍 CHECK: Cyan button color (not purple)');
  console.log('   🔍 CHECK: Black barcode icon (not emoji)');
  
  // Capture New Bounty button
  const bountyButton = page.locator('button:has-text("New Bounty")');
  if (await bountyButton.isVisible()) {
    await bountyButton.screenshot({ path: 'test-results/manual-08-bounty-button-closeup.png' });
    console.log('✅ Screenshot: manual-08-bounty-button-closeup.png');
  }
  
  // Step 7: Click Badges Tab - Check Category Icons
  console.log('\n📍 Step 7: Opening Category Badges');
  const badgesTab = page.locator('button:has-text("Badges")');
  await badgesTab.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/manual-09-category-badges-full.png', fullPage: true });
  console.log('✅ Screenshot: manual-09-category-badges-full.png');
  console.log('   🔍 CHECK: Pixel art category icons (chip, juice, candy, milk, cookie)');
  console.log('   🔍 CHECK: Icons match badge colors');
  
  // Step 8: Click Products Tab
  console.log('\n📍 Step 8: Opening Products Tab');
  const productsTab = page.locator('button:has-text("Products")');
  await productsTab.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/manual-10-products-tab.png', fullPage: true });
  console.log('✅ Screenshot: manual-10-products-tab.png');
  console.log('   🔍 CHECK: Category icons in product cards (if any products exist)');
  
  // Step 9: Click History Tab
  console.log('\n📍 Step 9: Opening History Tab');
  const historyTab = page.locator('button:has-text("History")');
  await historyTab.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/manual-11-history-tab.png', fullPage: true });
  console.log('✅ Screenshot: manual-11-history-tab.png');
  
  // Step 10: Final Overview
  console.log('\n📍 Step 10: Capturing final overview');
  await page.screenshot({ path: 'test-results/manual-12-final-overview.png', fullPage: true });
  console.log('✅ Screenshot: manual-12-final-overview.png');
  
  // Keep browser open for manual inspection
  console.log('\n✅ ALL SCREENSHOTS CAPTURED!');
  console.log('\n📋 MANUAL VERIFICATION CHECKLIST:');
  console.log('   □ Streak display has pixel flame icon (not 🔥 emoji)');
  console.log('   □ Login calendar has pixel star/heart/crown icons');
  console.log('   □ Completed days show pink checkmark');
  console.log('   □ Bounty button is CYAN (not purple)');
  console.log('   □ Bounty has black barcode icon');
  console.log('   □ Category badges have pixel art icons');
  console.log('   □ All icons are sharp/pixelated (not blurry)');
  console.log('   □ No animations on static icons\n');
  
  // Wait 10 seconds for manual review
  console.log('⏰ Browser will stay open for 10 seconds for manual review...\n');
  await page.waitForTimeout(10000);
});
