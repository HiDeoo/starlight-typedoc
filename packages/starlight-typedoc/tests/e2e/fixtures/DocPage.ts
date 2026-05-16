import type { Locator, Page } from '@playwright/test'

export class DocPage {
  title: string | null = null

  #useMultipleEntryPoints = false
  #usePackagesEntryPoints = false
  #useMultiplePlugins = false

  constructor(public readonly page: Page) {}

  async goto(url: string) {
    const baseDir = this.#useMultipleEntryPoints
      ? 'multiple-entrypoints/api-multiple-entrypoints'
      : this.#usePackagesEntryPoints
        ? 'packages-entrypoints/api-packages-entrypoints'
        : this.#useMultiplePlugins
          ? 'multiple-plugins'
          : 'api'
    const baseUrl = `http://localhost:${this.#useMultipleEntryPoints ? 4322 : 4321}/${baseDir}`

    await this.page.goto(`${baseUrl}${url.startsWith('/') ? url : `/${url}`}${url.endsWith('/') ? '' : '/'}`)

    const title = await this.content.getByRole('heading', { level: 1 }).textContent()
    this.title = title ? title.trim() : null
  }

  useMultipleEntryPoints() {
    this.#useMultipleEntryPoints = true
  }

  usePackagesEntryPoints() {
    this.#usePackagesEntryPoints = true
  }

  useMultiplePlugins() {
    this.#useMultiplePlugins = true
  }

  get content() {
    return this.page.getByRole('main')
  }

  get sidebar() {
    return this.page.getByRole('navigation', { name: 'Main' })
  }

  get typeDocSidebarLabel() {
    return this.#typeDocSidebarRootDetails.getByText(this.#expectedTypeDocSidebarLabel, {
      exact: true,
    })
  }

  get #expectedTypeDocSidebarLabel() {
    return this.#useMultipleEntryPoints || this.#usePackagesEntryPoints ? 'API' : 'API (auto-generated)'
  }

  get #typeDocSidebarRootDetails() {
    return this.sidebar
      .getByRole('listitem')
      .locator(`details:has(summary > span > span:has-text("${this.#expectedTypeDocSidebarLabel}"))`)
  }

  getTypeDocSidebarItems() {
    return this.#getTypeDocSidebarChildrenItems(this.#typeDocSidebarRootDetails.locator('> ul'))
  }

  async getSidebarItems() {
    return this.#getTypeDocSidebarChildrenItems(this.sidebar.locator('ul.top-level'))
  }

  async #getTypeDocSidebarChildrenItems(list: Locator): Promise<TypeDocSidebarItem[]> {
    const items: TypeDocSidebarItem[] = []

    for (const li of await list.locator('> li').all()) {
      const category = li.locator('> details').first()
      if ((await category.count()) > 0) {
        items.push({
          collapsed: !(await category.getAttribute('open')),
          label: await category.locator(`> summary > span > span:not(.sl-badge)`).textContent(),
          items: await this.#getTypeDocSidebarChildrenItems(category.locator('> ul')),
        })
        continue
      }

      const link = li.locator('> a > span:not(.sl-badge)').first()
      if ((await link.count()) > 0) {
        const name = await link.textContent()
        items.push({ name: name ? name.trim() : null })
      }
    }

    return items
  }

  async isTypeDocSidebarCollapsed() {
    return (await this.#typeDocSidebarRootDetails.getAttribute('open')) === null
  }
}

type TypeDocSidebarItem = TypeDocSidebarItemGroup | TypeDocSidebarItemLink

interface TypeDocSidebarItemLink {
  name: string | null
}

interface TypeDocSidebarItemGroup {
  collapsed: boolean
  items: (TypeDocSidebarItemGroup | TypeDocSidebarItemLink)[]
  label: string | null
}
