import {
  Application,
  type DeclarationReflection,
  PageEvent,
  TSConfigReader,
  type TypeDocOptions,
  ParameterType,
} from 'typedoc'
import type { PluginOptions } from 'typedoc-plugin-markdown'

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
  hidePageHeader: true,
  hidePageTitle: true,
}

export async function bootstrapApp(
  entryPoints: TypeDocOptions['entryPoints'],
  tsconfig: TypeDocOptions['tsconfig'],
  config: TypeDocConfig = {},
  outputDirectory: string,
  pagination: boolean,
) {
  const app = await Application.bootstrapWithPlugins({
    ...defaultTypeDocConfig,
    ...markdownPluginConfig,
    ...config,
    // typedoc-plugin-markdown must be applied here so that it isn't overwritten by any additional applied plugins
    plugin: [...(config.plugin ?? []), 'typedoc-plugin-markdown'],
    entryPoints,
    tsconfig,
  })
  app.logger = new StarlightTypeDocLogger()
  app.options.addReader(new TSConfigReader())
  app.renderer.defineTheme('starlight-typedoc', StarlightTypeDocTheme)
  app.renderer.on(PageEvent.END, (event: PageEvent<DeclarationReflection>) => {
    onRendererPageEnd(event, pagination)
  })
  app.options.addDeclaration({
    defaultValue: `/${outputDirectory}${outputDirectory.endsWith('/') ? '' : '/'}`,
    help: 'The starlight-typedoc output directory containing the generated documentation markdown files relative to the `src/content/docs/` directory.',
    name: 'starlight-typedoc-output',
    type: ParameterType.String,
  })

  return app
}

function onRendererPageEnd(event: PageEvent<DeclarationReflection>, pagination: boolean) {
  if (!event.contents) {
    return
  } else if (/^.+\/README\.md$/.test(event.url)) {
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

export type TypeDocConfig = Partial<Omit<TypeDocOptions, 'entryPoints' | 'tsconfig'> & PluginOptions>
