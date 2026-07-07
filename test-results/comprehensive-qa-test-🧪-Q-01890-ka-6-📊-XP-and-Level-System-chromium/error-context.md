# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: comprehensive-qa-test.spec.ts >> 🧪 QA Test Suite - Account 2 (Reyka) >> 6. 📊 XP and Level System
- Location: tests\comprehensive-qa-test.spec.ts:186:9

# Error details

```
Error: locator.isVisible: Error: strict mode violation: locator('text=/XP|Level|Lv/i') resolved to 7 elements:
    1) <span class="bg-brand-cyan/20 text-cyan-800 text-xs font-fredoka font-bold px-2.5 py-0.5 rounded-full">LVL 1</span> aka getByText('LVL')
    2) <span class="font-nunito text-xs font-bold text-slate-500">20 / 300 XP</span> aka getByText('/ 300 XP')
    3) <span class="text-[8px] font-nunito font-bold text-slate-400">🔒 Lv.3</span> aka getByRole('button', { name: '🌸 Kawaii Garden 🔒 Lv.3' })
    4) <span class="bg-brand-pink/10 text-brand-pink text-xs font-fredoka font-bold px-2.5 py-1 rounded-full border border-brand-pink/20">+30 XP</span> aka getByText('+30 XP').first()
    5) <span class="bg-brand-pink/10 text-brand-pink text-xs font-fredoka font-bold px-2.5 py-1 rounded-full border border-brand-pink/20">+30 XP</span> aka getByText('+30 XP').nth(1)
    6) <span class="bg-brand-pink/10 text-brand-pink text-xs font-fredoka font-bold px-2.5 py-1 rounded-full border border-brand-pink/20">+50 XP</span> aka getByText('+50 XP')
    7) <span class="bg-brand-pink/10 text-brand-pink text-xs font-fredoka font-bold px-2.5 py-1 rounded-full border border-brand-pink/20">+40 XP</span> aka getByText('+40 XP')

Call log:
    - checking visibility of locator('text=/XP|Level|Lv/i')

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
              - generic [ref=e1106]: 20 / 300 XP
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
                  - generic [ref=e2200]: 30%
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
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e5039]:
        - img [ref=e5041]
        - generic [ref=e5045]: Welcome back, Reyka334! 👑
  - button "Open Next.js Dev Tools" [ref=e5051] [cursor=pointer]:
    - img [ref=e5052]
  - alert [ref=e5055]
```

# Test source

```ts
  92  |       const updatedStats = await getPetStats(page);
  93  |       console.log(`After petting - Hunger: ${updatedStats.hunger}%, Affection: ${updatedStats.affection}%`);
  94  |       
  95  |       // Verify affection increased
  96  |       expect(updatedStats.affection).toBeGreaterThan(initialStats.affection);
  97  |       
  98  |       // Refresh page
  99  |       console.log('🔄 Refreshing page...');
  100 |       await page.reload();
  101 |       await page.waitForTimeout(2000);
  102 |       
  103 |       // Get stats after refresh
  104 |       const afterRefreshStats = await getPetStats(page);
  105 |       console.log(`After refresh - Hunger: ${afterRefreshStats.hunger}%, Affection: ${afterRefreshStats.affection}%`);
  106 |       
  107 |       // Verify stats persisted (should be same as before refresh)
  108 |       expect(afterRefreshStats.affection).toBe(updatedStats.affection);
  109 |       expect(afterRefreshStats.hunger).toBe(updatedStats.hunger);
  110 |       
  111 |       console.log('✅ Pet stats persistence test passed!');
  112 |     });
  113 | 
  114 |     test('3. 🍖 Feed Pet Functionality', async ({ page }) => {
  115 |       console.log(`\n🍖 Testing feed pet functionality...`);
  116 |       
  117 |       await login(page, account.email, account.password);
  118 |       
  119 |       const initialStats = await getPetStats(page);
  120 |       console.log(`Initial hunger: ${initialStats.hunger}%`);
  121 |       
  122 |       // Try to feed the pet
  123 |       const feedButton = page.locator('button:has-text("Feed")').first();
  124 |       
  125 |       if (await feedButton.isVisible()) {
  126 |         await feedButton.click();
  127 |         await page.waitForTimeout(600);
  128 |         await waitForSave(page);
  129 |         
  130 |         const afterFeedStats = await getPetStats(page);
  131 |         console.log(`After feeding: ${afterFeedStats.hunger}%`);
  132 |         
  133 |         // Hunger should increase
  134 |         expect(afterFeedStats.hunger).toBeGreaterThanOrEqual(initialStats.hunger);
  135 |         
  136 |         console.log('✅ Feed functionality works!');
  137 |       } else {
  138 |         console.log('⚠️  Feed button not visible (might need food in inventory)');
  139 |       }
  140 |     });
  141 | 
  142 |     test('4. 🎯 Daily Missions Display', async ({ page }) => {
  143 |       console.log(`\n🎯 Testing daily missions display...`);
  144 |       
  145 |       await login(page, account.email, account.password);
  146 |       
  147 |       // Check if missions panel exists
  148 |       const missionsVisible = await page.locator('text=/Mission|Quest|Daily/i').isVisible();
  149 |       
  150 |       if (missionsVisible) {
  151 |         console.log('✅ Daily missions panel is visible');
  152 |         
  153 |         // Take screenshot of missions
  154 |         await page.screenshot({ 
  155 |           path: `e2e/screenshots/${account.email.split('@')[0]}-missions.png`,
  156 |           fullPage: true 
  157 |         });
  158 |       } else {
  159 |         console.log('ℹ️  Daily missions panel not found (feature might be disabled)');
  160 |       }
  161 |     });
  162 | 
  163 |     test('5. 🏆 Achievements/Badges System', async ({ page }) => {
  164 |       console.log(`\n🏆 Testing achievements system...`);
  165 |       
  166 |       await login(page, account.email, account.password);
  167 |       
  168 |       // Look for achievements/badges indicators
  169 |       const achievementElements = await page.locator('[class*="achievement"], [class*="badge"], text=/Achievement|Badge/i').count();
  170 |       
  171 |       if (achievementElements > 0) {
  172 |         console.log(`✅ Found ${achievementElements} achievement/badge elements`);
  173 |         
  174 |         // Try to click on achievements panel if exists
  175 |         const achievementButton = page.locator('button:has-text(/Achievement|Badge/i)').first();
  176 |         if (await achievementButton.isVisible()) {
  177 |           await achievementButton.click();
  178 |           await page.waitForTimeout(1000);
  179 |           console.log('✅ Achievements panel opened');
  180 |         }
  181 |       } else {
  182 |         console.log('ℹ️  No achievement elements found (feature might be in different location)');
  183 |       }
  184 |     });
  185 | 
  186 |     test('6. 📊 XP and Level System', async ({ page }) => {
  187 |       console.log(`\n📊 Testing XP and level system...`);
  188 |       
  189 |       await login(page, account.email, account.password);
  190 |       
  191 |       // Check for XP/Level display
> 192 |       const xpVisible = await page.locator('text=/XP|Level|Lv/i').isVisible();
      |                                                                   ^ Error: locator.isVisible: Error: strict mode violation: locator('text=/XP|Level|Lv/i') resolved to 7 elements:
  193 |       
  194 |       if (xpVisible) {
  195 |         const xpText = await page.locator('text=/XP|Level|Lv/i').first().textContent();
  196 |         console.log(`✅ XP/Level display found: ${xpText}`);
  197 |         
  198 |         // Pet the cat to gain XP
  199 |         const petButton = page.locator('button:has-text("Pet")').first();
  200 |         await petButton.click();
  201 |         await page.waitForTimeout(1000);
  202 |         
  203 |         console.log('✅ XP system is active');
  204 |       } else {
  205 |         console.log('⚠️  XP/Level display not found');
  206 |       }
  207 |     });
  208 | 
  209 |     test('7. 🎨 Theme and Customization', async ({ page }) => {
  210 |       console.log(`\n🎨 Testing theme and customization...`);
  211 |       
  212 |       await login(page, account.email, account.password);
  213 |       
  214 |       // Look for customization options
  215 |       const customizationButtons = await page.locator('button:has-text(/Theme|Customize|Style/i)').count();
  216 |       
  217 |       if (customizationButtons > 0) {
  218 |         console.log(`✅ Found ${customizationButtons} customization options`);
  219 |         
  220 |         // Try to open customization
  221 |         const customButton = page.locator('button:has-text(/Theme|Customize/i)').first();
  222 |         if (await customButton.isVisible()) {
  223 |           await customButton.click();
  224 |           await page.waitForTimeout(1000);
  225 |           console.log('✅ Customization panel opened');
  226 |           
  227 |           await page.screenshot({ 
  228 |             path: `e2e/screenshots/${account.email.split('@')[0]}-customization.png` 
  229 |           });
  230 |         }
  231 |       } else {
  232 |         console.log('ℹ️  Customization options not found in main view');
  233 |       }
  234 |     });
  235 | 
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
```