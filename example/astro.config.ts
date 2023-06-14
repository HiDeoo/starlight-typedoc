import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { generateTypeDoc } from 'starlight-typedoc'

const typeDocSidebarGroup = await generateTypeDoc({
  entryPoints: ['../fixtures/src/index.ts'],
  tsconfig: '../fixtures/tsconfig.json',
  sidebarLabel: 'API (auto-generated)',
})

export default defineConfig({
  integrations: [
    starlight({
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/starlight-typedoc/edit/main/example/',
      },
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
})
