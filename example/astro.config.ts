import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import typedoc from 'starlight-typedoc'

export default defineConfig({
  integrations: [
    starlight({
      title: 'Starlight TypeDoc',
      social: {
        github: 'https://github.com/HiDeoo/starlight-typedoc',
      },
      sidebar: [
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
    typedoc({
      entryPoints: ['../fixtures/src/index.ts'],
      tsconfig: '../fixtures/tsconfig.json',
    }),
  ],
})
