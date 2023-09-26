import type { DocPage } from './fixtures/DocPage'
import { expect, test } from './test'

test('should use an aside for the deprecated tag with no content', async ({ docPage }) => {
  await docPage.goto('functions/dothingb')

  const name = 'Deprecated'
  const { aside, title, content } = await getAside(docPage, name)

  await expect(aside).toBeVisible()
  expect(title).toBe(name)
  expect(content).toBe('This API is no longer supported and may be removed in a future release.')
})

test('should use an aside for the deprecated tag with custom content', async ({ docPage }) => {
  await docPage.goto('functions/dothingc')

  const name = 'Deprecated'
  const { aside, title, content } = await getAside(docPage, name)

  await expect(aside).toBeVisible()
  expect(title).toBe(name)
  expect(content).toBe('Use the new doThingFaster function instead.')
})

const releaseStageCases: [releaseStage: string, url: string][] = [
  ['Alpha', 'classes/bar'],
  ['Beta', 'variables/anobject'],
  ['Experimental', 'interfaces/thing'],
]

for (const [releaseStage, url] of releaseStageCases) {
  test(`should use an aside for the ${releaseStage.toLowerCase()} tag`, async ({ docPage }) => {
    await docPage.goto(url)

    const { aside, title, content } = await getAside(docPage, releaseStage)

    await expect(aside).toBeVisible()
    expect(title).toBe(releaseStage)
    expect(content).toBe('This API should not be used in production and may be trimmed from a public release.')
  })
}

async function getAside(docPage: DocPage, name: string) {
  const aside = docPage.content.getByRole('complementary', { exact: true, name })

  const paragraphs = aside.getByRole('paragraph', { includeHidden: true })
  const title = await paragraphs.nth(0).textContent()
  const content = await paragraphs.nth(1).textContent()

  return { aside, title, content }
}
