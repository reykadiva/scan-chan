# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: comprehensive-qa-test.spec.ts >> 🧪 QA Test Suite - Account 2 (Reyka) >> 10. 🚫 No Console Errors During Session
- Location: tests\comprehensive-qa-test.spec.ts:299:9

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 2
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
          - img "Arashu profile avatar" [ref=e581]
          - generic [ref=e841]:
            - generic [ref=e842]:
              - heading "Arashu's" [level=2] [ref=e843]
              - generic "1-day streak" [ref=e844]:
                - img "Tabby pixel cat" [ref=e845]
                - text: "1"
            - generic [ref=e1104]:
              - generic [ref=e1105]: LVL 1
              - generic [ref=e1106]: 15 / 300 XP
        - generic [ref=e1109]:
          - link "Teal pixel cat Scan Barcode" [ref=e1110] [cursor=pointer]:
            - /url: /scan
            - button "Teal pixel cat Scan Barcode" [ref=e1111]:
              - img "Teal pixel cat" [ref=e1112]
              - text: Scan Barcode
          - button "Pinky pixel cat Register Product" [ref=e1389]:
            - img "Pinky pixel cat" [ref=e1390]
            - text: Register Product
      - generic [ref=e1705]:
        - generic [ref=e1706]:
          - generic "Click me to play!" [ref=e1707] [cursor=pointer]:
            - img "Tabby pixel cat" [ref=e1708]
          - generic [ref=e1943]:
            - generic [ref=e1944]:
              - generic [ref=e1945]:
                - heading "Scan-chan Jr." [level=3] [ref=e1946]
                - button [ref=e1947]:
                  - img [ref=e1948]
              - generic [ref=e1950]:
                - generic [ref=e1951]: Young Cat
                - button "💖 Pet Cat" [ref=e1952] [cursor=pointer]
            - generic [ref=e1953]:
              - generic [ref=e1954]:
                - generic [ref=e1955]:
                  - generic [ref=e1956]: Hunger
                  - generic [ref=e1957]: 50%
                - generic [ref=e1961]:
                  - img "Tabby pixel cat" [ref=e1962]
                  - text: Slightly hungry.
              - generic [ref=e2197]:
                - generic [ref=e2198]:
                  - generic [ref=e2199]: Affection
                  - generic [ref=e2200]: 25%
                - paragraph [ref=e2203]: Keep caring for your pet to trigger the next evolution!
        - generic [ref=e2204]:
          - heading "Feed Pet (Food Inventory)" [level=4] [ref=e2205]:
            - img [ref=e2206]
            - text: Feed Pet (Food Inventory)
          - paragraph [ref=e2209]: Food items collected from scanning products (Snack, Drink, Candy, Biscuit, Dairy).
          - generic [ref=e2210]: You don't have any food in your inventory yet. Go scan some snacks or beverages first!
        - generic [ref=e2211]:
          - heading "🏠 Room Background" [level=4] [ref=e2212]
          - generic [ref=e2213]:
            - button "🛋️ Cozy Bedroom ✓" [ref=e2214] [cursor=pointer]:
              - generic [ref=e2216]: 🛋️
              - generic [ref=e2217]: Cozy Bedroom
              - generic [ref=e2218]: ✓
            - button "🌸 Kawaii Garden 🔒 Lv.3" [disabled] [ref=e2219] [cursor=pointer]:
              - generic [ref=e2221]: 🌸
              - generic [ref=e2222]: Kawaii Garden
              - generic [ref=e2223]: 🔒 Lv.3
      - generic [ref=e2224]:
        - button "Tabby pixel cat Missions" [ref=e2225]:
          - img "Tabby pixel cat" [ref=e2226]
          - text: Missions
        - button "Calico pixel cat Login" [ref=e2589]:
          - img "Calico pixel cat" [ref=e2590]
          - text: Login
        - button "Tabby pixel cat Bounty" [ref=e2900]:
          - img "Tabby pixel cat" [ref=e2901]
          - text: Bounty
        - button "Teal pixel cat Stats" [ref=e3178]:
          - img "Teal pixel cat" [ref=e3179]
          - text: Stats
        - button "Shadow pixel cat Roadmap" [ref=e3447]:
          - img "Shadow pixel cat" [ref=e3448]
          - text: Roadmap
        - button "Pinky pixel cat Badges" [ref=e3721]:
          - img "Pinky pixel cat" [ref=e3722]
          - text: Badges
        - button "Gray pixel cat History" [ref=e4032]:
          - img "Gray pixel cat" [ref=e4033]
          - text: History
        - button "Pinky pixel cat Products" [ref=e4306]:
          - img "Pinky pixel cat" [ref=e4307]
          - text: Products
      - generic [ref=e4623]:
        - generic [ref=e4624]:
          - heading "Tabby pixel cat Today's Missions" [level=3] [ref=e4625]:
            - img "Tabby pixel cat" [ref=e4626]
            - text: Today's Missions
          - generic [ref=e4989]: Reset daily based on local timezone
        - generic [ref=e4990]:
          - generic [ref=e4991]:
            - generic [ref=e4992]:
              - generic [ref=e4993]:
                - heading "Early Bird" [level=4] [ref=e4994]
                - paragraph [ref=e4995]: Scan any product between 5:00 AM and 9:00 AM
              - generic [ref=e4997]: +30 XP
            - generic [ref=e4999]:
              - generic [ref=e5000]: Progress
              - generic [ref=e5001]: 0 / 1
          - generic [ref=e5003]:
            - generic [ref=e5004]:
              - generic [ref=e5005]:
                - heading "Night Owl" [level=4] [ref=e5006]
                - paragraph [ref=e5007]: Scan any product between 8:00 PM and 11:59 PM
              - generic [ref=e5009]: +30 XP
            - generic [ref=e5011]:
              - generic [ref=e5012]: Progress
              - generic [ref=e5013]: 0 / 1
          - generic [ref=e5015]:
            - generic [ref=e5016]:
              - generic [ref=e5017]:
                - heading "Daily Scanner" [level=4] [ref=e5018]
                - paragraph [ref=e5019]: Scan 5 barcodes of any product
              - generic [ref=e5021]: +50 XP
            - generic [ref=e5023]:
              - generic [ref=e5024]: Progress
              - generic [ref=e5025]: 0 / 5
          - generic [ref=e5027]:
            - generic [ref=e5028]:
              - generic [ref=e5029]:
                - heading "Stay Hydrated" [level=4] [ref=e5030]
                - paragraph [ref=e5031]: Scan a product in the Drink or Dairy category
              - generic [ref=e5033]: +40 XP
            - generic [ref=e5035]:
              - generic [ref=e5036]: Progress
              - generic [ref=e5037]: 0 / 1
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e5044] [cursor=pointer]:
    - img [ref=e5045]
  - alert [ref=e5048]
```

# Test source

```ts
  236 |     test('8. 💾 Auto-Save on Page Unload', async ({ page }) => {
  237 |       console.log(`\n💾 Testing auto-save on page unload...`);
  238 |       
  239 |       await login(page, account.email, account.password);
  240 |       
  241 |       const initialStats = await getPetStats(page);
  242 |       
  243 |       // Pet the cat
  244 |       const petButton = page.locator('button:has-text("Pet")').first();
  245 |       await petButton.click();
  246 |       await page.waitForTimeout(600);
  247 |       
  248 |       // Get updated stats
  249 |       const updatedStats = await getPetStats(page);
  250 |       
  251 |       // Navigate away immediately (before debounce save)
  252 |       await page.goto('http://localhost:3000/play/mode');
  253 |       await page.waitForTimeout(1000);
  254 |       
  255 |       // Go back to play page
  256 |       await page.goto('http://localhost:3000/play');
  257 |       await page.waitForTimeout(2000);
  258 |       
  259 |       // Check stats were saved via beforeunload
  260 |       const finalStats = await getPetStats(page);
  261 |       console.log(`Before: ${initialStats.affection}%, After quick nav: ${finalStats.affection}%`);
  262 |       
  263 |       expect(finalStats.affection).toBe(updatedStats.affection);
  264 |       console.log('✅ Auto-save on unload works!');
  265 |     });
  266 | 
  267 |     test('9. 🔄 Rapid Actions Test', async ({ page }) => {
  268 |       console.log(`\n🔄 Testing rapid actions (stress test)...`);
  269 |       
  270 |       await login(page, account.email, account.password);
  271 |       
  272 |       const initialStats = await getPetStats(page);
  273 |       console.log(`Initial affection: ${initialStats.affection}%`);
  274 |       
  275 |       // Rapidly pet the cat 10 times
  276 |       const petButton = page.locator('button:has-text("Pet")').first();
  277 |       for (let i = 0; i < 10; i++) {
  278 |         await petButton.click();
  279 |         await page.waitForTimeout(100); // Very short delay
  280 |       }
  281 |       
  282 |       await waitForSave(page);
  283 |       
  284 |       const finalStats = await getPetStats(page);
  285 |       console.log(`After rapid petting: ${finalStats.affection}%`);
  286 |       
  287 |       expect(finalStats.affection).toBeGreaterThan(initialStats.affection);
  288 |       
  289 |       // Refresh to verify
  290 |       await page.reload();
  291 |       await page.waitForTimeout(2000);
  292 |       
  293 |       const afterRefreshStats = await getPetStats(page);
  294 |       expect(afterRefreshStats.affection).toBe(finalStats.affection);
  295 |       
  296 |       console.log('✅ Rapid actions test passed!');
  297 |     });
  298 | 
  299 |     test('10. 🚫 No Console Errors During Session', async ({ page }) => {
  300 |       console.log(`\n🚫 Testing for console errors...`);
  301 |       
  302 |       const consoleErrors: string[] = [];
  303 |       
  304 |       page.on('console', msg => {
  305 |         if (msg.type() === 'error') {
  306 |           consoleErrors.push(msg.text());
  307 |         }
  308 |       });
  309 |       
  310 |       await login(page, account.email, account.password);
  311 |       
  312 |       // Perform various actions
  313 |       const petButton = page.locator('button:has-text("Pet")').first();
  314 |       await petButton.click();
  315 |       await page.waitForTimeout(1000);
  316 |       
  317 |       await page.reload();
  318 |       await page.waitForTimeout(2000);
  319 |       
  320 |       // Filter out known harmless errors (like HMR, DevTools suggestions)
  321 |       const criticalErrors = consoleErrors.filter(err => 
  322 |         !err.includes('DevTools') && 
  323 |         !err.includes('HMR') &&
  324 |         !err.includes('Web Analytics') &&
  325 |         !err.includes('500') // We're specifically testing no 500 errors
  326 |       );
  327 |       
  328 |       console.log(`Found ${consoleErrors.length} total console messages`);
  329 |       console.log(`Critical errors: ${criticalErrors.length}`);
  330 |       
  331 |       if (criticalErrors.length > 0) {
  332 |         console.error('❌ Critical errors found:');
  333 |         criticalErrors.forEach(err => console.error(`  - ${err}`));
  334 |       }
  335 |       
> 336 |       expect(criticalErrors.length).toBe(0);
      |                                     ^ Error: expect(received).toBe(expected) // Object.is equality
  337 |       console.log('✅ No critical console errors!');
  338 |     });
  339 | 
  340 |     test('11. 📸 Full Feature Screenshot', async ({ page }) => {
  341 |       console.log(`\n📸 Taking full feature screenshot...`);
  342 |       
  343 |       await login(page, account.email, account.password);
  344 |       
  345 |       // Take full page screenshot
  346 |       await page.screenshot({ 
  347 |         path: `e2e/screenshots/${account.email.split('@')[0]}-full-page.png`,
  348 |         fullPage: true 
  349 |       });
  350 |       
  351 |       console.log(`✅ Screenshot saved for ${account.email}`);
  352 |     });
  353 | 
  354 |   });
  355 | }
  356 | 
  357 | // Summary test at the end
  358 | test('✨ QA Test Summary', async () => {
  359 |   console.log('\n' + '='.repeat(60));
  360 |   console.log('🎉 COMPREHENSIVE QA TEST SUITE COMPLETED');
  361 |   console.log('='.repeat(60));
  362 |   console.log('\nAll features tested across both accounts:');
  363 |   console.log('  ✅ Login and authentication');
  364 |   console.log('  ✅ Pet stats persistence after refresh');
  365 |   console.log('  ✅ Feed pet functionality');
  366 |   console.log('  ✅ Daily missions display');
  367 |   console.log('  ✅ Achievements/badges system');
  368 |   console.log('  ✅ XP and level system');
  369 |   console.log('  ✅ Theme customization');
  370 |   console.log('  ✅ Auto-save on page unload');
  371 |   console.log('  ✅ Rapid actions handling');
  372 |   console.log('  ✅ No console errors');
  373 |   console.log('\n' + '='.repeat(60));
  374 | });
  375 | 
```