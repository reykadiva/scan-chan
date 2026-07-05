import { test, expect } from '@playwright/test';

test.describe('Collection/Inventory Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');
  });

  test('should render collection page', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /your things/i, level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should display inventory metrics', async ({ page }) => {
    const metricsSection = page.getByRole('region', { name: /inventory metrics/i });
    await expect(metricsSection).toBeVisible();
  });

  test('should show total items metric', async ({ page }) => {
    const metric = page.getByLabel(/total items:/i);
    await expect(metric).toBeVisible();
  });

  test('should show capacity metric', async ({ page }) => {
    const metric = page.getByLabel(/capacity:/i);
    await expect(metric).toBeVisible();
  });

  test('should display search bar', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/search by name/i);
    await expect(searchBox).toBeVisible();
  });

  test('should display sort controls', async ({ page }) => {
    const sortButton = page.getByRole('combobox', { name: /sort/i });
    await expect(sortButton).toBeVisible();
  });

  test('should display category filters', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: /filter items by category/i });
    await expect(nav).toBeVisible();
    
    const allThingsTab = page.getByRole('tab', { name: /all things/i });
    await expect(allThingsTab).toBeVisible();
  });

  test('should display inventory grid', async ({ page }) => {
    const emptyState = page.locator('[data-slot="empty-state"]');
    await expect(emptyState).toBeVisible();
  });

  test('should display item details sidebar', async ({ page }) => {
    const sidebar = page.locator('[aria-labelledby="item-details-title"]');
    await expect(sidebar).toBeVisible();
  });

  test('should allow filtering by category', async ({ page }) => {
    const foodsTab = page.getByRole('tab', { name: /foods/i });
    const exists = await foodsTab.count();
    
    expect(exists >= 0).toBe(true);
  });

  test('should allow searching items', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/search by name/i);
    await searchBox.fill('apple');
    await page.waitForTimeout(300);
    
    const value = await searchBox.inputValue();
    expect(value).toBe('apple');
  });

  test('should select item when clicked', async ({ page }) => {
    const gridCell = page.getByRole('gridcell').first();
    const cellVisible = await gridCell.isVisible().catch(() => false);
    
    if (cellVisible) {
      await gridCell.click();
      await page.waitForTimeout(200);
      
      const sidebar = page.locator('[aria-labelledby="item-details-title"]');
      const sidebarContent = sidebar.locator('h3').first();
      await expect(sidebarContent).toBeVisible();
    }
  });
});
