import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

export default defineConfig({
  integrations: [
    starlight({
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/starlight-typedoc/edit/main/docs/',
      },
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Getting Started', link: '/getting-started/' },
            { label: 'Configuration', link: '/configuration/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Multiple Instances', link: '/guides/multiple-instances/' },
            { label: 'Frontmatter', link: '/guides/frontmatter/' },
          ],
        },
        {
          label: 'Resources',
          items: [
            { label: 'Showcase', link: '/resources/showcase/' },
            { label: 'Plugins and Tools', link: '/resources/starlight/' },
          ],
        },
        { label: 'Demo', link: 'https://starlight-typedoc-example.vercel.app/api/functions/dothingc/' },
      ],
      social: {
        github: 'https://github.com/HiDeoo/starlight-typedoc',
      },
      title: 'Starlight TypeDoc',
    }),
  ],
})
