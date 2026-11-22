import { defineConfig, devices } from '@playwright/test';

// SC-003: Safety Guard - Refuse running tests against live production
const targetBaseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
if (targetBaseUrl.includes('scanchan.vercel.app')) {
  throw new Error('SECURITY VIOLATION: Playwright tests are blocked from running against production (scanchan.vercel.app)!');
}

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts', // Only run .spec.ts files (not .test.ts)
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: targetBaseUrl,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Comment out webServer to use already-running dev server
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },
});
