const { chromium } = require('@playwright/test');

(async () => {
  let browser;
  try {
    console.log('Launching browser...');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('Navigating to root (/)...');
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 15000 });
    
    const rootUrl = page.url();
    const rootTitle = await page.title();
    console.log('Root page:');
    console.log('  Title:', rootTitle);
    console.log('  URL:', rootUrl);
    
    await page.screenshot({ path: 'screenshot-root.png', fullPage: true });
    console.log('  Screenshot: screenshot-root.png');
    
    console.log('\nNavigating to /home...');
    await page.goto('http://127.0.0.1:3000/home', { waitUntil: 'networkidle', timeout: 15000 });
    
    const homeUrl = page.url();
    const homeTitle = await page.title();
    console.log('Home page:');
    console.log('  Title:', homeTitle);
    console.log('  URL:', homeUrl);
    
    await page.screenshot({ path: 'screenshot-home.png', fullPage: true });
    console.log('  Screenshot: screenshot-home.png');
    
    const h1 = await page.locator('h1').first().textContent().catch(() => null);
    const mainContent = await page.locator('main').isVisible().catch(() => false);
    const statCards = await page.locator('[data-slot="stat-card"]').count().catch(() => 0);
    
    console.log('\nObservations:');
    console.log('  Main heading (h1):', h1 || 'Not found');
    console.log('  Main landmark visible:', mainContent);
    console.log('  Stat cards found:', statCards);
    
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(`[ERROR] ${msg.text()}`);
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (consoleMessages.length > 0) {
      console.log('\nConsole Errors:');
      consoleMessages.forEach(msg => console.log('  ', msg));
    } else {
      console.log('\nNo console errors detected');
    }
    
    await browser.close();
    console.log('\nSUCCESS: Browser automation working');
    process.exit(0);
  } catch (error) {
    console.error('\nFAILED:');
    console.error('  Error:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
