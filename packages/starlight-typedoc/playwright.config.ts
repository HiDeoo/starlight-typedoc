import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  forbidOnly: !!process.env['CI'],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
  ],
  testDir: `tests/e2e/${process.env['TEST_TYPE']}`,
  webServer:
    process.env['TEST_TYPE'] === 'basics'
      ? [
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
        ]
      : process.env['TEST_TYPE'] === 'plugins'
      ? [
          {
            command: 'pnpm run dev:multiple-plugins',
            cwd: '../../example',
            reuseExistingServer: !process.env['CI'],
            url: 'http://localhost:4321/multiple-plugins/',
          },
        ]
      : [
          {
            command: 'pnpm run dev:packages-entrypoints',
            cwd: '../../example',
            reuseExistingServer: !process.env['CI'],
            url: 'http://localhost:4321/packages-entrypoints/',
          },
        ],
})
