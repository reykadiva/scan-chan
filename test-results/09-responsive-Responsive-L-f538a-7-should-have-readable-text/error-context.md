# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 09-responsive.spec.ts >> Responsive Layout >> iPhone SE (375x667) >> should have readable text
- Location: tests\e2e\09-responsive.spec.ts:47:11

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
  3  | test.describe('Responsive Layout', () => {
  4  |   const viewports = [
  5  |     { name: 'iPhone SE', width: 375, height: 667 },
  6  |     { name: 'iPad', width: 768, height: 1024 },
  7  |     { name: 'Desktop', width: 1280, height: 720 },
  8  |   ];
  9  | 
  10 |   for (const viewport of viewports) {
  11 |     test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
  12 |       test.use({ viewport: { width: viewport.width, height: viewport.height } });
  13 | 
  14 |       test('should render Home Hub without overflow', async ({ page }) => {
  15 |         await page.goto('/home');
  16 |         await page.waitForLoadState('networkidle');
  17 | 
  18 |         const body = page.locator('body');
  19 |         const scrollWidth = await body.evaluate(el => el.scrollWidth);
  20 |         const clientWidth = await body.evaluate(el => el.clientWidth);
  21 | 
  22 |         expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  23 |       });
  24 | 
  25 |       test('should render Scanner page without overflow', async ({ page }) => {
  26 |         await page.goto('/scan');
  27 |         await page.waitForLoadState('networkidle');
  28 | 
  29 |         const body = page.locator('body');
  30 |         const scrollWidth = await body.evaluate(el => el.scrollWidth);
  31 |         const clientWidth = await body.evaluate(el => el.clientWidth);
  32 | 
  33 |         expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  34 |       });
  35 | 
  36 |       test('should render Collection page without overflow', async ({ page }) => {
  37 |         await page.goto('/collection');
  38 |         await page.waitForLoadState('networkidle');
  39 | 
  40 |         const body = page.locator('body');
  41 |         const scrollWidth = await body.evaluate(el => el.scrollWidth);
  42 |         const clientWidth = await body.evaluate(el => el.clientWidth);
  43 | 
  44 |         expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  45 |       });
  46 | 
  47 |       test('should have readable text', async ({ page }) => {
> 48 |         await page.goto('/home');
     |                    ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/home
  49 |         await page.waitForLoadState('networkidle');
  50 | 
  51 |         const heading = page.getByRole('heading', { level: 1 });
  52 |         await expect(heading).toBeVisible();
  53 |         
  54 |         const fontSize = await heading.evaluate(el => {
  55 |           return window.getComputedStyle(el).fontSize;
  56 |         });
  57 |         
  58 |         const fontSizeNum = parseInt(fontSize);
  59 |         expect(fontSizeNum).toBeGreaterThanOrEqual(16);
  60 |       });
  61 |     });
  62 |   }
  63 | });
  64 | 
```