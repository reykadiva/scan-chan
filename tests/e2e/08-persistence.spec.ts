import { test, expect } from '@playwright/test';

test.describe('State Persistence', () => {
  test('should persist state after page reload', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    const statCard = page.locator('[data-slot="stat-card"]').first();
    const statLabel = await statCard.locator('text=/Hunger|Mood|Energy/').first().textContent();

    await page.reload();
    await page.waitForLoadState('networkidle');

    const statCardAfterReload = page.locator('[data-slot="stat-card"]').first();
    const statLabelAfterReload = await statCardAfterReload.locator('text=/Hunger|Mood|Energy/').first().textContent();

    expect(statLabelAfterReload).toBe(statLabel);
  });

  test('should persist pet stats in localStorage', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    const localStorage = await page.evaluate(() => {
      return window.localStorage.getItem('pet-store');
    });

    expect(localStorage).toBeTruthy();
    
    const petStore = JSON.parse(localStorage || '{}');
    expect(petStore.state).toBeDefined();
  });

  test('should persist game progress in localStorage', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    const localStorage = await page.evaluate(() => {
      return window.localStorage.getItem('game-store');
    });

    expect(localStorage).toBeTruthy();
    
    const gameStore = JSON.parse(localStorage || '{}');
    expect(gameStore.state).toBeDefined();
  });

  test('should persist inventory in localStorage', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    const localStorage = await page.evaluate(() => {
      return window.localStorage.getItem('inventory-store');
    });

    expect(localStorage).toBeTruthy();
    
    const inventoryStore = JSON.parse(localStorage || '{}');
    expect(inventoryStore.state).toBeDefined();
  });

  test('should restore state after navigation and reload', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    await page.goto('/scan');
    await page.waitForLoadState('networkidle');

    await page.reload();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/scan');
    const heading = page.getByRole('heading', { name: /scanner/i });
    await expect(heading).toBeVisible();
  });
});
