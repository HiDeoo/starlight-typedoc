import { expect, test } from '../test'

const singleEntrypointUrl = 'classes/foo'
const multipleEntrypointsUrl = 'bar/classes/bar'

test('should include the TypeDoc sidebar group for a single entry point', async ({ docPage }) => {
  await docPage.goto(singleEntrypointUrl)

  await expect(docPage.typeDocSidebarLabel).toBeVisible()
})

test('should include the TypeDoc sidebar group for multiple entry points', async ({ docPage }) => {
  docPage.useMultipleEntryPoints()

  await docPage.goto(multipleEntrypointsUrl)

  await expect(docPage.typeDocSidebarLabel).toBeVisible()
})

test('should not collapse the TypeDoc sidebar group by default', async ({ docPage }) => {
  await docPage.goto(singleEntrypointUrl)

  await docPage.page.getByRole('link', { name: 'Example Guide' }).click()

  expect(await docPage.isTypeDocSidebarCollapsed()).toBe(false)
})

test('should collapse the TypeDoc sidebar group if specified', async ({ docPage }) => {
  docPage.useMultipleEntryPoints()

  await docPage.goto(multipleEntrypointsUrl)

  await docPage.page.getByRole('link', { name: 'Example Guide' }).first().click()

  expect(await docPage.isTypeDocSidebarCollapsed()).toBe(true)
})

test('should generate the proper items for for a single entry point', async ({ docPage }) => {
  await docPage.goto(singleEntrypointUrl)

  const items = await docPage.getTypeDocSidebarItems()

  expect(items).toMatchObject([
    {
      label: 'Enumerations',
      items: [{ name: 'ANumericEnum' }, { name: 'AStringEnum' }],
      collapsed: true,
    },
    {
      label: 'Classes',
      items: [{ name: 'Bar' }, { name: 'Baz' }, { name: 'Foo' }],
      collapsed: true,
    },
    {
      label: 'Interfaces',
      items: [{ name: 'Thing' }],
      collapsed: true,
    },
    {
      label: 'Type Aliases',
      items: [{ name: 'Things' }],
      collapsed: true,
    },
    {
      label: 'Variables',
      items: [{ name: 'anObject' }, { name: 'anObjectAsConst' }, { name: 'anUndefinedString' }, { name: 'aString' }],
      collapsed: true,
    },
    {
      label: 'Functions',
      items: [
        { name: '$' },
        { name: 'doThingA' },
        { name: 'doThingB' },
        { name: 'doThingC' },
        { name: 'doThingFaster' },
      ],
      collapsed: true,
    },
    {
      label: 'References',
      items: [{ name: 'doThingARef' }],
      collapsed: true,
    },
    // `MyCustomGroup` defined in `fixtures/basics/src/Baz.ts` does not have a directory on disk which means it should
    // not be included in the sidebar.
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
      collapsed: true,
    },
    {
      label: 'Foo',
      items: [
        {
          label: 'Classes',
          items: [{ name: 'Foo' }],
        },
      ],
      collapsed: true,
    },
  ])
})
