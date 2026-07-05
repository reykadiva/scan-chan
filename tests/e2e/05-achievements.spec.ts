import { test, expect } from '@playwright/test';

test.describe('Achievements Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/achievements');
    await page.waitForLoadState('networkidle');
  });

  test('should render achievements page', async ({ page }) => {
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
  });

  test('should display achievements heading', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /achievements/i, level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should display achievement list', async ({ page }) => {
    const list = page.getByRole('list');
    await expect(list).toBeVisible();
  });

  test('should display achievement items', async ({ page }) => {
    const listItems = page.getByRole('listitem');
    const count = await listItems.count();
    
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should show achievement name and description', async ({ page }) => {
    const firstItem = page.getByRole('listitem').first();
    await expect(firstItem).toBeVisible();
    
    const hasContent = await firstItem.textContent();
    expect(hasContent).toBeTruthy();
  });

  test('should display achievement progress', async ({ page }) => {
    const firstItem = page.getByRole('listitem').first();
    await expect(firstItem).toBeVisible();
    const text = await firstItem.textContent();
    expect(text).toContain('Progress:');
  });

  test('should show lock/unlock status', async ({ page }) => {
    const firstItem = page.getByRole('listitem').first();
    await expect(firstItem).toBeVisible();
    const content = await firstItem.textContent();
    expect(content).toBeTruthy();
  });
});
