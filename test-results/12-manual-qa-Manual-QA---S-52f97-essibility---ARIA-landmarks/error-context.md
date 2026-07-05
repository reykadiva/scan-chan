# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 12-manual-qa.spec.ts >> Manual QA - Sprint 9.2 >> Accessibility - ARIA landmarks
- Location: tests\e2e\12-manual-qa.spec.ts:229:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('nav')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('nav')

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- status
- main:
  - text: checking in
  - heading "Scan Chan is here." [level=1]
  - paragraph: A quiet room for checking in, seeing how your companion feels, and choosing the next gentle action.
  - region "Mascot display showing current emotion and animation state":
    - img "Scan Chan is feeling content with neutral expression"
    - paragraph: content / neutral
    - paragraph: "Intent: idle (ambient)"
    - list "Available renderer targets":
      - listitem: pixel-sprite-renderer
      - listitem: rive
      - listitem: live2d
      - listitem: spine
  - region "Pet summary":
    - heading "Pet summary" [level=2]
    - text: Hunger Hunger
    - progressbar "Hunger"
    - text: Mood Mood
    - progressbar "Mood"
    - text: Energy Energy
    - progressbar "Energy"
    - text: Affection Affection
    - progressbar "Affection"
    - text: Curiosity Curiosity
    - progressbar "Curiosity"
  - heading "Next gentle action" [level=3]
  - paragraph: pet
  - paragraph: This is a ViewModel hint only. Future interactions attach here without moving care logic into the UI.
  - heading "Today" [level=3]
  - text: 0 feeds 0 memories
  - paragraph: "Last barcode: none yet"
  - region "Room status":
    - heading "Room status" [level=3]
    - paragraph: Pet
    - text: content
    - paragraph: Scanner
    - text: No scan yet
    - paragraph: Inventory
    - text: 0 items
    - paragraph: Settings
    - text: Motion ready
    - paragraph: Profile
    - text: guest
- region "Notifications alt+T"
```

# Test source

```ts
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
  235 |     await expect(main).toBeVisible();
  236 |     
  237 |     // Verify nav landmark
  238 |     const nav = page.locator('nav');
> 239 |     await expect(nav).toBeVisible();
      |                       ^ Error: expect(locator).toBeVisible() failed
  240 |   });
  241 | });
  242 | 
```