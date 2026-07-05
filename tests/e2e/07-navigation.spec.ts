import { test, expect } from '@playwright/test';

test.describe('Navigation Between Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate from Home to Scanner', async ({ page }) => {
    await page.goto('/scan');
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/scan');
    const heading = page.getByRole('heading', { name: /scanner/i });
    await expect(heading).toBeVisible();
  });

  test('should navigate from Home to Collection', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/collection');
    const heading = page.getByRole('heading', { name: /your things/i });
    await expect(heading).toBeVisible();
  });

  test('should navigate from Home to Achievements', async ({ page }) => {
    await page.goto('/achievements');
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/achievements');
    const heading = page.getByRole('heading', { name: /achievements/i });
    await expect(heading).toBeVisible();
  });

  test('should navigate from Home to Missions', async ({ page }) => {
    await page.goto('/missions');
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/missions');
    const heading = page.getByRole('heading', { name: /missions/i });
    await expect(heading).toBeVisible();
  });

  test('should complete full navigation cycle', async ({ page }) => {
    await page.goto('/scan');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/scan');

    await page.goto('/collection');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/collection');

    await page.goto('/achievements');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/achievements');

    await page.goto('/missions');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/missions');

    await page.goto('/home');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/home');
  });

  test('should maintain state during navigation', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
    
    const statCard = page.locator('[data-slot="stat-card"]').first();
    const initialText = await statCard.textContent();

    await page.goto('/scan');
    await page.waitForLoadState('networkidle');

    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    const statCardAfterNav = page.locator('[data-slot="stat-card"]').first();
    const textAfterNav = await statCardAfterNav.textContent();

    expect(textAfterNav).toBe(initialText);
  });
});
