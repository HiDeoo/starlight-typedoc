import { MarkdownPageEvent } from 'typedoc-plugin-markdown'

/** @param {import('typedoc-plugin-markdown').MarkdownApplication} app */
export function load(app) {
  app.renderer.on(
    MarkdownPageEvent.BEGIN,
    /** @param {MarkdownPageEvent} page */
    (page) => {
      if (page.url === 'variables/anObject.md') {
        page.frontmatter = {
          sidebar: {
            badge: {
              text: 'New',
            },
          },
          ...page.frontmatter,
        }
      }
    },
  )
}
