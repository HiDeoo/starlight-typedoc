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

test('should generate the proper items for for a single entry point', async ({ docPage }) => {
  await docPage.goto(singleEntrypointUrl)

  const items = await docPage.getTypeDocSidebarItems()

  expect(items).toMatchObject([
    {
      label: 'Classes',
      items: [{ name: 'Bar' }, { name: 'Foo' }],
    },
    {
      label: 'Functions',
      items: [{ name: 'doThingA' }, { name: 'doThingB' }],
    },
  ])
})

test('should generate the proper items for for multiple entry points', async ({ docPage }) => {
  docPage.useMultipleEntryPoints()

  await docPage.goto(multipleEntrypointsUrl)

  const items = await docPage.getTypeDocSidebarItems()

  expect(items).toMatchObject([
    {
      label: 'Bar',
      items: [
        {
          label: 'Classes',
          items: [{ name: 'Bar' }],
        },
      ],
    },
    {
      label: 'Foo',
      items: [
        {
          label: 'Classes',
          items: [{ name: 'Foo' }],
        },
      ],
    },
  ])
})
