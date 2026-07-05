# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 12-manual-qa.spec.ts >> Manual QA - Sprint 9.2 >> Scanner - UI validation (camera not wired)
- Location: tests\e2e\12-manual-qa.spec.ts:25:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[role="region"]').filter({ hasText: /Camera Preview|Scanner/ })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[role="region"]').filter({ hasText: /Camera Preview|Scanner/ })

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- status
- banner:
  - heading "Scanner" [level=1]
  - paragraph: Offer Scan Chan a real-world find.
  - link "Close scanner and return to home":
    - /url: /home
    - button "Close scanner and return to home": Close scanner
- main:
  - text: Ready
  - button "Switch to next camera" [disabled]
  - button "Toggle flash (not yet available)" [disabled]
  - status:
    - paragraph: Ready to scan!
    - paragraph: Align any product barcode to feed Scan Chan.
  - complementary "Camera Controls":
    - heading "Camera Controls" [level=2]
    - paragraph: Start scanning or toggle settings below.
    - button "Request camera permission and start scanning": Start Camera
    - button "Force scanner into scanning mode for testing": Force Scan Mode
    - button "Simulate successful scan for testing": Success Mock
    - button "Simulate scan failure for testing": Failure Mock
    - button "Reset scanner state and release camera": Reset Scanner
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
  13  |     await expect(statCards).toHaveCount(5);
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
> 33  |     await expect(page.locator('[role="region"]').filter({ hasText: /Camera Preview|Scanner/ })).toBeVisible();
      |                                                                                                 ^ Error: expect(locator).toBeVisible() failed
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
```