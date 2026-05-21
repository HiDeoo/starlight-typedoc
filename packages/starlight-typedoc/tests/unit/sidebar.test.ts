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

  test('should include a readme link if a readme URL is provided', () => {
    const reflection = { id: 1 } as ProjectReflection

    expect(getTestSidebar([typeDocSidebarGroup], reflection, {}, { [reflection.id]: 'README.md' }))
      .toMatchInlineSnapshot(`
        [
          {
            "collapsed": false,
            "items": [
              {
                "label": "Overview",
                "link": "/api/readme/",
              },
            ],
            "label": "API",
          },
        ]
      `)
  })

  test('should include readme links in package groups', () => {
    const reflections = {
      children: [
        {
          id: 1,
          name: 'bar',
          groups: [{ title: 'Functions', children: [{ id: 11 }] }],
        },
        {
          id: 2,
          name: 'foo',
          groups: [{ title: 'Functions', children: [{ id: 22 }] }],
        },
      ],
    } as ProjectReflection

    expect(
      getTestSidebar(
        [typeDocSidebarGroup],
        reflections,
        {
          1: 'bar/README.md',
          2: 'foo/README.md',
          11: 'bar/functions/doBar.md',
          22: 'foo/functions/doFoo.md',
        },
        {
          1: 'bar/README.md',
          2: 'foo/index.md',
        },
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "collapsed": false,
          "items": [
            {
              "collapsed": false,
              "items": [
                {
                  "label": "Overview",
                  "link": "/api/bar/readme/",
                },
                {
                  "collapsed": true,
                  "items": [
                    {
                      "autogenerate": {
                        "collapsed": true,
                        "directory": "api/bar/functions",
                      },
                    },
                  ],
                  "label": "Functions",
                },
              ],
              "label": "bar",
            },
            {
              "collapsed": false,
              "items": [
                {
                  "label": "Overview",
                  "link": "/api/foo/",
                },
                {
                  "collapsed": true,
                  "items": [
                    {
                      "autogenerate": {
                        "collapsed": true,
                        "directory": "api/foo/functions",
                      },
                    },
                  ],
                  "label": "Functions",
                },
              ],
              "label": "foo",
            },
          ],
          "label": "API",
        },
      ]
    `)
  })

  test('should support customizing readme link labels', () => {
    const reflection = { id: 1 } as ProjectReflection

    expect(
      getTestSidebar(
        [typeDocSidebarGroup],
        reflection,
        {},
        { [reflection.id]: 'README.md' },
        { readmeLabel: 'README' },
      ),
    ).toMatchInlineSnapshot(`
    [
      {
        "collapsed": false,
        "items": [
          {
            "label": "README",
            "link": "/api/readme/",
          },
        ],
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

function getTestSidebar(
  sidebar: Parameters<typeof getSidebarFromReflections>[0],
  reflections: Parameters<typeof getSidebarFromReflections>[3] = {} as ProjectReflection,
  definitions: Parameters<typeof getSidebarFromReflections>[4] = {},
  readmeUrls: Parameters<typeof getSidebarFromReflections>[6] = {},
  options: Parameters<typeof getSidebarFromReflections>[2] = {},
) {
  return getSidebarFromReflections(sidebar, typeDocSidebarGroup, options, reflections, definitions, 'api', readmeUrls)
}

function getTestSidebarWithoutReflections(sidebar: Parameters<typeof getSidebarFromReflections>[0]) {
  return getSidebarWithoutReflections(sidebar, typeDocSidebarGroup)
}
