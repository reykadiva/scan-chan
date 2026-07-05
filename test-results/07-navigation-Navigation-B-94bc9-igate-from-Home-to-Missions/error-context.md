# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 07-navigation.spec.ts >> Navigation Between Pages >> should navigate from Home to Missions
- Location: tests\e2e\07-navigation.spec.ts:36:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/home
Call log:
  - navigating to "http://127.0.0.1:3000/home", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Navigation Between Pages', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/home');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/home
  6  |     await page.waitForLoadState('networkidle');
  7  |   });
  8  | 
  9  |   test('should navigate from Home to Scanner', async ({ page }) => {
  10 |     await page.goto('/scan');
  11 |     await page.waitForLoadState('networkidle');
  12 |     
  13 |     expect(page.url()).toContain('/scan');
  14 |     const heading = page.getByRole('heading', { name: /scanner/i });
  15 |     await expect(heading).toBeVisible();
  16 |   });
  17 | 
  18 |   test('should navigate from Home to Collection', async ({ page }) => {
  19 |     await page.goto('/collection');
  20 |     await page.waitForLoadState('networkidle');
  21 |     
  22 |     expect(page.url()).toContain('/collection');
  23 |     const heading = page.getByRole('heading', { name: /your things/i });
  24 |     await expect(heading).toBeVisible();
  25 |   });
  26 | 
  27 |   test('should navigate from Home to Achievements', async ({ page }) => {
  28 |     await page.goto('/achievements');
  29 |     await page.waitForLoadState('networkidle');
  30 |     
  31 |     expect(page.url()).toContain('/achievements');
  32 |     const heading = page.getByRole('heading', { name: /achievements/i });
  33 |     await expect(heading).toBeVisible();
  34 |   });
  35 | 
  36 |   test('should navigate from Home to Missions', async ({ page }) => {
  37 |     await page.goto('/missions');
  38 |     await page.waitForLoadState('networkidle');
  39 |     
  40 |     expect(page.url()).toContain('/missions');
  41 |     const heading = page.getByRole('heading', { name: /missions/i });
  42 |     await expect(heading).toBeVisible();
  43 |   });
  44 | 
  45 |   test('should complete full navigation cycle', async ({ page }) => {
  46 |     await page.goto('/scan');
  47 |     await page.waitForLoadState('networkidle');
  48 |     expect(page.url()).toContain('/scan');
  49 | 
  50 |     await page.goto('/collection');
  51 |     await page.waitForLoadState('networkidle');
  52 |     expect(page.url()).toContain('/collection');
  53 | 
  54 |     await page.goto('/achievements');
  55 |     await page.waitForLoadState('networkidle');
  56 |     expect(page.url()).toContain('/achievements');
  57 | 
  58 |     await page.goto('/missions');
  59 |     await page.waitForLoadState('networkidle');
  60 |     expect(page.url()).toContain('/missions');
  61 | 
  62 |     await page.goto('/home');
  63 |     await page.waitForLoadState('networkidle');
  64 |     expect(page.url()).toContain('/home');
  65 |   });
  66 | 
  67 |   test('should maintain state during navigation', async ({ page }) => {
  68 |     await page.goto('/home');
  69 |     await page.waitForLoadState('networkidle');
  70 |     
  71 |     const statCard = page.locator('[data-slot="stat-card"]').first();
  72 |     const initialText = await statCard.textContent();
  73 | 
  74 |     await page.goto('/scan');
  75 |     await page.waitForLoadState('networkidle');
  76 | 
  77 |     await page.goto('/home');
  78 |     await page.waitForLoadState('networkidle');
  79 | 
  80 |     const statCardAfterNav = page.locator('[data-slot="stat-card"]').first();
  81 |     const textAfterNav = await statCardAfterNav.textContent();
  82 | 
  83 |     expect(textAfterNav).toBe(initialText);
  84 |   });
  85 | });
  86 | 
```