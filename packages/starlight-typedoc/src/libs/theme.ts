import path from 'node:path'

import { slug } from 'github-slugger'
import type { PageEvent, Reflection } from 'typedoc'
import { MarkdownTheme, MarkdownThemeRenderContext } from 'typedoc-plugin-markdown'

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
}
