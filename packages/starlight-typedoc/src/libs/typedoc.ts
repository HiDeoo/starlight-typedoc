import { Application, type DeclarationReflection, PageEvent, TSConfigReader, type TypeDocOptions } from 'typedoc'
import { load as loadMarkdownPlugin } from 'typedoc-plugin-markdown'

import { StarlightTypeDocTheme } from './StarlightTypeDocTheme'

const defaultTypeDocConfig: TypeDocConfig = {
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
  skipIndexPage: true,
}

export function bootstrapApp(
  entryPoints: TypeDocOptions['entryPoints'],
  tsconfig: TypeDocOptions['tsconfig'],
  config: TypeDocConfig = {},
  outputDirectory: string
) {
  const app = new Application()
  app.options.addReader(new TSConfigReader())
  app.renderer.defineTheme('starlight-typedoc', StarlightTypeDocTheme)
  app.renderer.on(PageEvent.END, onRendererPageEnd)

  loadMarkdownPlugin(app)

  app.bootstrap({
    ...defaultTypeDocConfig,
    ...config,
    ...getMarkdownPluginConfig(outputDirectory),
    entryPoints,
    tsconfig,
  })

  return app
}

function onRendererPageEnd(event: PageEvent<DeclarationReflection>) {
  if (!event.contents) {
    return
  }

  // TODO(HiDeoo) Improve this
  event.contents = `---
title: ${event.model.name}
---

${event.contents}`
}

function getMarkdownPluginConfig(outputDirectory: string): TypeDocConfig {
  return {
    ...markdownPluginConfig,
    baseUrl: `/${outputDirectory}${outputDirectory.endsWith('/') ? '' : '/'}`,
  }
}

export type TypeDocConfig = Partial<Omit<TypeDocOptions, 'entryPoints' | 'tsconfig'>>
