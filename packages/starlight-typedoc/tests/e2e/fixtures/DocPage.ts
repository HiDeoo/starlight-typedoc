import type { Page } from '@playwright/test'

export class DocPage {
  title: string | null = null

  #useMultipleEntryPoints = false

  constructor(public readonly page: Page) {}

  async goto(url: string) {
    const baseUrl = `http://localhost:${this.#useMultipleEntryPoints ? 3001 : 3000}/${
      this.#useMultipleEntryPoints ? 'api-multiple-entrypoints' : 'api'
    }`

    await this.page.goto(`${baseUrl}${url.startsWith('/') ? url : `/${url}`}${url.endsWith('/') ? '' : '/'}`)

    const title = await this.content.getByRole('heading', { level: 1 }).textContent()
    this.title = title ? title.trim() : null
  }

  useMultipleEntryPoints() {
    this.#useMultipleEntryPoints = true
  }

  get content() {
    return this.page.getByRole('main')
  }

  get #sidebar() {
    return this.page.getByRole('navigation', { name: 'Main' }).locator('div.sidebar')
  }

  get typeDocSidebarLabel() {
    return this.#typeDocSidebarDetails.getByRole('heading', {
      exact: true,
      level: 2,
      name: this.#expectedTypeDocSidebarLabel,
    })
  }

  get typeDocSidebarGroups() {
    return this.#typeDocSidebarDetails.locator('> ul')
  }

  get #expectedTypeDocSidebarLabel() {
    return this.#useMultipleEntryPoints ? 'API' : 'API (auto-generated)'
  }

  get #typeDocSidebarDetails() {
    return this.#sidebar
      .getByRole('listitem')
      .locator(`details:has(summary > h2:has-text("${this.#expectedTypeDocSidebarLabel}"))`)
  }
}
