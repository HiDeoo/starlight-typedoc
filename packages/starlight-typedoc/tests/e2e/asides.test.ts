import type { DocPage } from './fixtures/DocPage'
import { expect, test } from './test'

const releaseStageAsideContent = 'This API should not be used in production and may be trimmed from a public release.'

test('should use an aside for the deprecated tag with no content', async ({ docPage }) => {
  await docPage.goto('functions/functiondothingb')

  const name = 'Deprecated'
  const { aside, title, content } = await getAside(docPage, name)

  await expect(aside).toBeVisible()
  expect(title).toBe(name)
  expect(content).toBe('This API is no longer supported and may be removed in a future release.')
})

test('should use an aside for the deprecated tag with custom content', async ({ docPage }) => {
  await docPage.goto('functions/functiondothingc')

  const name = 'Deprecated'
  const { aside, title, content } = await getAside(docPage, name)

  await expect(aside).toBeVisible()
  expect(title).toBe(name)
  expect(content).toBe('Use the new doThingFaster function instead.')
})

test('should use an aside for the alpha tag', async ({ docPage }) => {
  await docPage.goto('classes/classbar')

  const name = 'Alpha'
  const { aside, title, content } = await getAside(docPage, name)

  await expect(aside).toBeVisible()
  expect(title).toBe(name)
  expect(content).toBe(releaseStageAsideContent)
})

async function getAside(docPage: DocPage, name: string) {
  const aside = docPage.content.getByRole('complementary', { exact: true, name })

  const paragraphs = aside.getByRole('paragraph', { includeHidden: true })
  const title = await paragraphs.nth(0).textContent()
  const content = await paragraphs.nth(1).textContent()

  return { aside, title, content }
}
