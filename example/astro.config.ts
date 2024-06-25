import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc'

export default defineConfig({
  integrations: [
    starlight({
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/starlight-typedoc/edit/main/example/',
      },
      plugins: [
        starlightTypeDoc({
          entryPoints: ['../fixtures/basics/src/index.ts'],
          tsconfig: '../fixtures/basics/tsconfig.json',
          sidebar: {
            label: 'API (auto-generated)',
          },
          typeDoc: {
            plugin: ['typedoc-plugin-mdn-links'],
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
      title: 'Starlight TypeDoc Example',
    }),
  ],
})
