import type { Locator, Page } from '@playwright/test'

export class DocPage {
  readonly content: Locator

  constructor(public readonly page: Page) {
    this.content = this.page.getByRole('main')
  }

  async goto(url: string) {
    await this.page.goto(`/api${url.startsWith('/') ? url : `/${url}`}${url.endsWith('/') ? '' : '/'}`)
  }
}
