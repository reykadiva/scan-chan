import { test, expect } from '@playwright/test';

/**
 * Visual E2E Tests for Pixel Icons
 * Tests with browser visible for manual verification
 */

test.describe('Pixel Icons Visual Tests', () => {
  
  test('Visual Test 1: Check pixel icons on main play page', async ({ page }) => {
    console.log('🔍 Test 1: Opening play page...');
    await page.goto('http://localhost:3000/play');
    await page.waitForTimeout(3000); // Wait for page to fully load
    
    // Take screenshot of entire page
    await page.screenshot({ path: 'test-results/01-play-page-full.png', fullPage: true });
    console.log('✅ Screenshot saved: 01-play-page-full.png');
    
    // Check for pixel flame icon in streak display
    const streakSection = page.locator('text=/day streak/i').first();
    if (await streakSection.isVisible()) {
      await streakSection.screenshot({ path: 'test-results/02-streak-display.png' });
      console.log('✅ Streak display found and captured');
    }
    
    // Click Login tab to see calendar
    const loginTab = page.locator('button:has-text("Login")');
    if (await loginTab.isVisible()) {
      await loginTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/03-login-calendar.png', fullPage: true });
      console.log('✅ Login calendar captured');
      
      // Check for SVG pixel icons in calendar
      const svgIcons = page.locator('.grid-cols-7 svg');
      const iconCount = await svgIcons.count();
      console.log(`✅ Found ${iconCount} SVG pixel icons in calendar`);
      expect(iconCount).toBeGreaterThan(0);
    }
  });

  test('Visual Test 2: Check category badges with pixel icons', async ({ page }) => {
    console.log('🔍 Test 2: Checking category badges...');
    await page.goto('http://localhost:3000/play');
    await page.waitForTimeout(2000);
    
    // Click Badges tab
    const badgesTab = page.locator('button:has-text("Badges")');
    if (await badgesTab.isVisible()) {
      await badgesTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/04-category-badges.png', fullPage: true });
      console.log('✅ Category badges captured');
      
      // Count pixel icons in badges
      const badgeIcons = page.locator('svg').filter({ has: page.locator('rect') });
      const iconCount = await badgeIcons.count();
      console.log(`✅ Found ${iconCount} pixel art icons in badges`);
    }
  });

  test('Visual Test 3: Check bounty hunt cyan theme', async ({ page }) => {
    console.log('🔍 Test 3: Checking bounty hunt...');
    await page.goto('http://localhost:3000/play');
    await page.waitForTimeout(2000);
    
    // Click Bounty tab
    const bountyTab = page.locator('button:has-text("Bounty")');
    if (await bountyTab.isVisible()) {
      await bountyTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/05-bounty-hunt.png', fullPage: true });
      console.log('✅ Bounty hunt captured');
      
      // Check for New Bounty button with cyan background
      const newBountyBtn = page.locator('button:has-text("New Bounty")');
      if (await newBountyBtn.isVisible()) {
        await newBountyBtn.screenshot({ path: 'test-results/06-bounty-button.png' });
        console.log('✅ Bounty button captured - check for cyan color');
        
        // Check if button has cyan class
        const btnClass = await newBountyBtn.getAttribute('class');
        const hasCyan = btnClass?.includes('cyan');
        console.log(`✅ Cyan theme present: ${hasCyan}`);
      }
    }
  });

  test('Visual Test 4: Check login calendar week display', async ({ page }) => {
    console.log('🔍 Test 4: Checking login calendar week...');
    await page.goto('http://localhost:3000/play');
    await page.waitForTimeout(2000);
    
    // Click Login tab
    const loginTab = page.locator('button:has-text("Login")');
    await loginTab.click();
    await page.waitForTimeout(1000);
    
    // Check for Day 1-7
    const day1 = page.locator('text=/Day 1/i');
    const day7 = page.locator('text=/Day 7/i');
    
    if (await day1.isVisible() && await day7.isVisible()) {
      console.log('✅ Week 1 (Day 1-7) is visible');
      
      // Capture just the calendar grid
      const calendarGrid = page.locator('.grid-cols-7').first();
      await calendarGrid.screenshot({ path: 'test-results/07-calendar-grid.png' });
      console.log('✅ Calendar grid captured');
    }
    
    // Check for week number (if past week 1)
    const weekIndicator = page.locator('text=/Week \\d+/i');
    if (await weekIndicator.isVisible()) {
      const weekText = await weekIndicator.textContent();
      console.log(`✅ Week indicator found: ${weekText}`);
    } else {
      console.log('✅ Week 1 (no week number shown - expected)');
    }
  });

  test('Visual Test 5: Full page overview with all features', async ({ page }) => {
    console.log('🔍 Test 5: Complete overview...');
    await page.goto('http://localhost:3000/play');
    await page.waitForTimeout(3000);
    
    // Capture initial state
    await page.screenshot({ path: 'test-results/08-overview-start.png', fullPage: true });
    
    // Check each tab
    const tabs = ['Missions', 'Login', 'Bounty', 'Badges', 'History', 'Products'];
    
    for (let i = 0; i < tabs.length; i++) {
      const tabName = tabs[i];
      const tab = page.locator(`button:has-text("${tabName}")`);
      
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ 
          path: `test-results/09-tab-${i + 1}-${tabName.toLowerCase()}.png`,
          fullPage: true 
        });
        console.log(`✅ ${tabName} tab captured`);
      }
    }
    
    console.log('✅ All tabs captured!');
  });
});
