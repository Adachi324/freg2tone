import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: 'browser.test.ts', fullyParallel: false, workers: 1,
  timeout: 45000, expect: { timeout: 7000 }, reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:8877', viewport: { width: 926, height: 428 }, hasTouch: true,
    launchOptions: { executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' },
    screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'npm run preview', url: 'http://127.0.0.1:8877', reuseExistingServer: true },
});
