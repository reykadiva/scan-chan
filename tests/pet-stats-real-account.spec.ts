import { test, chromium } from '@playwright/test';

/**
 * Test with REAL Arashu accounts to verify database persistence
 */
test('Real account: Pet stats should persist', async () => {
  test.setTimeout(180000);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture ALL console logs
  page.on('console', (msg) => {
    const text = msg.text();
    console.log(`🖥️  ${text}`);
  });
  
  // Network monitoring
  page.on('response', async (response) => {
    if (response.url().includes('/api/profile')) {
      const status = response.status();
      const method = response.request().method();
      console.log(`📡 ${method} /api/profile - Status: ${status}`);
      
      try {
        const body = await response.json();
        if (method === 'GET') {
          console.log(`   📖 GET Response - Hunger: ${body.data?.petHunger}, Affection: ${body.data?.petAffection}`);
        }
      } catch {}
    }
  });
  
  try {
    console.log('\n🎬 TEST WITH REAL ACCOUNT\n');
    
    // TEST ACCOUNT 1: reyka334@gmail.com
    const email = 'reyka334@gmail.com';
    const password = 'reyscanchan27';
    
    console.log(`Step 1: Login with ${email}`);
    await page.goto('http://localhost:3000/play/mode/arashu-login');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/play', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(4000);
    
    console.log('Step 2: Wait for page load');
    await page.waitForSelector('text=Hunger', { timeout: 20000 });
    await page.waitForTimeout(3000);
    
    console.log('Step 3: Check INITIAL stats from UI');
    const initialUI = await page.evaluate(() => {
      const hungerText = document.querySelector('[class*="text"]:has-text("Hunger")')?.parentElement?.querySelector('[class*="text"]:last-child')?.textContent;
      const affectionText = document.querySelector('[class*="text"]:has-text("Affection")')?.parentElement?.querySelector('[class*="text"]:last-child')?.textContent;
      
      return {
        hungerUI: hungerText,
        affectionUI: affectionText,
      };
    });
    console.log('   Initial UI:', initialUI);
    
    console.log('Step 4: Pet the cat 5 times (increase affection)');
    const petButton = page.locator('button:has-text("Pet Cat")');
    for (let i = 0; i < 5; i++) {
      try {
        await petButton.click({ timeout: 5000 });
        await page.waitForTimeout(3500); // Wait for cooldown
        console.log(`   Petted ${i + 1}/5 times`);
      } catch {
        console.log(`   Pet button not found on attempt ${i + 1}`);
      }
    }
    
    console.log('Step 5: Wait for saves to complete (500ms * 5 + buffer)');
    await page.waitForTimeout(5000);
    
    console.log('Step 6: Check stats BEFORE refresh');
    const beforeUI = await page.evaluate(() => {
      const hungerText = document.querySelector('[class*="text"]:has-text("Hunger")')?.parentElement?.querySelector('[class*="text"]:last-child')?.textContent;
      const affectionText = document.querySelector('[class*="text"]:has-text("Affection")')?.parentElement?.querySelector('[class*="text"]:last-child')?.textContent;
      
      return {
        hungerUI: hungerText,
        affectionUI: affectionText,
      };
    });
    console.log('   Before refresh:', beforeUI);
    
    console.log('\n🔄 Step 7: REFRESH PAGE (critical moment!)');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    console.log('Step 8: Check stats AFTER refresh');
    await page.waitForSelector('text=Hunger', { timeout: 20000 });
    await page.waitForTimeout(2000);
    
    const afterUI = await page.evaluate(() => {
      const hungerText = document.querySelector('[class*="text"]:has-text("Hunger")')?.parentElement?.querySelector('[class*="text"]:last-child')?.textContent;
      const affectionText = document.querySelector('[class*="text"]:has-text("Affection")')?.parentElement?.querySelector('[class*="text"]:last-child')?.textContent;
      
      return {
        hungerUI: hungerText,
        affectionUI: affectionText,
      };
    });
    console.log('   After refresh:', afterUI);
    
    console.log('\n📊 COMPARISON:');
    console.log('='.repeat(70));
    console.log(`BEFORE: ${beforeUI.hungerUI} hunger, ${beforeUI.affectionUI} affection`);
    console.log(`AFTER:  ${afterUI.hungerUI} hunger, ${afterUI.affectionUI} affection`);
    console.log('='.repeat(70));
    
    if (beforeUI.affectionUI === afterUI.affectionUI) {
      console.log('✅ SUCCESS! Stats persisted correctly!');
    } else {
      console.log('❌ FAILED! Stats were reset after refresh!');
      console.log('\n⚠️  Check server terminal for API logs!');
    }
    
    console.log('\n⏰ Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n❌ Test error:', error);
    await page.waitForTimeout(30000);
    throw error;
  } finally {
    await browser.close();
  }
});
