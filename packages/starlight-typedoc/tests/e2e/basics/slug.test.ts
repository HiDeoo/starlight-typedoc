import { expect, test } from '../test'

test('handles pages with a name that would lead to an empty slug', async ({ docPage }) => {
  await docPage.goto('functions/$')

  await expect(docPage.content.getByText('A function that print dollars.')).toBeVisible()
  expect(await docPage.sidebar.locator('a[aria-current="page"]').getAttribute('href')).toBe('/api/functions/$/')
})
