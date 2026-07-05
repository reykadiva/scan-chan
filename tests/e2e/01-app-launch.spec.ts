import { test, expect } from '@playwright/test';

test.describe('Application Launch', () => {
  test('should load the application successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Scan Chan|Barcode Adventure/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    expect(errors).toEqual([]);
  });

  test('should redirect to home hub', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    expect(url).toContain('/home');
  });
});
