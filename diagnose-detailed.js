const { chromium } = require('@playwright/test');

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Capture console logs
    const logs = [];
    page.on('console', msg => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    await page.goto('http://127.0.0.1:3000/home', { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    // Wait for stores to initialize
    await page.waitForTimeout(5000);
    
    // Check store state via window object
    const storeState = await page.evaluate(() => {
      // Access Zustand stores via window if they're exposed
      return {
        hasWindow: typeof window !== 'undefined',
        hasLocalStorage: typeof localStorage !== 'undefined',
        localStorageKeys: Object.keys(localStorage),
      };
    });
    
    console.log('Browser Environment:');
    console.log('  Has window:', storeState.hasWindow);
    console.log('  Has localStorage:', storeState.hasLocalStorage);
    console.log('  LocalStorage keys:', storeState.localStorageKeys);
    
    console.log('\nConsole logs from page:');
    logs.forEach(log => console.log('  ', log));
    
    const h1 = await page.locator('h1').first().textContent({ timeout: 1000 }).catch(() => null);
    const loadingState = await page.getByText(/settling in/i).isVisible().catch(() => false);
    
    console.log('\nPage State:');
    console.log('  H1:', h1 || 'NOT FOUND');
    console.log('  Loading state visible:', loadingState);
    
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
