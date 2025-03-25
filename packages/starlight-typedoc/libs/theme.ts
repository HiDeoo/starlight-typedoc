import { Reflection, type Comment, type CommentTag, type Options, type CommentDisplayPart } from 'typedoc'
import { MarkdownTheme, MarkdownThemeContext, type MarkdownPageEvent } from 'typedoc-plugin-markdown'

import { getAsideMarkdown, getRelativeURL } from './starlight'

const customBlockTagTypes = ['@deprecated'] as const
const customModifiersTagTypes = ['@alpha', '@beta', '@experimental'] as const

export class StarlightTypeDocTheme extends MarkdownTheme {
  override getRenderContext(event: MarkdownPageEvent<Reflection>): StarlightTypeDocThemeRenderContext {
    return new StarlightTypeDocThemeRenderContext(this, event, this.application.options)
  }
}

class StarlightTypeDocThemeRenderContext extends MarkdownThemeContext {
  constructor(theme: MarkdownTheme, event: MarkdownPageEvent<Reflection>, options: Options) {
    super(theme, event, options)

    const superPartials = this.partials

    this.partials = {
      ...superPartials,
      comment: (comment, options) => {
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

        let markdown = superPartials.comment(filteredComment, options)

        if (options?.showSummary === false) {
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
  }

  override urlTo(reflection: Reflection): string {
    const outputDirectory = this.options.getValue('starlight-typedoc-output')
    const baseUrl = typeof outputDirectory === 'string' ? outputDirectory : ''

    return getRelativeURL(this.router.getFullUrl(reflection), baseUrl, this.page.url)
  }

  #parseCommentDisplayPart = (part: CommentDisplayPart): CommentDisplayPart => {
    if (
      part.kind === 'inline-tag' &&
      (part.tag === '@link' || part.tag === '@linkcode' || part.tag === '@linkplain') &&
      part.target instanceof Reflection
    ) {
      return {
        ...part,
        target: this.urlTo(part.target),
      }
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
        ? this.helpers.getCommentParts(blockTag.content)
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
