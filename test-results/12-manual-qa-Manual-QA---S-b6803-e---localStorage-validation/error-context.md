# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 12-manual-qa.spec.ts >> Manual QA - Sprint 9.2 >> Persistence - localStorage validation
- Location: tests\e2e\12-manual-qa.spec.ts:122:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - status [ref=e3]
  - main [ref=e8]:
    - generic "Scan Chan is here." [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]:
          - generic [ref=e12]: checking in
          - heading "Scan Chan is here." [level=1] [ref=e13]
          - paragraph [ref=e14]: A quiet room for checking in, seeing how your companion feels, and choosing the next gentle action.
        - region "Mascot display showing current emotion and animation state" [ref=e15]:
          - generic [ref=e16]:
            - img "Scan Chan is feeling content with neutral expression" [ref=e17]:
              - generic [ref=e18]: Renderer attaches here
            - generic [ref=e19]:
              - paragraph [ref=e20]: content / neutral
              - paragraph [ref=e21]: "Intent: idle (ambient)"
              - list "Available renderer targets" [ref=e22]:
                - listitem [ref=e23]: pixel-sprite-renderer
                - listitem [ref=e24]: rive
                - listitem [ref=e25]: live2d
                - listitem [ref=e26]: spine
        - region "Pet summary" [ref=e27]:
          - heading "Pet summary" [level=2] [ref=e28]
          - generic [ref=e29]:
            - 'generic "Hunger: 100 out of 100" [ref=e30]':
              - generic [ref=e31]:
                - generic [ref=e32]: Hunger
                - generic [ref=e33]: "100"
              - generic [ref=e34]:
                - generic [ref=e35]: Hunger
                - progressbar "Hunger" [ref=e36]
            - 'generic "Mood: 100 out of 100" [ref=e38]':
              - generic [ref=e39]:
                - generic [ref=e40]: Mood
                - generic [ref=e41]: "100"
              - generic [ref=e42]:
                - generic [ref=e43]: Mood
                - progressbar "Mood" [ref=e44]
            - 'generic "Energy: 100 out of 100" [ref=e46]':
              - generic [ref=e47]:
                - generic [ref=e48]: Energy
                - generic [ref=e49]: "100"
              - generic [ref=e50]:
                - generic [ref=e51]: Energy
                - progressbar "Energy" [ref=e52]
            - 'generic "Affection: 25 out of 100" [ref=e54]':
              - generic [ref=e55]:
                - generic [ref=e56]: Affection
                - generic [ref=e57]: "25"
              - generic [ref=e58]:
                - generic [ref=e59]: Affection
                - progressbar "Affection" [ref=e60]
            - 'generic "Curiosity: 50 out of 100" [ref=e62]':
              - generic [ref=e63]:
                - generic [ref=e64]: Curiosity
                - generic [ref=e65]: "50"
              - generic [ref=e66]:
                - generic [ref=e67]: Curiosity
                - progressbar "Curiosity" [ref=e68]
      - generic [ref=e70]:
        - generic "Next gentle action" [ref=e71]:
          - heading "Next gentle action" [level=3] [ref=e72]
          - paragraph [ref=e73]: pet
          - paragraph [ref=e74]: This is a ViewModel hint only. Future interactions attach here without moving care logic into the UI.
        - generic "Today" [ref=e75]:
          - heading "Today" [level=3] [ref=e76]
          - generic [ref=e77]:
            - generic [ref=e78]: 0 feeds
            - generic [ref=e79]: 0 memories
          - paragraph [ref=e80]: "Last barcode: none yet"
        - region "Room status" [ref=e81]:
          - heading "Room status" [level=3] [ref=e82]
          - generic [ref=e83]:
            - generic [ref=e84]:
              - paragraph [ref=e85]: Pet
              - generic [ref=e86]: content
            - generic [ref=e87]:
              - paragraph [ref=e88]: Scanner
              - generic [ref=e89]: No scan yet
            - generic [ref=e90]:
              - paragraph [ref=e91]: Inventory
              - generic [ref=e92]: 0 items
            - generic [ref=e93]:
              - paragraph [ref=e94]: Settings
              - generic [ref=e95]: Motion ready
            - generic [ref=e96]:
              - paragraph [ref=e97]: Profile
              - generic [ref=e98]: guest
  - region "Notifications alt+T"
```

# Test source

```ts
  34  |     
  35  |     // Verify controls present
  36  |     await expect(page.locator('button').filter({ hasText: /Start Camera/i })).toBeVisible();
  37  |     await expect(page.locator('button').filter({ hasText: /Switch Camera/i })).toBeVisible();
  38  |     
  39  |     // Note: Camera does not activate (documented limitation)
  40  |   });
  41  | 
  42  |   test('Collection - inventory interaction', async ({ page }) => {
  43  |     await page.goto('/collection');
  44  |     await page.waitForLoadState('networkidle');
  45  |     
  46  |     // Verify page loads
  47  |     await expect(page).toHaveURL(/collection/);
  48  |     
  49  |     // Verify metrics
  50  |     await expect(page.locator('text=Total Items')).toBeVisible();
  51  |     await expect(page.locator('text=Capacity')).toBeVisible();
  52  |     
  53  |     // Verify search bar
  54  |     const searchInput = page.locator('input[type="text"]').first();
  55  |     await expect(searchInput).toBeVisible();
  56  |     await searchInput.fill('test');
  57  |     await expect(searchInput).toHaveValue('test');
  58  |     await searchInput.clear();
  59  |     
  60  |     // Verify category filters
  61  |     await expect(page.locator('text=Food')).toBeVisible();
  62  |     await expect(page.locator('text=Product')).toBeVisible();
  63  |   });
  64  | 
  65  |   test('Achievements - progress display', async ({ page }) => {
  66  |     await page.goto('/achievements');
  67  |     await page.waitForLoadState('networkidle');
  68  |     
  69  |     // Verify achievements list
  70  |     await expect(page.locator('h1')).toContainText('Achievements');
  71  |     
  72  |     const achievementList = page.locator('[role="list"]').first();
  73  |     await expect(achievementList).toBeVisible();
  74  |     
  75  |     // Verify achievement items render
  76  |     const items = achievementList.locator('[role="listitem"]');
  77  |     const count = await items.count();
  78  |     expect(count).toBeGreaterThan(0);
  79  |   });
  80  | 
  81  |   test('Missions - active missions display', async ({ page }) => {
  82  |     await page.goto('/missions');
  83  |     await page.waitForLoadState('networkidle');
  84  |     
  85  |     // Verify page
  86  |     await expect(page.locator('h1')).toContainText('Missions');
  87  |     
  88  |     // Verify either active missions or empty state
  89  |     const activeSection = page.locator('text=Active Missions');
  90  |     const emptyState = page.locator('text=No active missions');
  91  |     
  92  |     const hasActive = await activeSection.isVisible();
  93  |     const hasEmpty = await emptyState.isVisible();
  94  |     
  95  |     expect(hasActive || hasEmpty).toBeTruthy();
  96  |   });
  97  | 
  98  |   test('Navigation - full cycle', async ({ page }) => {
  99  |     await page.goto('/home');
  100 |     
  101 |     // Home -> Scanner
  102 |     await page.click('a[href="/scan"]');
  103 |     await expect(page).toHaveURL(/scan/);
  104 |     
  105 |     // Scanner -> Collection
  106 |     await page.click('a[href="/collection"]');
  107 |     await expect(page).toHaveURL(/collection/);
  108 |     
  109 |     // Collection -> Achievements
  110 |     await page.click('a[href="/achievements"]');
  111 |     await expect(page).toHaveURL(/achievements/);
  112 |     
  113 |     // Achievements -> Missions
  114 |     await page.click('a[href="/missions"]');
  115 |     await expect(page).toHaveURL(/missions/);
  116 |     
  117 |     // Missions -> Home
  118 |     await page.click('a[href="/home"]');
  119 |     await expect(page).toHaveURL(/home/);
  120 |   });
  121 | 
  122 |   test('Persistence - localStorage validation', async ({ page, context }) => {
  123 |     await page.goto('/home');
  124 |     await page.waitForLoadState('networkidle');
  125 |     
  126 |     // Check localStorage keys exist
  127 |     const keys = await page.evaluate(() => Object.keys(localStorage));
  128 |     
  129 |     // Verify Guest persistence keys
  130 |     const hasPetStore = keys.some(k => k.includes('pet') && k.includes('state'));
  131 |     const hasGameStore = keys.some(k => k.includes('game') && k.includes('state'));
  132 |     const hasSettingsStore = keys.some(k => k.includes('settings') && k.includes('state'));
  133 |     
> 134 |     expect(hasPetStore || hasGameStore || hasSettingsStore).toBeTruthy();
      |                                                             ^ Error: expect(received).toBeTruthy()
  135 |     
  136 |     // Reload and verify state persists
  137 |     await page.reload();
  138 |     await page.waitForLoadState('networkidle');
  139 |     
  140 |     await expect(page.locator('text=Pet Summary')).toBeVisible();
  141 |   });
  142 | 
  143 |   test('Responsive - 320px (smallest mobile)', async ({ page }) => {
  144 |     await page.setViewportSize({ width: 320, height: 568 });
  145 |     await page.goto('/home');
  146 |     await page.waitForLoadState('networkidle');
  147 |     
  148 |     // Check no horizontal overflow
  149 |     const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  150 |     expect(hasOverflow).toBeFalsy();
  151 |     
  152 |     // Verify content visible
  153 |     await expect(page.locator('h1')).toBeVisible();
  154 |   });
  155 | 
  156 |   test('Responsive - 360px', async ({ page }) => {
  157 |     await page.setViewportSize({ width: 360, height: 640 });
  158 |     await page.goto('/home');
  159 |     await page.waitForLoadState('networkidle');
  160 |     
  161 |     const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  162 |     expect(hasOverflow).toBeFalsy();
  163 |   });
  164 | 
  165 |   test('Responsive - 375px (iPhone)', async ({ page }) => {
  166 |     await page.setViewportSize({ width: 375, height: 667 });
  167 |     await page.goto('/home');
  168 |     await page.waitForLoadState('networkidle');
  169 |     
  170 |     const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  171 |     expect(hasOverflow).toBeFalsy();
  172 |   });
  173 | 
  174 |   test('Responsive - 390px', async ({ page }) => {
  175 |     await page.setViewportSize({ width: 390, height: 844 });
  176 |     await page.goto('/home');
  177 |     await page.waitForLoadState('networkidle');
  178 |     
  179 |     const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  180 |     expect(hasOverflow).toBeFalsy();
  181 |   });
  182 | 
  183 |   test('Responsive - 428px (iPhone Pro Max)', async ({ page }) => {
  184 |     await page.setViewportSize({ width: 428, height: 926 });
  185 |     await page.goto('/home');
  186 |     await page.waitForLoadState('networkidle');
  187 |     
  188 |     const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  189 |     expect(hasOverflow).toBeFalsy();
  190 |   });
  191 | 
  192 |   test('Responsive - 768px (tablet)', async ({ page }) => {
  193 |     await page.setViewportSize({ width: 768, height: 1024 });
  194 |     await page.goto('/home');
  195 |     await page.waitForLoadState('networkidle');
  196 |     
  197 |     const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  198 |     expect(hasOverflow).toBeFalsy();
  199 |   });
  200 | 
  201 |   test('Responsive - 1280px (desktop)', async ({ page }) => {
  202 |     await page.setViewportSize({ width: 1280, height: 720 });
  203 |     await page.goto('/home');
  204 |     await page.waitForLoadState('networkidle');
  205 |     
  206 |     const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  207 |     expect(hasOverflow).toBeFalsy();
  208 |   });
  209 | 
  210 |   test('Keyboard navigation - Tab flow', async ({ page }) => {
  211 |     await page.goto('/home');
  212 |     await page.waitForLoadState('networkidle');
  213 |     
  214 |     // Tab through interactive elements
  215 |     await page.keyboard.press('Tab');
  216 |     let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
  217 |     expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
  218 |     
  219 |     // Verify focus visible
  220 |     const hasFocusRing = await page.evaluate(() => {
  221 |       const el = document.activeElement;
  222 |       if (!el) return false;
  223 |       const styles = window.getComputedStyle(el);
  224 |       return styles.outline !== 'none' || styles.boxShadow.includes('rgb');
  225 |     });
  226 |     expect(hasFocusRing).toBeTruthy();
  227 |   });
  228 | 
  229 |   test('Accessibility - ARIA landmarks', async ({ page }) => {
  230 |     await page.goto('/home');
  231 |     await page.waitForLoadState('networkidle');
  232 |     
  233 |     // Verify main landmark
  234 |     const main = page.locator('main');
```