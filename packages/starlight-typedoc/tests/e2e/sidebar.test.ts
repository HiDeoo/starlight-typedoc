import { expect, test } from './test'

const singleEntrypointUrl = 'classes/classfoo'
const multipleEntrypointsUrl = 'modulebar/classes/classbar'

test('should include the TypeDoc sidebar group for a single entry point', async ({ docPage }) => {
  await docPage.goto(singleEntrypointUrl)

  await expect(docPage.typeDocSidebarLabel).toBeVisible()
})

test('should include the TypeDoc sidebar group for multiple entry points', async ({ docPage }) => {
  docPage.useMultipleEntryPoints()

  await docPage.goto(multipleEntrypointsUrl)

  await expect(docPage.typeDocSidebarLabel).toBeVisible()
})

test('should include the TypeDoc groups for a single entry point', async ({ docPage }) => {
  await docPage.goto(singleEntrypointUrl)

  await expect(docPage.typeDocSidebarGroups).toBeVisible()

  await expect(docPage.typeDocSidebarGroups.getByRole('listitem').getByRole('heading', { level: 2 })).toHaveText([
    'Classes',
    'Functions',
  ])
})

test('should include the TypeDoc groups for for multiple entry points', async ({ docPage }) => {
  docPage.useMultipleEntryPoints()

  await docPage.goto(multipleEntrypointsUrl)

  await expect(docPage.typeDocSidebarGroups).toBeVisible()

  await expect(docPage.typeDocSidebarGroups.getByRole('listitem').getByRole('heading', { level: 2 })).toHaveText([
    'Bar',
    'Classes',
    'Foo',
    'Classes',
  ])
})

// TODO(HiDeoo) Test sidebar entries for a single entry point
// TODO(HiDeoo) Test sidebar entries for multiple entry points
