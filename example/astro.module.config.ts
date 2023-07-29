import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { generateTypeDoc } from 'starlight-typedoc'

const typeDocSidebarGroup = await generateTypeDoc({
  entryPoints: ['../fixtures/src/module.ts'],
  output: 'api-module',
  pagination: true,
  sidebar: {
    collapsed: true,
  },
  tsconfig: '../fixtures/tsconfig.json',
  typeDoc: {
    outputFileStrategy: 'modules',
    entryFileName: 'index.md',
    skipIndexPage: false,
    flattenOutputFiles: true,
  },
})

export default defineConfig({
  integrations: [
    starlight({
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
  server: {
    port: 3001,
  },
})
