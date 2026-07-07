import { test, chromium } from '@playwright/test';

test('Pet stats should persist after feed and refresh', async () => {
  test.setTimeout(180000); // 3 minutes
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Console logging
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('SAVE PROFILE') || text.includes('GET') || text.includes('POST')) {
      console.log(`🖥️  ${text}`);
    }
  });
  
  // Network failures
  page.on('response', async (response) => {
    if (response.url().includes('/api/profile')) {
      const status = response.status();
      console.log(`📡 ${response.request().method()} /api/profile - Status: ${status}`);
      
      if (status >= 400) {
        try {
          const body = await response.text();
          console.log(`❌ ERROR Response:`, body);
        } catch {}
      }
    }
  });
  
  try {
    console.log('\n🎬 Starting test...\n');
    
    console.log('Step 1: Navigate to Arashu login');
    await page.goto('http://localhost:3000/play/mode/arashu-login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(2000);
    
    console.log('Step 2: Fill login form');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('tester@scanchan.com');
    await passwordInput.fill('password123');
    
    console.log('Step 3: Submit login');
    const loginButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("Login")'));
    await loginButton.click();
    
    // Wait for navigation
    await page.waitForURL('**/play', { timeout: 15000 }).catch(() => {
      console.log('Navigation timeout - checking if already on play page');
    });
    
    await page.waitForTimeout(4000);
    
    console.log('Step 4: Wait for Hunger text (indicating page loaded)');
    await page.waitForSelector('text=Hunger', { timeout: 20000 });
    await page.waitForTimeout(2000);
    
    console.log('Step 5: Get Zustand store state');
    const storeCheck = await page.evaluate(() => {
      // Try different ways to access the store
      const win = window as any;
      
      if (win.usePlayerStoreImpl) {
        return { found: 'usePlayerStoreImpl', state: win.usePlayerStoreImpl.getState() };
      }
      if (win.__PLAYER_STORE__) {
        return { found: '__PLAYER_STORE__', state: win.__PLAYER_STORE__ };
      }
      
      return { found: 'none', state: null };
    });
    
    console.log('   Store access:', storeCheck.found);
    console.log('   Initial stats:', {
      hunger: storeCheck.state?.petHunger,
      affection: storeCheck.state?.petAffection,
    });
    
    console.log('Step 6: Update stats in store (simulate feed)');
    await page.evaluate(() => {
      const win = window as any;
      const store = win.usePlayerStoreImpl;
      
      if (store && store.setState) {
        store.setState({
          petHunger: 92,
          petAffection: 78,
        });
        console.log('✅ Stats updated in store');
      } else {
        console.log('❌ Could not update store');
      }
    });
    
    console.log('Step 7: Wait for auto-save (500ms debounce + 2s buffer)');
    await page.waitForTimeout(3000);
    
    console.log('Step 8: Get stats before refresh');
    const beforeRefresh = await page.evaluate(() => {
      const win = window as any;
      const store = win.usePlayerStoreImpl?.getState();
      return {
        hunger: store?.petHunger,
        affection: store?.petAffection,
      };
    });
    console.log('   Before:', beforeRefresh);
    
    console.log('Step 9: REFRESH PAGE');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    
    console.log('Step 10: Get stats after refresh');
    await page.waitForSelector('text=Hunger', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    const afterRefresh = await page.evaluate(() => {
      const win = window as any;
      const store = win.usePlayerStoreImpl?.getState();
      return {
        hunger: store?.petHunger,
        affection: store?.petAffection,
      };
    });
    console.log('   After:', afterRefresh);
    
    console.log('\n📊 FINAL RESULTS:');
    console.log('='.repeat(70));
    console.log(`BEFORE: hunger=${beforeRefresh.hunger}, affection=${beforeRefresh.affection}`);
    console.log(`AFTER:  hunger=${afterRefresh.hunger}, affection=${afterRefresh.affection}`);
    console.log('='.repeat(70));
    
    if (beforeRefresh.hunger === afterRefresh.hunger && 
        beforeRefresh.affection === afterRefresh.affection) {
      console.log('✅ SUCCESS! Stats persisted!');
    } else {
      console.log('❌ FAILED! Stats reset!');
    }
    
    console.log('\n⏰ Browser will stay open for 20 seconds for inspection...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('\n❌ Test error:', error);
    console.log('\n⏰ Browser will stay open for 30 seconds...');
    await page.waitForTimeout(30000);
    throw error;
  } finally {
    await browser.close();
  }
});
