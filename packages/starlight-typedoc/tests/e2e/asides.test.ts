import { expect, test } from './test'

test('should use an aside for the deprecated tag with no content', async ({ docPage }) => {
  await docPage.goto('functions/functiondothingb')

  const aside = docPage.content.getByRole('complementary', { name: 'Deprecated' })

  await expect(aside).toBeVisible()

  const paragraphs = aside.getByRole('paragraph', { includeHidden: true })
  const title = await paragraphs.nth(0).textContent()
  const content = await paragraphs.nth(1).textContent()

  expect(title).toBe('Deprecated')
  expect(content).toBe('This API is no longer supported and may be removed in a future release.')
})

test('should use an aside for the deprecated tag with custom content', async ({ docPage }) => {
  await docPage.goto('functions/functiondothingc')

  const aside = docPage.content.getByRole('complementary', { name: 'Deprecated' })

  await expect(aside).toBeVisible()

  const paragraphs = aside.getByRole('paragraph', { includeHidden: true })
  const title = await paragraphs.nth(0).textContent()
  const content = await paragraphs.nth(1).textContent()

  expect(title).toBe('Deprecated')
  expect(content).toBe('Use the new doThingFaster function instead.')
})
