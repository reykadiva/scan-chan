# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 06-missions.spec.ts >> Missions Page >> should display completed missions section if present
- Location: tests\e2e\06-missions.spec.ts:29:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/missions
Call log:
  - navigating to "http://127.0.0.1:3000/missions", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Missions Page', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/missions');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/missions
  6  |     await page.waitForLoadState('networkidle');
  7  |   });
  8  | 
  9  |   test('should render missions page', async ({ page }) => {
  10 |     const main = page.getByRole('main');
  11 |     await expect(main).toBeVisible();
  12 |   });
  13 | 
  14 |   test('should display missions heading', async ({ page }) => {
  15 |     const heading = page.getByRole('heading', { name: /missions/i, level: 1 });
  16 |     await expect(heading).toBeVisible();
  17 |   });
  18 | 
  19 |   test('should display active missions section or empty state', async ({ page }) => {
  20 |     const activeMissionsSection = page.getByRole('region', { name: /active missions/i });
  21 |     const emptyState = page.getByText(/no missions/i);
  22 |     
  23 |     const hasActiveSection = await activeMissionsSection.isVisible().catch(() => false);
  24 |     const hasEmptyState = await emptyState.isVisible().catch(() => false);
  25 |     
  26 |     expect(hasActiveSection || hasEmptyState).toBeTruthy();
  27 |   });
  28 | 
  29 |   test('should display completed missions section if present', async ({ page }) => {
  30 |     const completedSection = page.getByRole('region', { name: /completed missions/i });
  31 |     const isVisible = await completedSection.isVisible().catch(() => false);
  32 |     
  33 |     if (isVisible) {
  34 |       await expect(completedSection).toBeVisible();
  35 |     }
  36 |   });
  37 | 
  38 |   test('should display mission list items if missions exist', async ({ page }) => {
  39 |     const listItems = page.getByRole('listitem');
  40 |     const count = await listItems.count();
  41 |     
  42 |     if (count > 0) {
  43 |       const firstItem = listItems.first();
  44 |       await expect(firstItem).toBeVisible();
  45 |     }
  46 |   });
  47 | 
  48 |   test('should show mission progress if missions exist', async ({ page }) => {
  49 |     const listItems = page.getByRole('listitem');
  50 |     const count = await listItems.count();
  51 |     
  52 |     if (count > 0) {
  53 |       const firstItem = listItems.first();
  54 |       const content = await firstItem.textContent();
  55 |       
  56 |       const hasProgress = content?.includes('Progress') || /\d+\s*\/\s*\d+/.test(content || '');
  57 |       expect(hasProgress).toBeTruthy();
  58 |     }
  59 |   });
  60 | });
  61 | 
```