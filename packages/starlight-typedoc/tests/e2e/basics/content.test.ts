import { expect, test } from '../test'

test('should add titles to the frontmatter', async ({ docPage }) => {
  await docPage.goto('classes/foo')

  expect(docPage.title).toBe('Foo')

  await docPage.goto('functions/dothinga')

  expect(docPage.title).toBe('doThingA')
})

test('should properly format links for a single entry point', async ({ docPage }) => {
  await docPage.goto('classes/classfoo')

  const barLinkLocators = await docPage.content.getByRole('link', { exact: true, name: 'Bar' }).all()
  const barLinkHrefs = await Promise.all(barLinkLocators.map((link) => link.getAttribute('href')))

  expect(barLinkHrefs.every((href) => href === '/api/classes/classbar/')).toBe(true)
})

test('should properly format links for multiple entry points', async ({ docPage }) => {
  docPage.useMultipleEntryPoints()

  await docPage.goto('modulefoo/classes/classfoo')

  const barLinkLocators = await docPage.content.getByRole('link', { exact: true, name: 'Bar' }).all()
  const barLinkHrefs = await Promise.all(barLinkLocators.map((link) => link.getAttribute('href')))

  expect(barLinkHrefs.every((href) => href === '/api-multiple-entrypoints/modulebar/classes/classbar/')).toBe(true)
})

test('should properly format links with anchors for a single entry point', async ({ docPage }) => {
  await docPage.goto('classes/foo')

  const barConstructorLinkHref = await docPage.content
    .getByRole('link', { exact: true, name: 'constructor' })
    .getAttribute('href')

  expect(barConstructorLinkHref).toEqual('/api/classes/bar/#constructor')
})

test('should properly format links with anchors for multiple entry points', async ({ docPage }) => {
  docPage.useMultipleEntryPoints()

  await docPage.goto('foo/classes/foo')

  const barConstructorLinkHref = await docPage.content
    .getByRole('link', { exact: true, name: 'constructor' })
    .getAttribute('href')

  expect(barConstructorLinkHref).toEqual('/multiple-entrypoints/api-multiple-entrypoints/bar/classes/bar/#constructor')
})

test('should disable edit links', async ({ docPage }) => {
  await docPage.goto('../guides/example')

  await expect(docPage.page.getByRole('link', { exact: true, name: 'Edit page' })).toBeVisible()

  await docPage.goto('classes/classbar')

  await expect(docPage.page.getByRole('link', { exact: true, name: 'Edit page' })).not.toBeVisible()
})

test('should support TypeDoc plugins', async ({ docPage }) => {
  await docPage.goto('classes/foo')

  const mdnLink = docPage.page.getByRole('link', { exact: true, name: 'HTMLElement' })

  await expect(mdnLink).toBeVisible()

  const mdnLinkHref = await mdnLink.getAttribute('href')

  expect(mdnLinkHref?.startsWith('https://developer.mozilla.org')).toBe(true)
})

test('should support plugins customizing the frontmatter', async ({ docPage }) => {
  await docPage.goto('variables/anobject')

  const sidebarBadge = docPage.page.locator('a[aria-current="page"] .sl-badge')

  await expect(sidebarBadge).toBeVisible()

  expect(await sidebarBadge.textContent()).toBe('New')
})

test('should properly format links in summary', async ({ docPage }) => {
  await docPage.goto('functions/dothingfaster')

  await docPage.content.getByRole('link', { exact: true, name: 'doThingB' }).click()
  await docPage.page.waitForURL('**/api/functions/dothingb/')
})

test('should properly format links in block tag comments', async ({ docPage }) => {
  await docPage.goto('classes/foo')

  await docPage.content.locator('h4:has-text("See") + p a').click()
  await docPage.page.waitForURL('**/api/interfaces/thing/')
})
