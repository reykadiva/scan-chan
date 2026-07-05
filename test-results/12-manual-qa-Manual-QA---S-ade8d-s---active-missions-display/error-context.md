# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 12-manual-qa.spec.ts >> Manual QA - Sprint 9.2 >> Missions - active missions display
- Location: tests\e2e\12-manual-qa.spec.ts:81:7

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
  - main [ref=e4]:
    - heading "Missions" [level=1] [ref=e5]
    - paragraph [ref=e6]: No missions available. Check back later!
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
> 95  |     expect(hasActive || hasEmpty).toBeTruthy();
      |                                   ^ Error: expect(received).toBeTruthy()
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
  134 |     expect(hasPetStore || hasGameStore || hasSettingsStore).toBeTruthy();
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
```