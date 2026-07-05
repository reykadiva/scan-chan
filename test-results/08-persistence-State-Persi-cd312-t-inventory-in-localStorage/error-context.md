# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 08-persistence.spec.ts >> State Persistence >> should persist inventory in localStorage
- Location: tests\e2e\08-persistence.spec.ts:48:7

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
  3  | test.describe('State Persistence', () => {
  4  |   test('should persist state after page reload', async ({ page }) => {
  5  |     await page.goto('/home');
  6  |     await page.waitForLoadState('networkidle');
  7  | 
  8  |     const statCard = page.locator('[data-slot="stat-card"]').first();
  9  |     const statLabel = await statCard.locator('text=/Hunger|Mood|Energy/').first().textContent();
  10 | 
  11 |     await page.reload();
  12 |     await page.waitForLoadState('networkidle');
  13 | 
  14 |     const statCardAfterReload = page.locator('[data-slot="stat-card"]').first();
  15 |     const statLabelAfterReload = await statCardAfterReload.locator('text=/Hunger|Mood|Energy/').first().textContent();
  16 | 
  17 |     expect(statLabelAfterReload).toBe(statLabel);
  18 |   });
  19 | 
  20 |   test('should persist pet stats in localStorage', async ({ page }) => {
  21 |     await page.goto('/home');
  22 |     await page.waitForLoadState('networkidle');
  23 | 
  24 |     const localStorage = await page.evaluate(() => {
  25 |       return window.localStorage.getItem('pet-store');
  26 |     });
  27 | 
  28 |     expect(localStorage).toBeTruthy();
  29 |     
  30 |     const petStore = JSON.parse(localStorage || '{}');
  31 |     expect(petStore.state).toBeDefined();
  32 |   });
  33 | 
  34 |   test('should persist game progress in localStorage', async ({ page }) => {
  35 |     await page.goto('/home');
  36 |     await page.waitForLoadState('networkidle');
  37 | 
  38 |     const localStorage = await page.evaluate(() => {
  39 |       return window.localStorage.getItem('game-store');
  40 |     });
  41 | 
  42 |     expect(localStorage).toBeTruthy();
  43 |     
  44 |     const gameStore = JSON.parse(localStorage || '{}');
  45 |     expect(gameStore.state).toBeDefined();
  46 |   });
  47 | 
  48 |   test('should persist inventory in localStorage', async ({ page }) => {
> 49 |     await page.goto('/collection');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/collection
  50 |     await page.waitForLoadState('networkidle');
  51 | 
  52 |     const localStorage = await page.evaluate(() => {
  53 |       return window.localStorage.getItem('inventory-store');
  54 |     });
  55 | 
  56 |     expect(localStorage).toBeTruthy();
  57 |     
  58 |     const inventoryStore = JSON.parse(localStorage || '{}');
  59 |     expect(inventoryStore.state).toBeDefined();
  60 |   });
  61 | 
  62 |   test('should restore state after navigation and reload', async ({ page }) => {
  63 |     await page.goto('/home');
  64 |     await page.waitForLoadState('networkidle');
  65 | 
  66 |     await page.goto('/scan');
  67 |     await page.waitForLoadState('networkidle');
  68 | 
  69 |     await page.reload();
  70 |     await page.waitForLoadState('networkidle');
  71 | 
  72 |     expect(page.url()).toContain('/scan');
  73 |     const heading = page.getByRole('heading', { name: /scanner/i });
  74 |     await expect(heading).toBeVisible();
  75 |   });
  76 | });
  77 | 
```