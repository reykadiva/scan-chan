# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-home-hub.spec.ts >> Home Hub >> should display mascot placeholder
- Location: tests\e2e\02-home-hub.spec.ts:34:7

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
  3  | test.describe('Home Hub', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/home');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/home
  6  |     await page.waitForLoadState('networkidle');
  7  |   });
  8  | 
  9  |   test('should render home hub page', async ({ page }) => {
  10 |     const main = page.getByRole('main');
  11 |     await expect(main).toBeVisible();
  12 |   });
  13 | 
  14 |   test('should display heading', async ({ page }) => {
  15 |     const heading = page.getByRole('heading', { level: 1 });
  16 |     await expect(heading).toBeVisible();
  17 |     const text = await heading.textContent();
  18 |     expect(text).toContain('is here');
  19 |   });
  20 | 
  21 |   test('should render pet summary section', async ({ page }) => {
  22 |     const section = page.getByRole('region', { name: /pet summary/i });
  23 |     await expect(section).toBeVisible();
  24 |   });
  25 | 
  26 |   test('should display stat cards', async ({ page }) => {
  27 |     const statCards = page.locator('[data-slot="stat-card"]');
  28 |     await expect(statCards.first()).toBeVisible();
  29 |     
  30 |     const count = await statCards.count();
  31 |     expect(count).toBeGreaterThanOrEqual(5);
  32 |   });
  33 | 
  34 |   test('should display mascot placeholder', async ({ page }) => {
  35 |     const mascot = page.getByRole('img', { name: /feeling/i });
  36 |     await expect(mascot).toBeVisible();
  37 |   });
  38 | 
  39 |   test('should display daily summary', async ({ page }) => {
  40 |     const dailySummary = page.getByRole('region', { name: /today/i });
  41 |     await expect(dailySummary).toBeVisible();
  42 |   });
  43 | 
  44 |   test('should display recommendation card', async ({ page }) => {
  45 |     const recommendation = page.getByRole('region', { name: /next gentle action/i });
  46 |     await expect(recommendation).toBeVisible();
  47 |   });
  48 | 
  49 |   test('should display status cards', async ({ page }) => {
  50 |     const statusCards = page.getByRole('region', { name: /room status/i });
  51 |     await expect(statusCards).toBeVisible();
  52 |   });
  53 | });
  54 | 
```