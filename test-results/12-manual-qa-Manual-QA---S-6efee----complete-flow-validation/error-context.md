# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 12-manual-qa.spec.ts >> Manual QA - Sprint 9.2 >> Home Hub - complete flow validation
- Location: tests\e2e\12-manual-qa.spec.ts:4:7

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('[role="region"]').filter({ hasText: /Hunger|Mood|Energy|Affection|Curiosity/ })
Expected: 5
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('[role="region"]').filter({ hasText: /Hunger|Mood|Energy|Affection|Curiosity/ })
    14 × locator resolved to 0 elements
       - unexpected value "0"

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
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Manual QA - Sprint 9.2', () => {
  4   |   test('Home Hub - complete flow validation', async ({ page }) => {
  5   |     await page.goto('/home');
  6   |     await page.waitForLoadState('networkidle');
  7   |     
  8   |     // Verify pet summary visible
  9   |     await expect(page.locator('text=Pet Summary')).toBeVisible();
  10  |     
  11  |     // Verify stat cards render with values
  12  |     const statCards = page.locator('[role="region"]').filter({ hasText: /Hunger|Mood|Energy|Affection|Curiosity/ });
> 13  |     await expect(statCards).toHaveCount(5);
      |                             ^ Error: expect(locator).toHaveCount(expected) failed
  14  |     
  15  |     // Verify mascot placeholder
  16  |     await expect(page.locator('text=Mascot Placeholder')).toBeVisible();
  17  |     
  18  |     // Verify daily summary
  19  |     await expect(page.locator('text=Daily Summary')).toBeVisible();
  20  |     
  21  |     // Verify recommendation card
  22  |     await expect(page.locator('text=Recommended Action')).toBeVisible();
  23  |   });
  24  | 
  25  |   test('Scanner - UI validation (camera not wired)', async ({ page }) => {
  26  |     await page.goto('/scan');
  27  |     await page.waitForLoadState('networkidle');
  28  |     
  29  |     // Verify page loads
  30  |     await expect(page.locator('h1')).toContainText('Scanner');
  31  |     
  32  |     // Verify camera preview area exists
  33  |     await expect(page.locator('[role="region"]').filter({ hasText: /Camera Preview|Scanner/ })).toBeVisible();
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
```