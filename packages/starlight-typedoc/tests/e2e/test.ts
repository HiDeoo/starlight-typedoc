import { test as base } from '@playwright/test'

import { DocPage } from './fixtures/DocPage'
import { HomePage } from './fixtures/HomePage'

export { expect } from '@playwright/test'

export const test = base.extend<Fixtures>({
  docPage: async ({ page }, use) => {
    const docPage = new DocPage(page)

    await use(docPage)
  },
  homePage: async ({ page }, use) => {
    const todoPage = new HomePage(page)
    await todoPage.goto()

    await use(todoPage)
  },
})

interface Fixtures {
  docPage: DocPage
  homePage: HomePage
}
