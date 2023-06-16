import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { generateTypeDoc } from 'starlight-typedoc'

const typeDocSidebarGroup = await generateTypeDoc({
  entryPoints: ['../fixtures/src/index.ts'],
  tsconfig: '../fixtures/tsconfig.json',
  sidebarLabel: 'API (auto-generated)',
  typeDoc: {
    plugin: ['typedoc-plugin-mdn-links'],
  },
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
          items: [{ label: 'Getting Started', link: '/guides/getting-started/' }],
        },
        typeDocSidebarGroup,
      ],
      social: {
        github: 'https://github.com/HiDeoo/starlight-typedoc',
      },
      title: 'Starlight TypeDoc',
    }),
  ],
})
