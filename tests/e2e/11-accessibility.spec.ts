import { test, expect } from '@playwright/test';

test.describe('Accessibility Smoke Tests', () => {
  test('should have page title', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have main landmark', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    const main = page.getByRole('main');
    await expect(main).toBeVisible();
  });

  test('should have heading hierarchy', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
  });

  test('should have descriptive button labels', async ({ page }) => {
    await page.goto('/scan');
    await page.waitForLoadState('networkidle');

    const buttons = page.getByRole('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const accessibleName = await button.getAttribute('aria-label') || await button.textContent();
      expect(accessibleName).toBeTruthy();
      expect(accessibleName?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should have aria-labels on interactive elements', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    const searchBox = page.getByRole('searchbox');
    const label = await searchBox.getAttribute('aria-label');
    expect(label).toBeTruthy();
  });

  test('should have landmarks on all pages', async ({ page }) => {
    const pages = ['/home', '/scan', '/collection', '/achievements', '/missions'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      const main = page.getByRole('main');
      const isVisible = await main.isVisible().catch(() => false);
      expect(isVisible).toBeTruthy();
    }
  });

  test('should have progress bars with aria attributes', async ({ page }) => {
    await page.goto('/achievements');
    await page.waitForLoadState('networkidle');

    const progressBar = page.getByRole('progressbar').first();
    const isVisible = await progressBar.isVisible().catch(() => false);

    if (isVisible) {
      const ariaValueMin = await progressBar.getAttribute('aria-valuemin');
      const ariaValueMax = await progressBar.getAttribute('aria-valuemax');
      const ariaValueNow = await progressBar.getAttribute('aria-valuenow');

      expect(ariaValueMin).toBeTruthy();
      expect(ariaValueMax).toBeTruthy();
      expect(ariaValueNow).toBeTruthy();
    }
  });

  test('should have list structure for achievements', async ({ page }) => {
    await page.goto('/achievements');
    await page.waitForLoadState('networkidle');

    const list = page.getByRole('list');
    await expect(list).toBeVisible();

    const listItems = page.getByRole('listitem');
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have no missing alt text', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img:not([aria-hidden="true"])');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      
      const hasAccessibleName = (alt !== null && alt !== '') || (ariaLabel !== null && ariaLabel !== '');
      expect(hasAccessibleName).toBeTruthy();
    }
  });
});
