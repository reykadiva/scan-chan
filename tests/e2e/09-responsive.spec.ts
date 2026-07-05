import { test, expect } from '@playwright/test';

test.describe('Responsive Layout', () => {
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 720 },
  ];

  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      test('should render Home Hub without overflow', async ({ page }) => {
        await page.goto('/home');
        await page.waitForLoadState('networkidle');

        const body = page.locator('body');
        const scrollWidth = await body.evaluate(el => el.scrollWidth);
        const clientWidth = await body.evaluate(el => el.clientWidth);

        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
      });

      test('should render Scanner page without overflow', async ({ page }) => {
        await page.goto('/scan');
        await page.waitForLoadState('networkidle');

        const body = page.locator('body');
        const scrollWidth = await body.evaluate(el => el.scrollWidth);
        const clientWidth = await body.evaluate(el => el.clientWidth);

        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
      });

      test('should render Collection page without overflow', async ({ page }) => {
        await page.goto('/collection');
        await page.waitForLoadState('networkidle');

        const body = page.locator('body');
        const scrollWidth = await body.evaluate(el => el.scrollWidth);
        const clientWidth = await body.evaluate(el => el.clientWidth);

        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
      });

      test('should have readable text', async ({ page }) => {
        await page.goto('/home');
        await page.waitForLoadState('networkidle');

        const heading = page.getByRole('heading', { level: 1 });
        await expect(heading).toBeVisible();
        
        const fontSize = await heading.evaluate(el => {
          return window.getComputedStyle(el).fontSize;
        });
        
        const fontSizeNum = parseInt(fontSize);
        expect(fontSizeNum).toBeGreaterThanOrEqual(16);
      });
    });
  }
});
