# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 12-manual-qa.spec.ts >> Manual QA - Sprint 9.2 >> Collection - inventory interaction
- Location: tests\e2e\12-manual-qa.spec.ts:42:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Capacity')
Expected: visible
Error: strict mode violation: locator('text=Capacity') resolved to 2 elements:
    1) <p data-slot="text" class="text-pretty text-muted-foreground text-xs font-semibold uppercase tracking-wider">Slot Capacity</p> aka getByText('Slot Capacity')
    2) <div class="mb-1 text-xs font-semibold text-muted-foreground">Inventory capacity</div> aka getByText('Inventory capacity')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Capacity')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - status [ref=e3]
  - main [ref=e8]:
    - generic [ref=e9]:
      - generic [ref=e10]:
        - heading "Your Things" [level=1] [ref=e11]
        - paragraph [ref=e12]: Organize, customize, and view items scanned for Scan Chan.
      - region "Inventory Metrics" [ref=e13]:
        - heading "Inventory Metrics" [level=2] [ref=e14]
        - generic [ref=e15]:
          - 'region "Total items: 0" [ref=e16]':
            - paragraph [ref=e17]: Total Items
            - paragraph [ref=e18]: "0"
            - paragraph [ref=e19]: Sum of all item stacks
          - 'region "Unique stacks: 0" [ref=e20]':
            - paragraph [ref=e21]: Unique Stacks
            - paragraph [ref=e22]: "0"
            - paragraph [ref=e23]: Active slots occupied
          - 'region "Food and care items: 0" [ref=e24]':
            - paragraph [ref=e25]: Food & Care
            - paragraph [ref=e26]: "0"
            - paragraph [ref=e27]: Ready for feeding Scan Chan
          - 'region "Capacity: 0 of 20 slots used" [ref=e28]':
            - paragraph [ref=e30]: Slot Capacity
            - generic [ref=e31]:
              - generic [ref=e32]: "0"
              - generic [ref=e33]: / 20
            - generic [ref=e35]:
              - generic [ref=e36]: Inventory capacity
              - progressbar "Inventory capacity" [ref=e37]
      - search [ref=e38]:
        - generic [ref=e39]:
          - img [ref=e40]
          - textbox "Search items by name" [ref=e43]:
            - /placeholder: Search by name...
        - generic [ref=e44]:
          - combobox "Sort items by" [ref=e45]:
            - img
          - combobox [ref=e46]
          - 'button "Toggle sort order, current: ascending" [ref=e47]':
            - img
            - generic [ref=e48]: "Toggle sort order, current: ascending"
        - generic [ref=e50]: Drag items here to sort / use
      - navigation "Filter items by category" [ref=e51]:
        - tablist [ref=e52]:
          - tab "All Things" [selected] [ref=e53]
          - tab "Foods" [ref=e54]
          - tab "Products" [ref=e55]
          - tab "Furniture" [ref=e56]
          - tab "Decorations" [ref=e57]
          - tab "Memories" [ref=e58]
      - generic [ref=e59]:
        - status [ref=e61]:
          - heading "No items found." [level=3] [ref=e62]
          - paragraph [ref=e63]: This drawer is empty. Feed Scan Chan or scan groceries to unlock items!
        - complementary [ref=e64]:
          - generic [ref=e65]:
            - img [ref=e66]
            - paragraph [ref=e69]: No item selected
            - paragraph [ref=e70]: Tap any grid slot or card item to view its details, statistics, and usable actions here.
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
> 51  |     await expect(page.locator('text=Capacity')).toBeVisible();
      |                                                 ^ Error: expect(locator).toBeVisible() failed
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
```