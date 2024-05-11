import { expect, test } from '../test'

test('should generate the proper items for for multiple plugins with different configurations', async ({ docPage }) => {
  docPage.useMultiplePlugins()

  await docPage.goto('api-multiple-plugins-bar/classes/bar')

  const items = await docPage.getSidebarItems()

  expect(items).toMatchObject([
    {
      label: 'Bar Content',
      items: [
        {
          collapsed: true,
          label: 'Bar API',
          items: [
            {
              collapsed: true,
              label: 'Classes',
              items: [{ name: 'Bar' }],
            },
          ],
        },
      ],
    },
    {
      label: 'Foo Content',
      items: [
        {
          collapsed: true,
          label: 'Foo API',
          items: [
            {
              collapsed: true,
              label: 'Classes',
              items: [{ name: 'Foo' }],
            },
          ],
        },
      ],
    },
  ])
})

test('should support having a badge', async ({ docPage }) => {
  docPage.useMultiplePlugins()

  await docPage.goto('api-multiple-plugins-bar/classes/bar')

  await expect(docPage.page.locator('.sl-badge:has-text("generated")')).toBeVisible()
})
