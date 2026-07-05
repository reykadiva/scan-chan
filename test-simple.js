const { chromium } = require('@playwright/test');

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto('http://127.0.0.1:3000/home', { timeout: 10000 });
    
    await page.screenshot({ path: 'screenshot-home-final.png', fullPage: true });
    
    const title = await page.title();
    const url = page.url();
    const h1Text = await page.locator('h1').first().textContent({ timeout: 5000 }).catch(() => 'NOT FOUND');
    const mainExists = await page.locator('main').count();
    
    console.log('OBSERVATIONS:');
    console.log('  Page Title:', title);
    console.log('  URL:', url);
    console.log('  H1 Heading:', h1Text);
    console.log('  Main landmarks found:', mainExists);
    console.log('  Screenshot: screenshot-home-final.png');
    
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
