import type { ProjectReflection } from 'typedoc'
import { describe, expect, test } from 'vitest'

import { typeDocSidebarGroup } from '../../index'
import { formatPackageLabel, getSidebarFromReflections, getSidebarWithoutReflections } from '../../libs/starlight'

const gettingStartedLink = {
  label: 'Getting Started',
  link: '/guides/getting-started/',
}

describe('getSidebarFromReflections', () => {
  test('should not do anything for an undefined sidebar', () => {
    expect(getTestSidebar([])).toEqual([])
  })

  test('should not do anything for an empty sidebar', () => {
    expect(getTestSidebar([])).toEqual([])
  })

  test('should not do anything for a sidebar without a placeholder', () => {
    expect(getTestSidebar([gettingStartedLink])).toEqual([gettingStartedLink])
  })

  test('should replace a placeholder at the rool level', () => {
    expect(getTestSidebar([gettingStartedLink, typeDocSidebarGroup])).toMatchInlineSnapshot(`
      [
        {
          "label": "Getting Started",
          "link": "/guides/getting-started/",
        },
        {
          "collapsed": false,
          "items": [],
          "label": "API",
        },
      ]
    `)
  })

  test('should replace a nested placeholder', () => {
    expect(
      getTestSidebar([
        {
          label: 'Guides',
          items: [typeDocSidebarGroup, gettingStartedLink],
        },
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "items": [
            {
              "collapsed": false,
              "items": [],
              "label": "API",
            },
            {
              "label": "Getting Started",
              "link": "/guides/getting-started/",
            },
          ],
          "label": "Guides",
        },
      ]
    `)
  })

  test('should replace multiple placeholders', () => {
    expect(
      getTestSidebar([
        gettingStartedLink,
        {
          label: 'Guides',
          items: [gettingStartedLink, typeDocSidebarGroup],
        },
        typeDocSidebarGroup,
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "label": "Getting Started",
          "link": "/guides/getting-started/",
        },
        {
          "items": [
            {
              "label": "Getting Started",
              "link": "/guides/getting-started/",
            },
            {
              "collapsed": false,
              "items": [],
              "label": "API",
            },
          ],
          "label": "Guides",
        },
        {
          "collapsed": false,
          "items": [],
          "label": "API",
        },
      ]
    `)
  })
})

describe('getSidebarWithoutReflections', () => {
  test('should not do anything for an undefined sidebar', () => {
    expect(getTestSidebarWithoutReflections([])).toEqual([])
  })

  test('should not do anything for an empty sidebar', () => {
    expect(getTestSidebarWithoutReflections([])).toEqual([])
  })

  test('should not do anything for a sidebar without a placeholder', () => {
    expect(getTestSidebarWithoutReflections([gettingStartedLink])).toEqual([gettingStartedLink])
  })

  test('should remove a placeholder at the rool level', () => {
    expect(getTestSidebarWithoutReflections([gettingStartedLink, typeDocSidebarGroup])).toMatchInlineSnapshot(`
      [
        {
          "label": "Getting Started",
          "link": "/guides/getting-started/",
        },
      ]
    `)
  })

  test('should remove a nested placeholder', () => {
    expect(
      getTestSidebarWithoutReflections([
        {
          label: 'Guides',
          items: [typeDocSidebarGroup, gettingStartedLink],
        },
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "items": [
            {
              "label": "Getting Started",
              "link": "/guides/getting-started/",
            },
          ],
          "label": "Guides",
        },
      ]
    `)
  })

  test('should remove multiple placeholders', () => {
    expect(
      getTestSidebarWithoutReflections([
        gettingStartedLink,
        {
          label: 'Guides',
          items: [gettingStartedLink, typeDocSidebarGroup],
        },
        typeDocSidebarGroup,
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "label": "Getting Started",
          "link": "/guides/getting-started/",
        },
        {
          "items": [
            {
              "label": "Getting Started",
              "link": "/guides/getting-started/",
            },
          ],
          "label": "Guides",
        },
      ]
    `)
  })
})

describe('packages-mode Modules group scope removal', () => {
  const scopedProjectReflection = {
    variant: 'project',
    id: 0,
    name: 'project',
    groups: [
      {
        title: 'Modules',
        children: [
          { id: 1, name: '@scope/foo', variant: 'declaration', groups: [], children: undefined },
          { id: 2, name: '@scope/bar', variant: 'declaration', groups: [], children: undefined },
        ],
      },
    ],
    children: [],
  } as unknown as ProjectReflection

  const definitions = {
    1: 'foo/index.md',
    2: 'bar/index.md',
  } as unknown as Parameters<typeof getSidebarFromReflections>[4]

  test('should strip the scope from package labels when removeScope is true', () => {
    const result = getSidebarFromReflections(
      [typeDocSidebarGroup],
      typeDocSidebarGroup,
      { removeScope: true },
      scopedProjectReflection,
      definitions,
      'api',
    )

    const apiGroup = (result as { items: { label: string }[] }[])[0]
    const labels = (apiGroup?.items ?? []).map((item) => item.label)

    expect(labels).toEqual(['foo', 'bar'])
  })

  test('should keep the scope on package labels when removeScope is not set', () => {
    const result = getSidebarFromReflections(
      [typeDocSidebarGroup],
      typeDocSidebarGroup,
      {},
      scopedProjectReflection,
      definitions,
      'api',
    )

    const apiGroup = (result as { items: { label: string }[] }[])[0]
    const labels = (apiGroup?.items ?? []).map((item) => item.label)

    expect(labels).toEqual(['@scope/foo', '@scope/bar'])
  })
})

describe('formatPackageLabel', () => {
  test('should return the name unchanged when no option is provided', () => {
    expect(formatPackageLabel('@example/foo', {})).toBe('@example/foo')
  })

  test('should return the name unchanged when removeScope is false', () => {
    expect(formatPackageLabel('@example/foo', { removeScope: false })).toBe('@example/foo')
  })

  test('should strip the scope when removeScope is true', () => {
    expect(formatPackageLabel('@example/foo', { removeScope: true })).toBe('foo')
  })

  test('should leave unscoped names unchanged when removeScope is true', () => {
    expect(formatPackageLabel('foo', { removeScope: true })).toBe('foo')
  })

  test('should strip the scope of names with hyphens when removeScope is true', () => {
    expect(formatPackageLabel('@scope/nested-name', { removeScope: true })).toBe('nested-name')
  })
})

function getTestSidebar(sidebar: Parameters<typeof getSidebarFromReflections>[0]) {
  return getSidebarFromReflections(sidebar, typeDocSidebarGroup, {}, {} as ProjectReflection, {}, 'api')
}

function getTestSidebarWithoutReflections(sidebar: Parameters<typeof getSidebarFromReflections>[0]) {
  return getSidebarWithoutReflections(sidebar, typeDocSidebarGroup)
}
