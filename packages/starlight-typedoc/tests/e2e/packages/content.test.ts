import { test } from '../test'

test('should properly format links', async ({ docPage }) => {
  docPage.usePackagesEntryPoints()

  await docPage.goto('bar/functions/dobarbetter')

  await docPage.content.getByRole('link', { exact: true, name: 'DoBarBetterOptions' }).click()
  await docPage.page.waitForURL('**/api-packages-entrypoints/bar/interfaces/dobarbetteroptions/**')
})

test('should properly format links in block tag comments', async ({ docPage }) => {
  docPage.usePackagesEntryPoints()

  await docPage.goto('foo/functions/dofoofaster')

  await docPage.content.getByRole('link', { exact: true, name: 'doFoo' }).click()
  await docPage.page.waitForURL('**/api-packages-entrypoints/foo/functions/dofoo/')
})
