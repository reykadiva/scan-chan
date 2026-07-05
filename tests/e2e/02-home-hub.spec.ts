import { test, expect } from '@playwright/test';

test.describe('Home Hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('main', { state: 'visible' });
    await page.waitForTimeout(500);
  });

  test('should render home hub page', async ({ page }) => {
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
  });

  test('should display heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text).toContain('is here');
  });

  test('should render pet summary section', async ({ page }) => {
    const section = page.getByRole('region', { name: /pet summary/i });
    await expect(section).toBeVisible();
  });

  test('should display stat cards', async ({ page }) => {
    const statCards = page.locator('[data-slot="stat-card"]');
    await expect(statCards.first()).toBeVisible();
    
    const count = await statCards.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('should display mascot placeholder', async ({ page }) => {
    const mascot = page.getByRole('img', { name: /feeling/i });
    await expect(mascot).toBeVisible();
  });

  test('should display daily summary', async ({ page }) => {
    const dailySummary = page.locator('[aria-labelledby="daily-summary-title"]');
    await expect(dailySummary).toBeVisible();
  });

  test('should display recommendation card', async ({ page }) => {
    const recommendation = page.locator('[aria-labelledby="recommendation-title"]');
    await expect(recommendation).toBeVisible();
  });

  test('should display status cards', async ({ page }) => {
    const statusCards = page.getByRole('region', { name: /room status/i });
    await expect(statusCards).toBeVisible();
  });
});
