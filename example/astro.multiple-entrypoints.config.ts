import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { generateTypeDoc } from 'starlight-typedoc'

const typeDocSidebarGroup = await generateTypeDoc({
  entryPoints: ['../fixtures/src/Bar.ts', '../fixtures/src/Foo.ts'],
  output: 'api-multiple-entrypoints',
  tsconfig: '../fixtures/tsconfig.json',
})

export default defineConfig({
  integrations: [
    starlight({
      sidebar: [
        {
          label: 'Guides',
          items: [{ label: 'Example Guide', link: '/guides/example/' }],
        },
        typeDocSidebarGroup,
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
      social: {
        github: 'https://github.com/HiDeoo/starlight-typedoc',
      },
      title: 'Starlight TypeDoc',
    }),
  ],
  server: {
    port: 3001,
  },
})
