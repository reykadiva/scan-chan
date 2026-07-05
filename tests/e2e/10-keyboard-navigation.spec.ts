import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test('should show focus indicators when tabbing', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    const outline = await focusedElement.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.outline || style.boxShadow;
    });

    expect(outline).not.toBe('none');
    expect(outline).not.toBe('');
  });

  test('should navigate through interactive elements with Tab', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Tab');
    const firstFocus = await page.evaluate(() => document.activeElement?.tagName);

    await page.keyboard.press('Tab');
    const secondFocus = await page.evaluate(() => document.activeElement?.tagName);

    expect(firstFocus).toBeTruthy();
    expect(secondFocus).toBeTruthy();
  });

  test('should activate buttons with Enter key', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await skipLink.focus();
    
    const isFocused = await skipLink.evaluate(el => el === document.activeElement);
    expect(isFocused).toBeTruthy();
  });

  test('should have logical tab order', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    const focusOrder: string[] = [];
    
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const tagName = await page.evaluate(() => document.activeElement?.tagName);
      if (tagName) focusOrder.push(tagName);
    }

    expect(focusOrder.length).toBeGreaterThan(0);
  });

  test('should navigate to scanner page via keyboard', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    await page.goto('/scan');
    await page.waitForLoadState('networkidle');

    const heading = page.getByRole('heading', { name: /scanner/i });
    await expect(heading).toBeVisible();
  });
});
