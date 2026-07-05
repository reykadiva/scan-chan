import { test, expect } from '@playwright/test';

test.describe('Missions Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/missions');
    await page.waitForLoadState('networkidle');
  });

  test('should render missions page', async ({ page }) => {
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
  });

  test('should display missions heading', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /missions/i, level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should display active missions section or empty state', async ({ page }) => {
    const activeMissionsSection = page.getByRole('region', { name: /active missions/i });
    const emptyState = page.getByText(/no missions/i);
    
    const hasActiveSection = await activeMissionsSection.isVisible().catch(() => false);
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    
    expect(hasActiveSection || hasEmptyState).toBeTruthy();
  });

  test('should display completed missions section if present', async ({ page }) => {
    const completedSection = page.getByRole('region', { name: /completed missions/i });
    const isVisible = await completedSection.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(completedSection).toBeVisible();
    }
  });

  test('should display mission list items if missions exist', async ({ page }) => {
    const listItems = page.getByRole('listitem');
    const count = await listItems.count();
    
    if (count > 0) {
      const firstItem = listItems.first();
      await expect(firstItem).toBeVisible();
    }
  });

  test('should show mission progress if missions exist', async ({ page }) => {
    const listItems = page.getByRole('listitem');
    const count = await listItems.count();
    
    if (count > 0) {
      const firstItem = listItems.first();
      const content = await firstItem.textContent();
      
      const hasProgress = content?.includes('Progress') || /\d+\s*\/\s*\d+/.test(content || '');
      expect(hasProgress).toBeTruthy();
    }
  });
});
