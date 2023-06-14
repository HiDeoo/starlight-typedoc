import { expect, test } from './test'

test('should add titles to the frontmatter', async ({ docPage }) => {
  await docPage.goto('classes/classfoo')

  expect(docPage.title).toBe('Foo')

  await docPage.goto('functions/functiondothinga')

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
  await docPage.goto('classes/classfoo')

  const barConstructorLinkHref = await docPage.content
    .getByRole('link', { exact: true, name: 'constructor' })
    .getAttribute('href')

  expect(barConstructorLinkHref).toEqual('/api/classes/classbar/#constructor')
})

test('should properly format links with anchors for multiple entry points', async ({ docPage }) => {
  docPage.useMultipleEntryPoints()

  await docPage.goto('modulefoo/classes/classfoo')

  const barConstructorLinkHref = await docPage.content
    .getByRole('link', { exact: true, name: 'constructor' })
    .getAttribute('href')

  expect(barConstructorLinkHref).toEqual('/api-multiple-entrypoints/modulebar/classes/classbar/#constructor')
})

test('should disable edit links', async ({ docPage }) => {
  await docPage.goto('../guides/example')

  await expect(docPage.page.getByRole('link', { exact: true, name: 'Edit page' })).toBeVisible()

  await docPage.goto('classes/classbar')

  await expect(docPage.page.getByRole('link', { exact: true, name: 'Edit page' })).not.toBeVisible()
})
