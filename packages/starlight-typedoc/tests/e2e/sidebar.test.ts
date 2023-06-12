import { test, expect } from './test'

test('should display the main sidebar', async ({ homePage }) => {
  await homePage.goto()

  await expect(homePage.sidebar).toBeVisible()
})

test('should include the TypeDoc sidebar group with the proper label', async ({ homePage }) => {
  await homePage.goto()

  await expect(homePage.typeDocSidebarLabel).toBeVisible()
})

test('should include the TypeDoc groups', async ({ homePage }) => {
  await homePage.goto()

  await expect(homePage.typeDocSidebarRootList).toBeVisible()

  await expect(homePage.typeDocSidebarRootList.getByRole('listitem').getByRole('heading', { level: 2 })).toHaveText([
    'Classes',
    'Functions',
  ])
})
