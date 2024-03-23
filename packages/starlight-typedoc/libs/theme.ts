import path from 'node:path'

import {
  Reflection,
  type Comment,
  type CommentTag,
  type Options,
  type PageEvent,
  type CommentDisplayPart,
} from 'typedoc'
import { MarkdownTheme, MarkdownThemeRenderContext } from 'typedoc-plugin-markdown'

import { getAsideMarkdown, getRelativeURL } from './starlight'

const customBlockTagTypes = ['@deprecated'] as const
const customModifiersTagTypes = ['@alpha', '@beta', '@experimental'] as const

export class StarlightTypeDocTheme extends MarkdownTheme {
  override getRenderContext(event: PageEvent<Reflection>): StarlightTypeDocThemeRenderContext {
    return new StarlightTypeDocThemeRenderContext(this, event, this.application.options)
  }
}

class StarlightTypeDocThemeRenderContext extends MarkdownThemeRenderContext {
  #markdownThemeRenderContext: MarkdownThemeRenderContext

  constructor(theme: MarkdownTheme, event: PageEvent<Reflection> | null, options: Options) {
    super(theme, event, options)

    this.#markdownThemeRenderContext = new MarkdownThemeRenderContext(theme, event, options)
  }

  override parseUrl = (url: string) => {
    const outputDirectory = this.options.getValue('starlight-typedoc-output')
    const baseUrl = typeof outputDirectory === 'string' ? outputDirectory : ''

    return getRelativeURL(url, baseUrl, this.page?.url)
  }

  override partials: MarkdownThemeRenderContext['partials'] = {
    // @ts-expect-error - https://github.com/tgreyuk/typedoc-plugin-markdown/blob/37f9de583074e725159f57d70f3ed130007a964c/docs/pages/customizing/custom-theme.mdx
    ...this.partials,
    comment: (comment, headingLevel, showSummary, showTags) => {
      const filteredComment = { ...comment } as Comment
      filteredComment.blockTags = []
      filteredComment.modifierTags = new Set<`@${string}`>()

      const customTags: CustomTag[] = []

      for (const blockTag of comment.blockTags) {
        if (this.#isCustomBlockCommentTagType(blockTag.tag)) {
          customTags.push({ blockTag, type: blockTag.tag })
        } else {
          blockTag.content = blockTag.content.map((part) => this.#parseCommentDisplayPart(part))
          filteredComment.blockTags.push(blockTag)
        }
      }

      for (const modifierTag of comment.modifierTags) {
        if (this.#isCustomModifierCommentTagType(modifierTag)) {
          customTags.push({ type: modifierTag })
        } else {
          filteredComment.modifierTags.add(modifierTag)
        }
      }

      filteredComment.summary = comment.summary.map((part) => this.#parseCommentDisplayPart(part))

      let markdown = this.#markdownThemeRenderContext.partials.comment(
        filteredComment,
        headingLevel,
        showSummary,
        showTags,
      )

      if (showTags === true && showSummary === false) {
        return markdown
      }

      for (const customCommentTag of customTags) {
        switch (customCommentTag.type) {
          case '@alpha': {
            markdown = this.#addReleaseStageAside(markdown, 'Alpha')
            break
          }
          case '@beta': {
            markdown = this.#addReleaseStageAside(markdown, 'Beta')
            break
          }
          case '@deprecated': {
            markdown = this.#addDeprecatedAside(markdown, customCommentTag.blockTag)
            break
          }
          case '@experimental': {
            markdown = this.#addReleaseStageAside(markdown, 'Experimental')
            break
          }
        }
      }

      return markdown
    },
  }

  #parseCommentDisplayPart = (part: CommentDisplayPart): CommentDisplayPart => {
    if (
      part.kind === 'inline-tag' &&
      (part.tag === '@link' || part.tag === '@linkcode' || part.tag === '@linkplain') &&
      part.target instanceof Reflection &&
      typeof part.target.url === 'string'
    ) {
      return { ...part, target: this.parseUrl(path.posix.join('..', part.target.url)) }
    }

    return part
  }

  #isCustomBlockCommentTagType = (tag: string): tag is CustomBlockTagType => {
    return customBlockTagTypes.includes(tag as CustomBlockTagType)
  }

  #isCustomModifierCommentTagType = (tag: string): tag is CustomModifierTagType => {
    return customModifiersTagTypes.includes(tag as CustomModifierTagType)
  }

  #addAside(markdown: string, ...args: Parameters<typeof getAsideMarkdown>) {
    return `${markdown}\n\n${getAsideMarkdown(...args)}`
  }

  #addDeprecatedAside(markdown: string, blockTag: CommentTag) {
    const content =
      blockTag.content.length > 0
        ? this.partials.commentParts(blockTag.content)
        : 'This API is no longer supported and may be removed in a future release.'

    return this.#addAside(markdown, 'caution', 'Deprecated', content)
  }

  #addReleaseStageAside(markdown: string, title: string) {
    return this.#addAside(
      markdown,
      'caution',
      title,
      'This API should not be used in production and may be trimmed from a public release.',
    )
  }
}

type CustomBlockTagType = (typeof customBlockTagTypes)[number]
type CustomModifierTagType = (typeof customModifiersTagTypes)[number]

type CustomTag =
  | { type: CustomModifierTagType }
  | {
      blockTag: CommentTag
      type: CustomBlockTagType
    }
