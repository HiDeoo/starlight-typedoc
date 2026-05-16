import { expect, test } from '../test'

const url = 'foo/functions/dofoo'

test('should include the TypeDoc sidebar group', async ({ docPage }) => {
  docPage.usePackagesEntryPoints()

  await docPage.goto(url)

  await expect(docPage.typeDocSidebarLabel).toBeVisible()
})

test('should generate the proper items for for multiple entry points', async ({ docPage }) => {
  docPage.usePackagesEntryPoints()

  await docPage.goto(url)

  const items = await docPage.getTypeDocSidebarItems()

  expect(items).toMatchObject([
    { name: 'Overview' },
    {
      label: 'bar',
      items: [
        { name: 'README' },
        {
          label: 'Interfaces',
          items: [{ name: 'DoBarBetterOptions' }],
        },
        {
          label: 'Functions',
          items: [{ name: 'doBar' }, { name: 'doBarBetter' }],
        },
      ],
      collapsed: true,
    },
    {
      label: 'foo',
      items: [
        { name: 'README' },
        {
          label: 'Functions',
          items: [{ name: 'doFoo' }, { name: 'doFooFaster' }],
        },
      ],
      collapsed: true,
    },
  ])
})
