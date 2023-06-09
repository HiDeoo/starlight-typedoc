import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { generateTypeDoc } from 'starlight-typedoc'

const typeDocSidebarGroup = await generateTypeDoc({
  entryPoints: ['../fixtures/src/index.ts'],
  tsconfig: '../fixtures/tsconfig.json',
})

export default defineConfig({
  integrations: [
    starlight({
      title: 'Starlight TypeDoc',
      social: {
        github: 'https://github.com/HiDeoo/starlight-typedoc',
      },
      sidebar: [
        typeDocSidebarGroup,
        {
          label: 'Guides',
          items: [{ label: 'Example Guide', link: '/guides/example/' }],
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
  ],
})
