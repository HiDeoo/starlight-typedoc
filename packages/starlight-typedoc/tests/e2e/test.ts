import { test as base } from '@playwright/test'

import { DocPage } from './fixtures/DocPage'

export { expect } from '@playwright/test'

export const test = base.extend<Fixtures>({
  docPage: async ({ page }, use) => {
    const docPage = new DocPage(page)

    await use(docPage)
  },
})

interface Fixtures {
  docPage: DocPage
}
