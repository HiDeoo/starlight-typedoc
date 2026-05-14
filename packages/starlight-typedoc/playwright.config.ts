import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env['CI']

const webServerOptions = {
  cwd: '../../example',
  reuseExistingServer: isCI,
}

export default defineConfig({
  forbidOnly: isCI,
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Re-use system Chrome on CI to avoid re-installing it on every run.
        channel: isCI ? 'chrome' : undefined,
        headless: true,
      },
    },
  ],
  testDir: `tests/e2e/${process.env['TEST_TYPE']}`,
  webServer:
    process.env['TEST_TYPE'] === 'basics'
      ? [
          {
            ...webServerOptions,
            command: 'pnpm build:single-entrypoints && pnpm preview:single-entrypoints',
            url: 'http://localhost:4321',
          },
          {
            ...webServerOptions,
            command: 'pnpm build:multiple-entrypoints && pnpm preview:multiple-entrypoints',
            url: 'http://localhost:4322/multiple-entrypoints/',
          },
        ]
      : process.env['TEST_TYPE'] === 'plugins'
        ? [
            {
              ...webServerOptions,
              command: 'pnpm build:multiple-plugins && pnpm preview:multiple-plugins',
              url: 'http://localhost:4321/multiple-plugins/',
            },
          ]
        : [
            {
              ...webServerOptions,
              command: 'pnpm build:packages-entrypoints && pnpm preview:packages-entrypoints',
              url: 'http://localhost:4321/packages-entrypoints/',
            },
          ],
})
