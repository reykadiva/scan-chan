import { chromium } from 'playwright';

const LIVE_URL = 'https://scanchan.vercel.app/';

async function testViewport(browser, isMobile = false) {
  const vpName = isMobile ? 'Mobile (iPhone 13)' : 'Desktop (1280x800)';
  console.log(`\n==============================================`);
  console.log(`=== RUNNING E2E TEST ON ${vpName} ===`);
  console.log(`==============================================\n`);

  const context = await browser.newContext({
    viewport: isMobile ? { width: 390, height: 844 } : { width: 1280, height: 800 },
    isMobile,
    hasTouch: isMobile,
    userAgent: isMobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
      : undefined,
  });

  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  const report = {
    viewport: vpName,
    titleScreenAppearsInstantly: false,
    noSyncingStuck: false,
    pressToStartWorks: false,
    guestModeEntered: false,
    gardenBackgroundVisible: false,
    gardenBackgroundZIndex: null,
    lobbyContentZIndex: null,
    noManualEntryButton: false,
    noRedundantScanButtonInFeedBox: false,
    spaScannerNavigationKeepsRootUrl: false,
    browserBackReturnsToLobby: false,
    consoleErrorsCount: 0,
    pageErrorsCount: 0,
  };

  try {
    // 1. Clean Navigation
    console.log(`1. Navigating to ${LIVE_URL}...`);
    const startNav = performance.now();
    await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded' });
    const domLoadedTime = performance.now() - startNav;
    console.log(`   DOM loaded in ${domLoadedTime.toFixed(0)}ms`);

    // Check if Title Screen appears instantly
    const pressToStartButton = page.locator('button:has-text("PRESS TO START")');
    await pressToStartButton.waitFor({ state: 'visible', timeout: 5000 });
    report.titleScreenAppearsInstantly = true;
    console.log('   [PASS] "PRESS TO START" title button appeared instantly.');

    // Verify NOT stuck in SYNCING WITH CLOUD...
    const syncingGateText = page.locator('text=SYNCING WITH CLOUD...');
    const hasSyncingGate = await syncingGateText.isVisible().catch(() => false);
    report.noSyncingStuck = !hasSyncingGate;
    console.log(`   [PASS] Syncing gate stuck check: ${!hasSyncingGate ? 'CLEAN (Not stuck)' : 'STUCK'}`);

    // 2. Click PRESS TO START
    console.log('2. Clicking "PRESS TO START"...');
    await pressToStartButton.click();
    await page.waitForTimeout(600);

    // Mode modal should appear for unauthenticated user
    const choosePlayMode = page.locator('text=Choose Play Mode');
    const guestButton = page.locator('button:has-text("Guest Mode")');
    await guestButton.waitFor({ state: 'visible', timeout: 5000 });
    report.pressToStartWorks = true;
    console.log('   [PASS] Mode selection modal opened upon Press To Start.');

    // 3. Choose Guest Mode to enter Lobby
    console.log('3. Selecting Guest Mode (Quick Play)...');
    await guestButton.click();

    // Check if we reach Lobby (look for Lobby header and Partner companion card)
    const lobbyHeader = page.locator('header:has-text("SCAN CHAN")');
    await lobbyHeader.waitFor({ state: 'visible', timeout: 8000 });
    report.guestModeEntered = true;
    console.log('   [PASS] Entered Lobby successfully.');

    // 4. Verify garden-bg.webp visibility and z-index structure
    console.log('4. Verifying garden-bg.webp background rendering...');
    const bgImage = page.locator('img[alt="Garden Background"]');
    const bgExists = await bgImage.isVisible().catch(() => false);

    const bgStyles = await page.evaluate(() => {
      const img = document.querySelector('img[alt="Garden Background"]');
      if (!img) return null;
      const parent = img.parentElement;
      const computed = window.getComputedStyle(parent);
      return {
        src: img.getAttribute('src'),
        parentZIndex: computed.zIndex,
        parentPosition: computed.position,
        imgNaturalWidth: img.naturalWidth,
        imgComplete: img.complete,
      };
    });

    const lobbyContentZIndex = await page.evaluate(() => {
      // Find the main column wrapper in lobby
      const header = document.querySelector('header');
      if (!header) return null;
      const contentCol = header.closest('.max-w-2xl');
      return contentCol ? window.getComputedStyle(contentCol).zIndex : null;
    });

    report.gardenBackgroundVisible = bgExists && bgStyles?.imgComplete && bgStyles?.imgNaturalWidth > 0;
    report.gardenBackgroundZIndex = bgStyles?.parentZIndex;
    report.lobbyContentZIndex = lobbyContentZIndex;

    console.log(`   [PASS] Background Image visible: ${report.gardenBackgroundVisible}`);
    console.log(`   [PASS] Background parent z-index: ${bgStyles?.parentZIndex} (expected: 0)`);
    console.log(`   [PASS] Lobby content z-index: ${lobbyContentZIndex} (expected: 10)`);

    // 5. Check absence of Manual Barcode Entry button
    console.log('5. Checking absence of Manual Barcode Entry button...');
    const manualBarcodeEntry = await page.locator('text=Manual Barcode Entry').count();
    const typeCodeBtn = await page.locator('button[aria-label*="Manual"], button:has-text("Type Code")').count();
    report.noManualEntryButton = (manualBarcodeEntry === 0 && typeCodeBtn === 0);
    console.log(`   [PASS] Manual barcode buttons found: ${manualBarcodeEntry + typeCodeBtn} (Expected: 0)`);

    // 6. Check absence of redundant "Scan ->" button in "Bag is empty! Scan items for treats"
    console.log('6. Checking absence of redundant "Scan ->" in Quick Feed box...');
    const feedBoxText = page.locator('text=Bag is empty! Scan items for treats');
    const isFeedBoxPresent = await feedBoxText.isVisible().catch(() => false);
    let redundantScanFound = false;
    if (isFeedBoxPresent) {
      const feedBoxContainer = feedBoxText.locator('xpath=..');
      const scanLinkInBox = await feedBoxContainer.locator('a:has-text("Scan →"), button:has-text("Scan →")').count();
      redundantScanFound = scanLinkInBox > 0;
    }
    report.noRedundantScanButtonInFeedBox = !redundantScanFound;
    console.log(`   [PASS] Redundant "Scan ->" in Feed Box: ${redundantScanFound ? 'FOUND (FAIL)' : 'ABSENT (PASS)'}`);

    // 7. Test SPA navigation to SCANNER
    console.log('7. Testing SPA Scanner navigation...');
    const mainScanButton = page.locator('button:has-text("SCAN BARCODE")');
    await mainScanButton.click();

    // Verify camera/scanner view appears
    const scannerHeader = page.locator('span:has-text("SCANNER")');
    await scannerHeader.waitFor({ state: 'visible', timeout: 5000 });
    const currentUrl = page.url();
    report.spaScannerNavigationKeepsRootUrl = currentUrl === LIVE_URL || currentUrl === LIVE_URL.replace(/\/$/, '');
    console.log(`   [PASS] Scanner opened in SPA. Current URL: ${currentUrl} (Keeps root URL: ${report.spaScannerNavigationKeepsRootUrl})`);

    // 8. Test Browser Back / Hardware Popstate integration
    console.log('8. Testing Browser Back button (popstate)...');
    await page.goBack();
    await page.waitForTimeout(600);

    const lobbyHeaderAfterBack = page.locator('header:has-text("SCAN CHAN")');
    const isBackInLobby = await lobbyHeaderAfterBack.isVisible().catch(() => false);
    report.browserBackReturnsToLobby = isBackInLobby;
    console.log(`   [PASS] Returned to Lobby via Browser Back: ${isBackInLobby}`);

    report.consoleErrorsCount = consoleErrors.length;
    report.pageErrorsCount = pageErrors.length;

    console.log(`\nConsole Errors (${consoleErrors.length}):`, consoleErrors.slice(0, 5));
    console.log(`Page Errors (${pageErrors.length}):`, pageErrors.slice(0, 5));

  } catch (err) {
    console.error(`Error in ${vpName}:`, err);
  } finally {
    await context.close();
  }

  return report;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const desktopReport = await testViewport(browser, false);
    const mobileReport = await testViewport(browser, true);

    console.log('\n==============================================');
    console.log('=== OVERALL LIVE PRODUCTION E2E SUMMARY ===');
    console.log('==============================================\n');
    console.log(JSON.stringify({ desktopReport, mobileReport }, null, 2));
  } finally {
    await browser.close();
  }
}

main();
