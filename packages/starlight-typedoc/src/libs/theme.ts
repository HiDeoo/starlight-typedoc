import path from 'node:path'

import { slug } from 'github-slugger'
import type { Comment, CommentTag, PageEvent, Reflection } from 'typedoc'
import { MarkdownTheme, MarkdownThemeRenderContext } from 'typedoc-plugin-markdown'
import { comment as commentPartial } from 'typedoc-plugin-markdown/dist/theme/resources/partials/comment'

import { getAsideMarkdown } from './starlight'

const externalLinkRegex = /^(http|ftp)s?:\/\//

export class StarlightTypeDocTheme extends MarkdownTheme {
  override getRenderContext(event: PageEvent<Reflection>) {
    return new StarlightTypeDocThemeRenderContext(event, this.application.options)
  }
}

class StarlightTypeDocThemeRenderContext extends MarkdownThemeRenderContext {
  override relativeURL: (url: string | undefined) => string | null = (url) => {
    if (!url) {
      return null
    } else if (externalLinkRegex.test(url)) {
      return url
    }

    const filePath = path.parse(url)
    const [, anchor] = filePath.base.split('#')
    const segments = filePath.dir.split('/').map((segment) => slug(segment))
    const baseUrl = this.options.getValue('baseUrl')

    return `${typeof baseUrl === 'string' ? baseUrl : ''}${segments.join('/')}/${slug(filePath.name)}/${
      anchor && anchor.length > 0 ? `#${anchor}` : ''
    }`
  }

  override comment: (comment: Comment, headingLevel?: number | undefined) => string = (comment, headingLevel) => {
    const filteredComment = { ...comment } as Comment
    filteredComment.blockTags = []

    const customCommentTags: CustomCommentTag[] = []

    for (const blockTag of comment.blockTags) {
      const isDeprecatedTag = blockTag.tag === '@deprecated'

      if (isDeprecatedTag) {
        customCommentTags.push({ blockTag, type: 'deprecated' })
      } else {
        filteredComment.blockTags.push(blockTag)
      }
    }

    let markdown = commentPartial(this, filteredComment, headingLevel)

    for (const customCommentTag of customCommentTags) {
      const { blockTag, type } = customCommentTag

      switch (type) {
        case 'deprecated': {
          markdown = this.#addDeprecatedAside(markdown, blockTag)
          break
        }
      }
    }

    return markdown
  }

  #addDeprecatedAside(markdown: string, blockTag: CommentTag) {
    const content =
      blockTag.content.length > 0
        ? this.commentParts(blockTag.content)
        : 'This API is no longer supported and may be removed in a future release.'

    return `${markdown}\n\n${getAsideMarkdown('caution', 'Deprecated', content)}`
  }
}

interface CustomCommentTag {
  blockTag: CommentTag
  type: 'deprecated'
}
