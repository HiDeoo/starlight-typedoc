import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc'

const site =
  process.env['VERCEL_ENV'] !== 'production' && process.env['VERCEL_URL']
    ? `https://${process.env['VERCEL_URL']}`
    : 'https://starlight-typedoc-example.vercel.app/'

export default defineConfig({
  integrations: [
    starlight({
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/starlight-typedoc/edit/main/example/',
      },
      head: [
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: new URL('og.jpg', site).href },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image:alt',
            content: 'Starlight plugin to generate documentation from TypeScript using TypeDoc.',
          },
        },
      ],
      plugins: [
        starlightTypeDoc({
          entryPoints: ['../fixtures/basics/src/index.ts'],
          tsconfig: '../fixtures/basics/tsconfig.json',
          sidebar: {
            label: 'API (auto-generated)',
          },
          typeDoc: {
            plugin: ['typedoc-plugin-mdn-links', 'typedoc-plugin-frontmatter', './src/plugins/frontmatter.js'],
          },
        }),
      ],
      sidebar: [
        {
          label: 'Guides',
          items: ['guides/example'],
        },
        typeDocSidebarGroup,
      ],
      social: {
        blueSky: 'https://bsky.app/profile/hideoo.dev',
        github: 'https://github.com/HiDeoo/starlight-typedoc',
      },
      title: 'Starlight TypeDoc Example',
    }),
  ],
})
