import type { DocPage } from './fixtures/DocPage'
import { expect, test } from './test'

test('should not include pagination links by default', async ({ docPage }) => {
  await docPage.goto('classes/classfoo')

  const { next, prev } = getPrevNext(docPage)

  await expect(next).not.toBeVisible()
  await expect(prev).not.toBeVisible()
})

test('should not include pagination links if configured to do so', async ({ docPage }) => {
  docPage.useMultipleEntryPoints()

  await docPage.goto('bar/classes/classbar')

  const { next, prev } = getPrevNext(docPage)

  await expect(next).toBeVisible()
  await expect(prev).toBeVisible()
})

function getPrevNext(docPage: DocPage) {
  return {
    next: docPage.page.locator('a[rel="next"]'),
    prev: docPage.page.locator('a[rel="prev"]'),
  }
}
