import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc'

export default defineConfig({
  base: '/packages-entrypoints/',
  integrations: [
    starlight({
      plugins: [
        starlightTypeDoc({
          entryPoints: ['../fixtures/packages/packages/*'],
          output: 'api-packages-entrypoints',
          tsconfig: '../fixtures/packages/tsconfig.json',
          typeDoc: {
            entryPointStrategy: 'packages',
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
      title: 'Starlight TypeDoc Packages Entry Points Example',
    }),
  ],
})
