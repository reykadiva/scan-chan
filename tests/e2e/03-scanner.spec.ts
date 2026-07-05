import { test, expect } from '@playwright/test';

test.describe('Scanner Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scan');
    await page.waitForLoadState('networkidle');
  });

  test('should render scanner page', async ({ page }) => {
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
  });

  test('should display scanner heading', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /scanner/i, level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should render camera preview area', async ({ page }) => {
    const preview = page.getByLabel(/camera preview/i);
    await expect(preview).toBeVisible();
  });

  test('should display scanner controls', async ({ page }) => {
    const controls = page.locator('[aria-labelledby="scanner-controls-title"]');
    await expect(controls).toBeVisible();
  });

  test('should have start camera button', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /Request camera permission/i });
    await expect(startButton).toBeVisible();
  });

  test('should have switch camera button', async ({ page }) => {
    const switchButton = page.getByRole('button', { name: /switch/i });
    await expect(switchButton).toBeVisible();
  });

  test('should have close scanner button', async ({ page }) => {
    const closeButton = page.getByRole('button', { name: /close scanner/i });
    await expect(closeButton).toBeVisible();
  });

  test('should navigate back to home when close button clicked', async ({ page }) => {
    const closeButton = page.getByRole('button', { name: /close scanner/i });
    await closeButton.click();
    await page.waitForURL('**/home', { timeout: 5000 });
    
    expect(page.url()).toContain('/home');
  });

  test('should display scanner status', async ({ page }) => {
    const status = page.locator('[data-slot="status-chip"]').first();
    await expect(status).toBeVisible();
  });
});
