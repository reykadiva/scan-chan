const { chromium } = require('@playwright/test');

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto('http://127.0.0.1:3000/home', { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    // Wait a bit for stores to hydrate
    await page.waitForTimeout(3000);
    
    const storeState = await page.evaluate(() => {
      const pet = localStorage.getItem('scan-chan-guest-pet-state');
      const settings = localStorage.getItem('scan-chan-settings-state');
      const game = localStorage.getItem('scan-chan-game-state');
      const inventory = localStorage.getItem('scan-chan-inventory-state');
      
      return {
        pet: pet ? JSON.parse(pet) : null,
        settings: settings ? JSON.parse(settings) : null,
        game: game ? JSON.parse(game) : null,
        inventory: inventory ? JSON.parse(inventory) : null,
      };
    });
    
    console.log('LocalStorage State:');
    console.log('  Pet Store:', storeState.pet ? 'EXISTS' : 'MISSING');
    if (storeState.pet) {
      console.log('    hasHydrated:', storeState.pet.state?.hasHydrated);
      console.log('    isInitialized:', storeState.pet.state?.isInitialized);
      console.log('    name:', storeState.pet.state?.name);
    }
    
    console.log('  Settings Store:', storeState.settings ? 'EXISTS' : 'MISSING');
    if (storeState.settings) {
      console.log('    hasHydrated:', storeState.settings.state?.hasHydrated);
      console.log('    isInitialized:', storeState.settings.state?.isInitialized);
    }
    
    const pageContent = await page.content();
    const hasLoadingText = pageContent.includes('settling in');
    const hasHomeContent = pageContent.includes('Pet summary');
    
    console.log('\nPage Content:');
    console.log('  Shows loading:', hasLoadingText);
    console.log('  Shows home content:', hasHomeContent);
    
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
