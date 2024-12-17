import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc'

export default defineConfig({
  base: '/multiple-entrypoints/',
  integrations: [
    starlight({
      plugins: [
        starlightTypeDoc({
          entryPoints: ['../fixtures/basics/src/Bar.ts', '../fixtures/basics/src/Foo.ts'],
          output: 'api-multiple-entrypoints',
          pagination: true,
          sidebar: {
            collapsed: true,
          },
          tsconfig: '../fixtures/basics/tsconfig.json',
          // @ts-expect-error - Fake the `readme` option not being set to ensure that frontmatter titles are escaped properly.
          // @see https://github.com/HiDeoo/starlight-typedoc/pull/7
          typeDoc: {
            readme: undefined,
          },
        }),
      ],
      sidebar: [
        {
          label: 'Guides',
          items: [{ label: 'Example Guide', link: '/guides/example/' }],
        },
        typeDocSidebarGroup,
      ],
      title: 'Starlight TypeDoc Multiple Entry Points Example',
    }),
  ],
  outDir: './dist-multiple-entrypoints',
  server: {
    port: 4322,
  },
})
