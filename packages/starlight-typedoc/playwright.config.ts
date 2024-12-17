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
            command: 'pnpm build:single-entrypoints && pnpm preview:single-entrypoints',
            cwd: '../../example',
            reuseExistingServer: !process.env['CI'],
            url: 'http://localhost:4321',
          },
          {
            command: 'pnpm build:multiple-entrypoints && pnpm preview:multiple-entrypoints',
            cwd: '../../example',
            reuseExistingServer: !process.env['CI'],
            url: 'http://localhost:4322/multiple-entrypoints/',
          },
        ]
      : process.env['TEST_TYPE'] === 'plugins'
        ? [
            {
              command: 'pnpm build:multiple-plugins && pnpm preview:multiple-plugins',
              cwd: '../../example',
              reuseExistingServer: !process.env['CI'],
              url: 'http://localhost:4321/multiple-plugins/',
            },
          ]
        : [
            {
              command: 'pnpm build:packages-entrypoints && pnpm preview:packages-entrypoints',
              cwd: '../../example',
              reuseExistingServer: !process.env['CI'],
              url: 'http://localhost:4321/packages-entrypoints/',
            },
          ],
})
