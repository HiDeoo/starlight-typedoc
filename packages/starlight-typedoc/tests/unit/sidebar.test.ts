import type { ProjectReflection } from 'typedoc'
import { describe, expect, test } from 'vitest'

import { typeDocSidebarGroup } from '../../index'
import { getSidebarFromReflections, getSidebarWithoutReflections } from '../../libs/starlight'

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

function getTestSidebar(sidebar: Parameters<typeof getSidebarFromReflections>[0]) {
  return getSidebarFromReflections(sidebar, typeDocSidebarGroup, {}, {} as ProjectReflection, {}, 'api')
}

function getTestSidebarWithoutReflections(sidebar: Parameters<typeof getSidebarFromReflections>[0]) {
  return getSidebarWithoutReflections(sidebar, typeDocSidebarGroup)
}
