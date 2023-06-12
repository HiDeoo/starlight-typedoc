import { test as base } from '@playwright/test'

import { HomePage } from './fixtures/HomePage'

export { expect } from '@playwright/test'

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    const todoPage = new HomePage(page)
    await todoPage.goto()

    await use(todoPage)
  },
})

interface Fixtures {
  homePage: HomePage
}
