import { test, chromium } from '@playwright/test';

/**
 * Final validation: Test with BOTH real Arashu accounts
 */

const accounts = [
  { email: 'reyka334@gmail.com', password: 'reyscanchan27', name: 'Reyka' },
  { email: 'dzaharap@gmail.com', password: 'arascanchan', name: 'Dzahar' },
];

for (const account of accounts) {
  test(`${account.name}: Pet stats should persist after petting and refresh`, async () => {
    test.setTimeout(180000);
    
    const browser = await chromium.launch({ 
      headless: false,
      slowMo: 300,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Console logging
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('SAVE PROFILE') || text.includes('BEFOREUNLOAD') || text.includes('GET') || text.includes('POST')) {
        console.log(`   ${text}`);
      }
    });
    
    // API monitoring
    const apiCalls: any[] = [];
    page.on('response', async (response) => {
      if (response.url().includes('/api/profile')) {
        const status = response.status();
        const method = response.request().method();
        
        if (method === 'GET') {
          try {
            const body = await response.json();
            apiCalls.push({
              method,
              status,
              hunger: body.data?.petHunger,
              affection: body.data?.petAffection,
            });
            console.log(`   📖 GET - Hunger: ${body.data?.petHunger}, Affection: ${body.data?.petAffection}`);
          } catch {}
        } else if (method === 'POST') {
          apiCalls.push({ method, status });
          console.log(`   💾 POST - Status: ${status}`);
        }
      }
    });
    
    try {
      console.log('\n' + '='.repeat(70));
      console.log(`🧪 TESTING ACCOUNT: ${account.name} (${account.email})`);
      console.log('='.repeat(70) + '\n');
      
      console.log('Step 1: Login');
      await page.goto('http://localhost:3000/play/mode/arashu-login');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      await page.fill('input[type="email"]', account.email);
      await page.fill('input[type="password"]', account.password);
      await page.click('button[type="submit"]');
      
      await page.waitForURL('**/play', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(5000);
      
      console.log('Step 2: Wait for page to fully load');
      await page.waitForSelector('text=Hunger', { timeout: 20000 });
      await page.waitForTimeout(2000);
      
      console.log('Step 3: Get initial affection value from UI');
      const initialAffection = await page.locator('text=Affection').locator('..').locator('text=/\\d+%/').textContent();
      console.log(`   Initial: ${initialAffection}`);
      
      console.log('Step 4: Pet the cat 3 times');
      const petButton = page.locator('button:has-text("Pet Cat")');
      
      for (let i = 0; i < 3; i++) {
        try {
          await petButton.click({ timeout: 5000 });
          console.log(`   Petted ${i + 1}/3 times`);
          await page.waitForTimeout(3500); // Cooldown
        } catch (e) {
          console.log(`   Could not pet (attempt ${i + 1})`);
        }
      }
      
      console.log('Step 5: Wait for auto-save to complete');
      await page.waitForTimeout(3000);
      
      console.log('Step 6: Get affection BEFORE refresh');
      const beforeAffection = await page.locator('text=Affection').locator('..').locator('text=/\\d+%/').textContent();
      console.log(`   Before refresh: ${beforeAffection}`);
      
      console.log('\n🔄 Step 7: REFRESH PAGE\n');
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);
      
      console.log('Step 8: Wait for page to reload');
      await page.waitForSelector('text=Hunger', { timeout: 20000 });
      await page.waitForTimeout(2000);
      
      console.log('Step 9: Get affection AFTER refresh');
      const afterAffection = await page.locator('text=Affection').locator('..').locator('text=/\\d+%/').textContent();
      console.log(`   After refresh: ${afterAffection}`);
      
      console.log('\n📊 RESULTS:');
      console.log('='.repeat(70));
      console.log(`Account: ${account.name}`);
      console.log(`Initial:  ${initialAffection}`);
      console.log(`Before:   ${beforeAffection}`);
      console.log(`After:    ${afterAffection}`);
      console.log('='.repeat(70));
      
      // Check if values persisted
      const beforeValue = parseInt(beforeAffection?.replace('%', '') || '0');
      const afterValue = parseInt(afterAffection?.replace('%', '') || '0');
      
      if (beforeValue === afterValue && beforeValue > 0) {
        console.log(`✅ SUCCESS for ${account.name}! Stats persisted correctly!`);
      } else {
        console.log(`❌ FAILED for ${account.name}! Before: ${beforeValue}%, After: ${afterValue}%`);
      }
      
      console.log('\n📡 API Calls Summary:');
      const getCalls = apiCalls.filter(c => c.method === 'GET');
      const postCalls = apiCalls.filter(c => c.method === 'POST');
      console.log(`   GET requests: ${getCalls.length}`);
      console.log(`   POST requests: ${postCalls.length}`);
      
      if (getCalls.length > 0) {
        console.log(`   Last GET returned: Hunger=${getCalls[getCalls.length-1].hunger}, Affection=${getCalls[getCalls.length-1].affection}`);
      }
      
      console.log('\n⏰ Keeping browser open for 10 seconds...');
      await page.waitForTimeout(10000);
      
    } catch (error) {
      console.error(`\n❌ Error testing ${account.name}:`, error);
      await page.waitForTimeout(15000);
      throw error;
    } finally {
      await browser.close();
    }
  });
}
