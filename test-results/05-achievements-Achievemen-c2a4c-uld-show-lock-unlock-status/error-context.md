# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-achievements.spec.ts >> Achievements Page >> should show lock/unlock status
- Location: tests\e2e\05-achievements.spec.ts:44:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/achievements
Call log:
  - navigating to "http://127.0.0.1:3000/achievements", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Achievements Page', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/achievements');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/achievements
  6  |     await page.waitForLoadState('networkidle');
  7  |   });
  8  | 
  9  |   test('should render achievements page', async ({ page }) => {
  10 |     const main = page.getByRole('main');
  11 |     await expect(main).toBeVisible();
  12 |   });
  13 | 
  14 |   test('should display achievements heading', async ({ page }) => {
  15 |     const heading = page.getByRole('heading', { name: /achievements/i, level: 1 });
  16 |     await expect(heading).toBeVisible();
  17 |   });
  18 | 
  19 |   test('should display achievement list', async ({ page }) => {
  20 |     const list = page.getByRole('list');
  21 |     await expect(list).toBeVisible();
  22 |   });
  23 | 
  24 |   test('should display achievement items', async ({ page }) => {
  25 |     const listItems = page.getByRole('listitem');
  26 |     const count = await listItems.count();
  27 |     
  28 |     expect(count).toBeGreaterThanOrEqual(1);
  29 |   });
  30 | 
  31 |   test('should show achievement name and description', async ({ page }) => {
  32 |     const firstItem = page.getByRole('listitem').first();
  33 |     await expect(firstItem).toBeVisible();
  34 |     
  35 |     const hasContent = await firstItem.textContent();
  36 |     expect(hasContent).toBeTruthy();
  37 |   });
  38 | 
  39 |   test('should display achievement progress', async ({ page }) => {
  40 |     const progressBar = page.getByRole('progressbar').first();
  41 |     await expect(progressBar).toBeVisible();
  42 |   });
  43 | 
  44 |   test('should show lock/unlock status', async ({ page }) => {
  45 |     const firstItem = page.getByRole('listitem').first();
  46 |     const content = await firstItem.textContent();
  47 |     
  48 |     const hasStatus = content?.includes('Locked') || content?.includes('Unlocked');
  49 |     expect(hasStatus).toBeTruthy();
  50 |   });
  51 | });
  52 | 
```