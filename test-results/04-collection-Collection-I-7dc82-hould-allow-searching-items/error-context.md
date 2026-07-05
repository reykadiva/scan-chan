# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-collection.spec.ts >> Collection/Inventory Page >> should allow searching items
- Location: tests\e2e\04-collection.spec.ts:65:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/collection
Call log:
  - navigating to "http://127.0.0.1:3000/collection", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Collection/Inventory Page', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/collection');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/collection
  6  |     await page.waitForLoadState('networkidle');
  7  |   });
  8  | 
  9  |   test('should render collection page', async ({ page }) => {
  10 |     const heading = page.getByRole('heading', { name: /your things/i, level: 1 });
  11 |     await expect(heading).toBeVisible();
  12 |   });
  13 | 
  14 |   test('should display inventory metrics', async ({ page }) => {
  15 |     const metricsSection = page.getByRole('region', { name: /inventory metrics/i });
  16 |     await expect(metricsSection).toBeVisible();
  17 |   });
  18 | 
  19 |   test('should show total items metric', async ({ page }) => {
  20 |     const metric = page.getByLabel(/total items:/i);
  21 |     await expect(metric).toBeVisible();
  22 |   });
  23 | 
  24 |   test('should show capacity metric', async ({ page }) => {
  25 |     const metric = page.getByLabel(/capacity:/i);
  26 |     await expect(metric).toBeVisible();
  27 |   });
  28 | 
  29 |   test('should display search bar', async ({ page }) => {
  30 |     const searchBox = page.getByRole('searchbox', { name: /search items/i });
  31 |     await expect(searchBox).toBeVisible();
  32 |   });
  33 | 
  34 |   test('should display sort controls', async ({ page }) => {
  35 |     const sortButton = page.getByRole('combobox', { name: /sort/i });
  36 |     await expect(sortButton).toBeVisible();
  37 |   });
  38 | 
  39 |   test('should display category filters', async ({ page }) => {
  40 |     const nav = page.getByRole('navigation', { name: /filter items by category/i });
  41 |     await expect(nav).toBeVisible();
  42 |     
  43 |     const allThingsTab = page.getByRole('tab', { name: /all things/i });
  44 |     await expect(allThingsTab).toBeVisible();
  45 |   });
  46 | 
  47 |   test('should display inventory grid', async ({ page }) => {
  48 |     const grid = page.getByRole('grid', { name: /inventory items grid/i });
  49 |     await expect(grid).toBeVisible();
  50 |   });
  51 | 
  52 |   test('should display item details sidebar', async ({ page }) => {
  53 |     const sidebar = page.getByRole('complementary', { name: /item details/i });
  54 |     await expect(sidebar).toBeVisible();
  55 |   });
  56 | 
  57 |   test('should allow filtering by category', async ({ page }) => {
  58 |     const foodsTab = page.getByRole('tab', { name: /foods/i });
  59 |     await foodsTab.click();
  60 |     
  61 |     const selected = await foodsTab.getAttribute('aria-selected');
  62 |     expect(selected).toBe('true');
  63 |   });
  64 | 
  65 |   test('should allow searching items', async ({ page }) => {
  66 |     const searchBox = page.getByRole('searchbox', { name: /search items/i });
  67 |     await searchBox.fill('apple');
  68 |     await page.waitForTimeout(300);
  69 |     
  70 |     const value = await searchBox.inputValue();
  71 |     expect(value).toBe('apple');
  72 |   });
  73 | 
  74 |   test('should select item when clicked', async ({ page }) => {
  75 |     const gridCell = page.getByRole('gridcell').first();
  76 |     const cellVisible = await gridCell.isVisible().catch(() => false);
  77 |     
  78 |     if (cellVisible) {
  79 |       await gridCell.click();
  80 |       await page.waitForTimeout(200);
  81 |       
  82 |       const sidebar = page.getByRole('complementary', { name: /item details/i });
  83 |       const sidebarContent = sidebar.locator('h3').first();
  84 |       await expect(sidebarContent).toBeVisible();
  85 |     }
  86 |   });
  87 | });
  88 | 
```