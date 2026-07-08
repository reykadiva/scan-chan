# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: manual-visual-test.spec.ts >> MANUAL VISUAL TEST: Complete pixel icons verification
- Location: tests\manual-visual-test.spec.ts:9:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - img "Scan Chan logo" [ref=e8]
        - generic [ref=e243]: Game Hub
      - generic [ref=e244]:
        - button "Mute Audio" [ref=e245] [cursor=pointer]:
          - img [ref=e246]
        - button "Gray pixel cat Exit" [ref=e250]:
          - img "Gray pixel cat" [ref=e251]
          - text: Exit
    - generic [ref=e577]:
      - generic [ref=e578]:
        - generic [ref=e579]:
          - img "Calico pixel cat" [ref=e581]
          - generic [ref=e816]:
            - generic [ref=e817]:
              - heading "dadw" [level=2] [ref=e818]
              - generic "1-day streak" [ref=e819]:
                - img [ref=e820]
                - text: "1"
            - generic [ref=e914]:
              - generic [ref=e915]: LVL 1
              - generic [ref=e916]: 0 / 300 XP
        - generic [ref=e918]:
          - link "Teal pixel cat Scan Barcode" [ref=e919] [cursor=pointer]:
            - /url: /scan
            - button "Teal pixel cat Scan Barcode" [ref=e920]:
              - img "Teal pixel cat" [ref=e921]
              - text: Scan Barcode
          - button "Pinky pixel cat Register Product" [ref=e1198]:
            - img "Pinky pixel cat" [ref=e1199]
            - text: Register Product
      - generic [ref=e1514]:
        - generic [ref=e1515]:
          - generic "Click me to play!" [ref=e1516] [cursor=pointer]:
            - img "Calico pixel cat" [ref=e1517]
          - generic [ref=e1752]:
            - generic [ref=e1753]:
              - generic [ref=e1754]:
                - heading "Scan-chan Jr." [level=3] [ref=e1755]
                - button [ref=e1756]:
                  - img [ref=e1757]
              - generic [ref=e1759]:
                - generic [ref=e1760]: Kitten
                - button "💖 Pet Cat" [ref=e1761] [cursor=pointer]
            - generic [ref=e1762]:
              - generic [ref=e1764]:
                - generic [ref=e1765]:
                  - img [ref=e1766]
                  - text: hunger
                - generic [ref=e1924]: 50/100
              - generic [ref=e1940]:
                - generic [ref=e1941]:
                  - img [ref=e1942]
                  - text: happiness
                - generic [ref=e2100]: 10/100
        - generic [ref=e2115]:
          - heading "Feed Pet (Food Inventory)" [level=4] [ref=e2116]:
            - img [ref=e2117]
            - text: Feed Pet (Food Inventory)
          - paragraph [ref=e2275]: Food items collected from scanning products (Snack, Drink, Candy, Biscuit, Dairy).
          - generic [ref=e2276]:
            - img [ref=e2277]
            - heading "No Food Yet!" [level=3] [ref=e2293]
            - paragraph [ref=e2294]: Scan some snacks or beverages to feed your pet
        - generic [ref=e2295]:
          - heading "Room Background" [level=4] [ref=e2296]:
            - img [ref=e2297]
            - text: Room Background
          - generic [ref=e2455]:
            - button "🛋️ Cozy Bedroom ✓" [ref=e2456] [cursor=pointer]:
              - generic [ref=e2458]: 🛋️
              - generic [ref=e2459]: Cozy Bedroom
              - generic [ref=e2460]: ✓
            - button "🌸 Kawaii Garden 🔒 Lv.3" [disabled] [ref=e2461] [cursor=pointer]:
              - generic [ref=e2463]: 🌸
              - generic [ref=e2464]: Kawaii Garden
              - generic [ref=e2465]: 🔒 Lv.3
      - generic [ref=e2466]:
        - button "Tabby pixel cat Missions" [ref=e2467]:
          - img "Tabby pixel cat" [ref=e2468]
          - text: Missions
        - button "Calico pixel cat Login" [ref=e2831]:
          - img "Calico pixel cat" [ref=e2832]
          - text: Login
        - button "Tabby pixel cat Bounty" [active] [ref=e3142]:
          - img "Tabby pixel cat" [ref=e3143]
          - text: Bounty
        - button "Teal pixel cat Stats" [ref=e3420]:
          - img "Teal pixel cat" [ref=e3421]
          - text: Stats
        - button "Shadow pixel cat Roadmap" [ref=e3689]:
          - img "Shadow pixel cat" [ref=e3690]
          - text: Roadmap
        - button "Pinky pixel cat Badges" [ref=e3963]:
          - img "Pinky pixel cat" [ref=e3964]
          - text: Badges
        - button "Gray pixel cat History" [ref=e4274]:
          - img "Gray pixel cat" [ref=e4275]
          - text: History
        - button "Pinky pixel cat Products" [ref=e4548]:
          - img "Pinky pixel cat" [ref=e4549]
          - text: Products
      - generic [ref=e4865]:
        - generic [ref=e4866]:
          - heading "Tabby pixel cat Bounty Hunt" [level=3] [ref=e4867]:
            - img "Tabby pixel cat" [ref=e4868]
            - text: Bounty Hunt
          - button "New Bounty" [ref=e5145] [cursor=pointer]:
            - img [ref=e5146]
            - text: New Bounty
        - generic [ref=e5153]:
          - img "Gray pixel cat" [ref=e5155]
          - paragraph [ref=e5410]: No active bounty
          - paragraph [ref=e5411]: Tap "New Bounty" to get a cat request! Complete it to earn bonus XP~
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e5417] [cursor=pointer]:
    - img [ref=e5418]
  - alert [ref=e5421]
```

# Test source

```ts
  1   | import { test } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Manual Visual Test - Complete User Journey
  5   |  * This will open browser and navigate through the entire app
  6   |  * so we can visually verify all pixel icons
  7   |  */
  8   | 
  9   | test('MANUAL VISUAL TEST: Complete pixel icons verification', async ({ page }) => {
  10  |   console.log('\n🚀 Starting Manual Visual Test...\n');
  11  |   
  12  |   // Step 1: Choose Game Mode
  13  |   console.log('📍 Step 1: Navigate to game mode selection');
  14  |   await page.goto('http://localhost:3000/play/mode');
  15  |   await page.waitForTimeout(2000);
  16  |   await page.screenshot({ path: 'test-results/manual-01-game-mode.png', fullPage: true });
  17  |   console.log('✅ Screenshot: manual-01-game-mode.png');
  18  |   
  19  |   // Step 2: Click Guest mode
  20  |   console.log('\n📍 Step 2: Click Guest mode');
  21  |   const guestButton = page.locator('text=Guest').locator('..');
  22  |   await guestButton.click();
  23  |   await page.waitForTimeout(2000);
  24  |   await page.screenshot({ path: 'test-results/manual-02-after-guest-click.png', fullPage: true });
  25  |   console.log('✅ Screenshot: manual-02-after-guest-click.png');
  26  |   
  27  |   // Step 3: Wait for play page to load
  28  |   console.log('\n📍 Step 3: Waiting for play page...');
  29  |   await page.waitForURL('**/play', { timeout: 10000 });
  30  |   await page.waitForTimeout(3000);
  31  |   await page.screenshot({ path: 'test-results/manual-03-play-page-loaded.png', fullPage: true });
  32  |   console.log('✅ Screenshot: manual-03-play-page-loaded.png');
  33  |   
  34  |   // Step 4: Check Streak Display (should have PixelFlame)
  35  |   console.log('\n📍 Step 4: Checking streak display with PixelFlame icon');
  36  |   const streakDisplay = page.locator('text=/day streak/i').first();
  37  |   if (await streakDisplay.isVisible()) {
  38  |     await streakDisplay.locator('..').screenshot({ path: 'test-results/manual-04-streak-flame-icon.png' });
  39  |     console.log('✅ Screenshot: manual-04-streak-flame-icon.png');
  40  |     console.log('   🔍 CHECK: Should see pixel art flame icon (not emoji)');
  41  |   }
  42  |   
  43  |   // Step 5: Click Login Tab - Check Login Calendar
  44  |   console.log('\n📍 Step 5: Opening Login Calendar');
  45  |   const loginTab = page.locator('button:has-text("Login")');
  46  |   await loginTab.click();
  47  |   await page.waitForTimeout(1500);
  48  |   await page.screenshot({ path: 'test-results/manual-05-login-calendar-full.png', fullPage: true });
  49  |   console.log('✅ Screenshot: manual-05-login-calendar-full.png');
  50  |   console.log('   🔍 CHECK: Should see pixel star, heart, crown icons (not emoji)');
  51  |   console.log('   🔍 CHECK: Pink checkmarks for completed days');
  52  |   console.log('   🔍 CHECK: Week number if past week 1');
  53  |   
  54  |   // Capture just the calendar grid
  55  |   const calendarGrid = page.locator('.grid-cols-7').first();
  56  |   if (await calendarGrid.isVisible()) {
  57  |     await calendarGrid.screenshot({ path: 'test-results/manual-06-calendar-grid-closeup.png' });
  58  |     console.log('✅ Screenshot: manual-06-calendar-grid-closeup.png');
  59  |   }
  60  |   
  61  |   // Step 6: Click Bounty Tab - Check Cyan Theme
  62  |   console.log('\n📍 Step 6: Opening Bounty Hunt');
  63  |   const bountyTab = page.locator('button:has-text("Bounty")');
  64  |   await bountyTab.click();
> 65  |   await page.waitForTimeout(1500);
      |              ^ Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
  66  |   await page.screenshot({ path: 'test-results/manual-07-bounty-hunt-full.png', fullPage: true });
  67  |   console.log('✅ Screenshot: manual-07-bounty-hunt-full.png');
  68  |   console.log('   🔍 CHECK: Cyan button color (not purple)');
  69  |   console.log('   🔍 CHECK: Black barcode icon (not emoji)');
  70  |   
  71  |   // Capture New Bounty button
  72  |   const bountyButton = page.locator('button:has-text("New Bounty")');
  73  |   if (await bountyButton.isVisible()) {
  74  |     await bountyButton.screenshot({ path: 'test-results/manual-08-bounty-button-closeup.png' });
  75  |     console.log('✅ Screenshot: manual-08-bounty-button-closeup.png');
  76  |   }
  77  |   
  78  |   // Step 7: Click Badges Tab - Check Category Icons
  79  |   console.log('\n📍 Step 7: Opening Category Badges');
  80  |   const badgesTab = page.locator('button:has-text("Badges")');
  81  |   await badgesTab.click();
  82  |   await page.waitForTimeout(1500);
  83  |   await page.screenshot({ path: 'test-results/manual-09-category-badges-full.png', fullPage: true });
  84  |   console.log('✅ Screenshot: manual-09-category-badges-full.png');
  85  |   console.log('   🔍 CHECK: Pixel art category icons (chip, juice, candy, milk, cookie)');
  86  |   console.log('   🔍 CHECK: Icons match badge colors');
  87  |   
  88  |   // Step 8: Click Products Tab
  89  |   console.log('\n📍 Step 8: Opening Products Tab');
  90  |   const productsTab = page.locator('button:has-text("Products")');
  91  |   await productsTab.click();
  92  |   await page.waitForTimeout(1500);
  93  |   await page.screenshot({ path: 'test-results/manual-10-products-tab.png', fullPage: true });
  94  |   console.log('✅ Screenshot: manual-10-products-tab.png');
  95  |   console.log('   🔍 CHECK: Category icons in product cards (if any products exist)');
  96  |   
  97  |   // Step 9: Click History Tab
  98  |   console.log('\n📍 Step 9: Opening History Tab');
  99  |   const historyTab = page.locator('button:has-text("History")');
  100 |   await historyTab.click();
  101 |   await page.waitForTimeout(1500);
  102 |   await page.screenshot({ path: 'test-results/manual-11-history-tab.png', fullPage: true });
  103 |   console.log('✅ Screenshot: manual-11-history-tab.png');
  104 |   
  105 |   // Step 10: Final Overview
  106 |   console.log('\n📍 Step 10: Capturing final overview');
  107 |   await page.screenshot({ path: 'test-results/manual-12-final-overview.png', fullPage: true });
  108 |   console.log('✅ Screenshot: manual-12-final-overview.png');
  109 |   
  110 |   // Keep browser open for manual inspection
  111 |   console.log('\n✅ ALL SCREENSHOTS CAPTURED!');
  112 |   console.log('\n📋 MANUAL VERIFICATION CHECKLIST:');
  113 |   console.log('   □ Streak display has pixel flame icon (not 🔥 emoji)');
  114 |   console.log('   □ Login calendar has pixel star/heart/crown icons');
  115 |   console.log('   □ Completed days show pink checkmark');
  116 |   console.log('   □ Bounty button is CYAN (not purple)');
  117 |   console.log('   □ Bounty has black barcode icon');
  118 |   console.log('   □ Category badges have pixel art icons');
  119 |   console.log('   □ All icons are sharp/pixelated (not blurry)');
  120 |   console.log('   □ No animations on static icons\n');
  121 |   
  122 |   // Wait 10 seconds for manual review
  123 |   console.log('⏰ Browser will stay open for 10 seconds for manual review...\n');
  124 |   await page.waitForTimeout(10000);
  125 | });
  126 | 
```