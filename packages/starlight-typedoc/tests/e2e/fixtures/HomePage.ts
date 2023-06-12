import type { Locator, Page } from '@playwright/test'

export class HomePage {
  readonly sidebar: Locator
  readonly typeDocSidebarLabel: Locator
  readonly typeDocSidebarRootList: Locator

  constructor(public readonly page: Page) {
    const label = 'API (auto-generated)'

    this.sidebar = this.page.getByRole('navigation', { name: 'Main' }).locator('div.sidebar')

    const typeDocSidebarDetails = this.sidebar
      .getByRole('listitem')
      .locator(`details:has(summary > h2:has-text("${label}"))`)

    this.typeDocSidebarLabel = typeDocSidebarDetails.getByRole('heading', {
      level: 2,
      name: label,
      exact: true,
    })

    this.typeDocSidebarRootList = typeDocSidebarDetails.locator('> ul')
  }

  async goto() {
    await this.page.goto('/guides/example/')
  }
}
