const { chromium } = require('@playwright/test');

(async () => {
  let browser;
  try {
    console.log('Launching browser...');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('Navigating to http://127.0.0.1:3000...');
    await page.goto('http://127.0.0.1:3000', { timeout: 10000 });
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
    
    const title = await page.title();
    const url = page.url();
    
    console.log('SUCCESS:');
    console.log('  Title:', title);
    console.log('  URL:', url);
    console.log('  Screenshot: test-screenshot.png');
    
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('FAILED:');
    console.error('  Error:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
