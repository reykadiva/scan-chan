# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 11-accessibility.spec.ts >> Accessibility Smoke Tests >> should have landmarks on all pages
- Location: tests\e2e\11-accessibility.spec.ts:53:7

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 1
Received:    0
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - status [ref=e3]
  - generic [ref=e8]:
    - generic [ref=e9]:
      - heading "Your Things" [level=1] [ref=e10]
      - paragraph [ref=e11]: Organize, customize, and view items scanned for Scan Chan.
    - region "Inventory Metrics" [ref=e12]:
      - heading "Inventory Metrics" [level=2] [ref=e13]
      - generic [ref=e14]:
        - 'region "Total items: 0" [ref=e15]':
          - paragraph [ref=e16]: Total Items
          - paragraph [ref=e17]: "0"
          - paragraph [ref=e18]: Sum of all item stacks
        - 'region "Unique stacks: 0" [ref=e19]':
          - paragraph [ref=e20]: Unique Stacks
          - paragraph [ref=e21]: "0"
          - paragraph [ref=e22]: Active slots occupied
        - 'region "Food and care items: 0" [ref=e23]':
          - paragraph [ref=e24]: Food & Care
          - paragraph [ref=e25]: "0"
          - paragraph [ref=e26]: Ready for feeding Scan Chan
        - 'region "Capacity: 0 of 20 slots used" [ref=e27]':
          - paragraph [ref=e29]: Slot Capacity
          - generic [ref=e30]:
            - generic [ref=e31]: "0"
            - generic [ref=e32]: / 20
          - generic [ref=e34]:
            - generic [ref=e35]: Inventory capacity
            - progressbar "Inventory capacity" [ref=e36]
    - search [ref=e37]:
      - generic [ref=e38]:
        - img [ref=e39]
        - textbox "Search items by name" [ref=e42]:
          - /placeholder: Search by name...
      - generic [ref=e43]:
        - combobox "Sort items by" [ref=e44]:
          - img
        - combobox [ref=e45]
        - 'button "Toggle sort order, current: ascending" [ref=e46]':
          - img
          - generic [ref=e47]: "Toggle sort order, current: ascending"
      - generic [ref=e49]: Drag items here to sort / use
    - navigation "Filter items by category" [ref=e50]:
      - tablist [ref=e51]:
        - tab "All Things" [selected] [ref=e52]
        - tab "Foods" [ref=e53]
        - tab "Products" [ref=e54]
        - tab "Furniture" [ref=e55]
        - tab "Decorations" [ref=e56]
        - tab "Memories" [ref=e57]
    - generic [ref=e58]:
      - status [ref=e60]:
        - heading "No items found." [level=3] [ref=e61]
        - paragraph [ref=e62]: This drawer is empty. Feed Scan Chan or scan groceries to unlock items!
      - complementary [ref=e63]:
        - generic [ref=e64]:
          - img [ref=e65]
          - paragraph [ref=e68]: No item selected
          - paragraph [ref=e69]: Tap any grid slot or card item to view its details, statistics, and usable actions here.
  - region "Notifications alt+T"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Accessibility Smoke Tests', () => {
  4   |   test('should have page title', async ({ page }) => {
  5   |     await page.goto('/home');
  6   |     await page.waitForLoadState('networkidle');
  7   | 
  8   |     const title = await page.title();
  9   |     expect(title).toBeTruthy();
  10  |     expect(title.length).toBeGreaterThan(0);
  11  |   });
  12  | 
  13  |   test('should have main landmark', async ({ page }) => {
  14  |     await page.goto('/home');
  15  |     await page.waitForLoadState('networkidle');
  16  | 
  17  |     const main = page.getByRole('main');
  18  |     await expect(main).toBeVisible();
  19  |   });
  20  | 
  21  |   test('should have heading hierarchy', async ({ page }) => {
  22  |     await page.goto('/home');
  23  |     await page.waitForLoadState('networkidle');
  24  | 
  25  |     const h1 = page.getByRole('heading', { level: 1 });
  26  |     await expect(h1).toBeVisible();
  27  |   });
  28  | 
  29  |   test('should have descriptive button labels', async ({ page }) => {
  30  |     await page.goto('/scan');
  31  |     await page.waitForLoadState('networkidle');
  32  | 
  33  |     const buttons = page.getByRole('button');
  34  |     const count = await buttons.count();
  35  | 
  36  |     for (let i = 0; i < Math.min(count, 5); i++) {
  37  |       const button = buttons.nth(i);
  38  |       const accessibleName = await button.getAttribute('aria-label') || await button.textContent();
  39  |       expect(accessibleName).toBeTruthy();
  40  |       expect(accessibleName?.trim().length).toBeGreaterThan(0);
  41  |     }
  42  |   });
  43  | 
  44  |   test('should have aria-labels on interactive elements', async ({ page }) => {
  45  |     await page.goto('/collection');
  46  |     await page.waitForLoadState('networkidle');
  47  | 
  48  |     const searchBox = page.getByPlaceholder(/search by name/i);
  49  |     const label = await searchBox.getAttribute('aria-label');
  50  |     expect(label).toBeTruthy();
  51  |   });
  52  | 
  53  |   test('should have landmarks on all pages', async ({ page }) => {
  54  |     const pages = ['/home', '/scan', '/collection', '/achievements', '/missions'];
  55  | 
  56  |     for (const pagePath of pages) {
  57  |       await page.goto(pagePath);
  58  |       await page.waitForLoadState('networkidle');
  59  |       await page.waitForTimeout(500);
  60  | 
  61  |       const main = page.locator('main');
  62  |       const count = await main.count();
> 63  |       expect(count).toBeGreaterThanOrEqual(1);
      |                     ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  64  |     }
  65  |   });
  66  | 
  67  |   test('should have progress bars with aria attributes', async ({ page }) => {
  68  |     await page.goto('/achievements');
  69  |     await page.waitForLoadState('networkidle');
  70  | 
  71  |     const progressBar = page.getByRole('progressbar').first();
  72  |     const isVisible = await progressBar.isVisible().catch(() => false);
  73  | 
  74  |     if (isVisible) {
  75  |       const ariaValueMin = await progressBar.getAttribute('aria-valuemin');
  76  |       const ariaValueMax = await progressBar.getAttribute('aria-valuemax');
  77  |       const ariaValueNow = await progressBar.getAttribute('aria-valuenow');
  78  | 
  79  |       expect(ariaValueMin).toBeTruthy();
  80  |       expect(ariaValueMax).toBeTruthy();
  81  |       expect(ariaValueNow).toBeTruthy();
  82  |     }
  83  |   });
  84  | 
  85  |   test('should have list structure for achievements', async ({ page }) => {
  86  |     await page.goto('/achievements');
  87  |     await page.waitForLoadState('networkidle');
  88  | 
  89  |     const list = page.getByRole('list');
  90  |     await expect(list).toBeVisible();
  91  | 
  92  |     const listItems = page.getByRole('listitem');
  93  |     const count = await listItems.count();
  94  |     expect(count).toBeGreaterThan(0);
  95  |   });
  96  | 
  97  |   test('should have no missing alt text', async ({ page }) => {
  98  |     await page.goto('/home');
  99  |     await page.waitForLoadState('networkidle');
  100 | 
  101 |     const images = page.locator('img:not([aria-hidden="true"])');
  102 |     const count = await images.count();
  103 | 
  104 |     for (let i = 0; i < count; i++) {
  105 |       const img = images.nth(i);
  106 |       const alt = await img.getAttribute('alt');
  107 |       const ariaLabel = await img.getAttribute('aria-label');
  108 |       
  109 |       const hasAccessibleName = (alt !== null && alt !== '') || (ariaLabel !== null && ariaLabel !== '');
  110 |       expect(hasAccessibleName).toBeTruthy();
  111 |     }
  112 |   });
  113 | });
  114 | 
```