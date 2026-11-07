import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : undefined,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
  ],
  use: {
    baseURL: 'http://127.0.0.1:8787', headless: true,
    trace: 'retain-on-failure', screenshot: 'only-on-failure',
  },
  webServer: { command: 'npm run worker:dev -- --port 8787 --ip 127.0.0.1', url: 'http://127.0.0.1:8787/api/health', timeout: 60000, reuseExistingServer: !process.env.CI },
});
