# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-app-launch.spec.ts >> Application Launch >> should load the application successfully
- Location: tests\e2e\01-app-launch.spec.ts:4:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/
Call log:
  - navigating to "http://127.0.0.1:3000/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Application Launch', () => {
  4  |   test('should load the application successfully', async ({ page }) => {
> 5  |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/
  6  |     await expect(page).toHaveTitle(/Scan Chan|Barcode Adventure/);
  7  |     await expect(page.locator('body')).toBeVisible();
  8  |   });
  9  | 
  10 |   test('should have no console errors on load', async ({ page }) => {
  11 |     const errors: string[] = [];
  12 |     page.on('console', (msg) => {
  13 |       if (msg.type() === 'error') {
  14 |         errors.push(msg.text());
  15 |       }
  16 |     });
  17 | 
  18 |     await page.goto('/');
  19 |     await page.waitForLoadState('networkidle');
  20 |     
  21 |     expect(errors).toEqual([]);
  22 |   });
  23 | 
  24 |   test('should redirect to home hub', async ({ page }) => {
  25 |     await page.goto('/');
  26 |     await page.waitForLoadState('networkidle');
  27 |     
  28 |     const url = page.url();
  29 |     expect(url).toContain('/home');
  30 |   });
  31 | });
  32 | 
```