import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { createStarlightTypeDocPlugin } from 'starlight-typedoc'

const [barStarlightTypeDoc, barTypeDocSidebarGroup] = createStarlightTypeDocPlugin()
const [fooStarlightTypeDoc, fooTypeDocSidebarGroup] = createStarlightTypeDocPlugin()

export default defineConfig({
  base: '/multiple-plugins/',
  integrations: [
    starlight({
      plugins: [
        barStarlightTypeDoc({
          entryPoints: ['../fixtures/basics/src/Bar.ts'],
          output: 'api-multiple-plugins-bar',
          tsconfig: '../fixtures/basics/tsconfig.json',
          sidebar: {
            label: 'Bar API',
          },
        }),
        fooStarlightTypeDoc({
          entryPoints: ['../fixtures/basics/src/Foo.ts'],
          output: 'api-multiple-plugins-foo',
          tsconfig: '../fixtures/basics/tsconfig.json',
          sidebar: {
            label: 'Foo API',
          },
        }),
      ],
      sidebar: [
        {
          label: 'Bar Content',
          items: [{ ...barTypeDocSidebarGroup, badge: 'generated' }],
        },
        {
          label: 'Foo Content',
          items: [fooTypeDocSidebarGroup],
        },
      ],
      title: 'Starlight TypeDoc Multiple Plugins Example',
    }),
  ],
})
