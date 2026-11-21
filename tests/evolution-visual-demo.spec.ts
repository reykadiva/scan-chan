import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const PROD_URL = 'https://scanchan.vercel.app';

test.describe('🐾 Scan-Chan Evolution Stages & Moods Visual Demo', () => {
  test.setTimeout(120000);

  test.beforeAll(async () => {
    const resultsDir = path.resolve(process.cwd(), 'test-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
  });

  test('Visual Verification across all 5 Stages & Mood states', async ({ page, context }) => {
    await context.clearCookies();
    const todayStr = new Date().toISOString().split('T')[0];

    await page.goto(PROD_URL, { waitUntil: 'networkidle' });

    // Wait for title screen and press to start
    const startBtn = page.locator('text=PRESS TO START');
    await expect(startBtn).toBeVisible({ timeout: 15000 });
    await startBtn.click();

    // Click Play as Guest on Auth modal
    const guestBtn = page.locator('button:has-text("Play as Guest")');
    await expect(guestBtn).toBeVisible({ timeout: 15000 });
    await guestBtn.click();

    await page.waitForURL('**/play', { timeout: 20000 });
    const companionCard = page.locator('section:has-text("Your Partner Companion")');
    await expect(companionCard).toBeVisible({ timeout: 15000 });

    // Helper to update store via localStorage & reload
    const setPetState = async (updates: Record<string, any>) => {
      await page.evaluate(({ data, today }) => {
        const raw = localStorage.getItem('scan-chan-player-state');
        const parsed = raw ? JSON.parse(raw) : { state: {} };
        parsed.state = {
          ...parsed.state,
          lastActiveDate: today,
          ...data,
        };
        localStorage.setItem('scan-chan-player-state', JSON.stringify(parsed));
      }, { data: updates, today: todayStr });

      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('section:has-text("Your Partner Companion")')).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(1000); // Allow animations & layout to settle
    };

    // ─────────────────────────────────────────────────────────────────────────
    // STAGE 1: KITTEN (Level 1, Hunger 50, Affection 10)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('Capturing Stage 1: Kitten...');
    await setPetState({
      petStage: 'KITTEN',
      avatar: 'calico',
      level: 1,
      xp: 0,
      petHunger: 75, // resets to 50%
      petAffection: 10,
      selectedAccessory: 'none',
    });
    await expect(page.locator('text=Kitten • Stage KITTEN')).toBeVisible();
    await expect(page.getByText('LEVEL 1', { exact: true })).toBeVisible();
    await companionCard.screenshot({ path: 'test-results/evolution-01-kitten.png' });

    // ─────────────────────────────────────────────────────────────────────────
    // STAGE 2: YOUNG CAT (Level 10, Hunger 75, Affection 30, Accessory: Cowboy)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('Capturing Stage 2: Young Cat...');
    await setPetState({
      petStage: 'YOUNG_CAT',
      avatar: 'tabby',
      level: 10,
      xp: 1450,
      petHunger: 100, // resets to 75%
      petAffection: 30,
      selectedAccessory: 'cowboy',
    });
    await expect(page.locator('text=Young Cat • Stage YOUNG_CAT')).toBeVisible();
    await expect(page.getByText('LEVEL 10', { exact: true })).toBeVisible();
    await companionCard.screenshot({ path: 'test-results/evolution-02-young-cat.png' });

    // ─────────────────────────────────────────────────────────────────────────
    // STAGE 3: ADULT CAT (Level 20, Hunger 85, Affection 60, Accessory: Wizard)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('Capturing Stage 3: Adult Cat...');
    await setPetState({
      petStage: 'ADULT_CAT',
      avatar: 'black',
      level: 20,
      xp: 5000,
      petHunger: 110, // resets to 85%
      petAffection: 60,
      selectedAccessory: 'wizard',
    });
    await expect(page.locator('text=Adult Cat • Stage ADULT_CAT')).toBeVisible();
    await expect(page.getByText('LEVEL 20', { exact: true })).toBeVisible();
    await companionCard.screenshot({ path: 'test-results/evolution-03-adult-cat.png' });

    // ─────────────────────────────────────────────────────────────────────────
    // STAGE 4: WISE CAT (Level 35, Hunger 90, Affection 80, Accessory: Shades)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('Capturing Stage 4: Wise Cat...');
    await setPetState({
      petStage: 'WISE_CAT',
      avatar: 'cyan',
      level: 35,
      xp: 16000,
      petHunger: 115, // resets to 90%
      petAffection: 80,
      selectedAccessory: 'shades',
    });
    await expect(page.locator('text=Wise Cat • Stage WISE_CAT')).toBeVisible();
    await expect(page.getByText('LEVEL 35', { exact: true })).toBeVisible();
    await companionCard.screenshot({ path: 'test-results/evolution-04-wise-cat.png' });

    // ─────────────────────────────────────────────────────────────────────────
    // STAGE 5: LEGENDARY CAT PEAK (Level 50, Hunger 100, Affection 100)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('Capturing Stage 5: Legendary Cat Peak...');
    await setPetState({
      petStage: 'LEGENDARY_CAT',
      avatar: 'arashu-smiling',
      level: 50,
      xp: 36000,
      petHunger: 125, // resets to 100%
      petAffection: 100,
      selectedAccessory: 'none',
    });
    await expect(page.locator('text=Legendary Cat • Stage LEGENDARY_CAT')).toBeVisible();
    await expect(page.getByText('LEVEL 50', { exact: true })).toBeVisible();
    await companionCard.screenshot({ path: 'test-results/evolution-05-legendary-peak.png' });

    // ─────────────────────────────────────────────────────────────────────────
    // MOOD 1: DEAD / FAINTED (0% Hunger, Cross Eyes, Floating Ghost Spirit)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('Capturing Mood: Dead / Fainted (0% Hunger)...');
    await setPetState({
      petStage: 'KITTEN',
      avatar: 'calico',
      level: 1,
      xp: 0,
      petHunger: 0,
      petAffection: 10,
      selectedAccessory: 'none',
    });
    await expect(page.locator('text=[Feed to Revive! 🍖]')).toBeVisible();
    await companionCard.screenshot({ path: 'test-results/evolution-mood-01-fainted.png' });

    // ─────────────────────────────────────────────────────────────────────────
    // MOOD 2: VERY SAD / STARVING (15% Hunger, Blue Tears Dripping)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('Capturing Mood: Very Sad / Starving (15% Hunger)...');
    await setPetState({
      petStage: 'KITTEN',
      avatar: 'calico',
      level: 1,
      xp: 0,
      petHunger: 40, // resets to 15% (<= 25%)
      petAffection: 10,
      selectedAccessory: 'none',
    });
    await expect(page.locator('text=[Feed Me! 😿]')).toBeVisible();
    await companionCard.screenshot({ path: 'test-results/evolution-mood-02-starving.png' });

    // ─────────────────────────────────────────────────────────────────────────
    // MOOD 3: HAPPY / FULL MEOW (Legendary Cat at 100% Hunger with Meow Bubble)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('Capturing Mood: Peak Happy Meow...');
    await setPetState({
      petStage: 'LEGENDARY_CAT',
      avatar: 'arashu-smiling',
      level: 50,
      xp: 36000,
      petHunger: 125, // resets to 100%
      petAffection: 100,
      selectedAccessory: 'none',
    });

    // Click cat to trigger speech bubble
    const catBox = page.locator('div[title="Click your partner to interact!"]');
    await catBox.click();
    await page.waitForTimeout(500);

    await companionCard.screenshot({ path: 'test-results/evolution-mood-03-happy-meow.png' });
    console.log('All visual stages and moods successfully captured!');
  });
});
