import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  forbidOnly: !!process.env['CI'],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  testDir: 'tests/e2e',
  webServer: [
    {
      command: 'pnpm run dev:single-entrypoints',
      cwd: '../../example',
      reuseExistingServer: !process.env['CI'],
      url: 'http://localhost:4321',
    },
    {
      command: 'pnpm run dev:multiple-entrypoints',
      cwd: '../../example',
      reuseExistingServer: !process.env['CI'],
      url: 'http://localhost:4322/multiple-entrypoints/',
    },
  ],
})
