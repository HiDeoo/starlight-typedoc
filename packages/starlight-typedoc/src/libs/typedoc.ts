import { Application, type DeclarationReflection, PageEvent, TSConfigReader, type TypeDocOptions } from 'typedoc'
import { load as loadMarkdownPlugin, type PluginOptions } from 'typedoc-plugin-markdown'

import { StarlightTypeDocLogger } from './logger'
import { addFrontmatter } from './markdown'
import { StarlightTypeDocTheme } from './theme'

const defaultTypeDocConfig: TypeDocConfig = {
  excludeInternal: true,
  excludePrivate: true,
  excludeProtected: true,
  githubPages: false,
  readme: 'none',
  theme: 'starlight-typedoc',
}

const markdownPluginConfig: TypeDocConfig = {
  hideBreadcrumbs: true,
  hideInPageTOC: true,
  hideKindPrefix: true,
  hidePageHeader: true,
  hidePageTitle: true,
}

export async function bootstrapApp(
  entryPoints: TypeDocOptions['entryPoints'],
  tsconfig: TypeDocOptions['tsconfig'],
  config: TypeDocConfig = {},
  outputDirectory: string,
  pagination: boolean
) {
  const app = new Application()
  app.logger = new StarlightTypeDocLogger()
  app.options.addReader(new TSConfigReader())
  app.renderer.defineTheme('starlight-typedoc', StarlightTypeDocTheme)
  app.renderer.on(PageEvent.END, (event: PageEvent<DeclarationReflection>) => onRendererPageEnd(event, pagination))

  loadMarkdownPlugin(app)

  await app.bootstrapWithPlugins({
    ...defaultTypeDocConfig,
    ...config,
    ...getMarkdownPluginConfig(outputDirectory),
    entryPoints,
    tsconfig,
  })

  return app
}

function onRendererPageEnd(event: PageEvent<DeclarationReflection>, pagination: boolean) {
  if (!event.contents) {
    return
  } else if (/^module\..*\/README\.md$/.test(event.url)) {
    // Do not save `README.md` files for multiple entry points.
    event.preventDefault()
    return
  }

  event.contents = addFrontmatter(event.contents, {
    editUrl: false,
    next: pagination,
    prev: pagination,
    // Wrap in quotes to prevent issue with special characters in frontmatter
    title: `"${event.model.name}"`,
  })
}

function getMarkdownPluginConfig(outputDirectory: string): TypeDocConfig {
  return {
    ...markdownPluginConfig,
    baseUrl: `/${outputDirectory}${outputDirectory.endsWith('/') ? '' : '/'}`,
  }
}

export type TypeDocConfig = Partial<Omit<TypeDocOptions, 'entryPoints' | 'tsconfig'> & PluginOptions>
