import type { Locator, Page } from '@playwright/test'

export class DocPage {
  readonly content: Locator
  title: string | null = null

  constructor(public readonly page: Page) {
    this.content = this.page.getByRole('main')
  }

  async goto(url: string) {
    await this.page.goto(`/api${url.startsWith('/') ? url : `/${url}`}${url.endsWith('/') ? '' : '/'}`)

    const title = await this.content.getByRole('heading', { level: 1 }).textContent()
    this.title = title ? title.trim() : null
  }
}
