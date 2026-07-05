# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03-scanner.spec.ts >> Scanner Page >> should have switch camera button
- Location: tests\e2e\03-scanner.spec.ts:34:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/scan
Call log:
  - navigating to "http://127.0.0.1:3000/scan", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Scanner Page', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/scan');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/scan
  6  |     await page.waitForLoadState('networkidle');
  7  |   });
  8  | 
  9  |   test('should render scanner page', async ({ page }) => {
  10 |     const main = page.getByRole('main');
  11 |     await expect(main).toBeVisible();
  12 |   });
  13 | 
  14 |   test('should display scanner heading', async ({ page }) => {
  15 |     const heading = page.getByRole('heading', { name: /scanner/i, level: 1 });
  16 |     await expect(heading).toBeVisible();
  17 |   });
  18 | 
  19 |   test('should render camera preview area', async ({ page }) => {
  20 |     const preview = page.getByLabel(/camera preview/i);
  21 |     await expect(preview).toBeVisible();
  22 |   });
  23 | 
  24 |   test('should display scanner controls', async ({ page }) => {
  25 |     const controls = page.getByRole('complementary', { name: /scanner controls/i });
  26 |     await expect(controls).toBeVisible();
  27 |   });
  28 | 
  29 |   test('should have start camera button', async ({ page }) => {
  30 |     const startButton = page.getByRole('button', { name: /start camera/i });
  31 |     await expect(startButton).toBeVisible();
  32 |   });
  33 | 
  34 |   test('should have switch camera button', async ({ page }) => {
  35 |     const switchButton = page.getByRole('button', { name: /switch/i });
  36 |     await expect(switchButton).toBeVisible();
  37 |   });
  38 | 
  39 |   test('should have close scanner button', async ({ page }) => {
  40 |     const closeButton = page.getByRole('button', { name: /close scanner/i });
  41 |     await expect(closeButton).toBeVisible();
  42 |   });
  43 | 
  44 |   test('should navigate back to home when close button clicked', async ({ page }) => {
  45 |     const closeButton = page.getByRole('button', { name: /close scanner/i });
  46 |     await closeButton.click();
  47 |     await page.waitForLoadState('networkidle');
  48 |     
  49 |     expect(page.url()).toContain('/home');
  50 |   });
  51 | 
  52 |   test('should display scanner status', async ({ page }) => {
  53 |     const status = page.locator('[data-slot="status-chip"]').first();
  54 |     await expect(status).toBeVisible();
  55 |   });
  56 | });
  57 | 
```