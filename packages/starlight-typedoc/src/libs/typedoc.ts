import { Application, type DeclarationReflection, PageEvent, TSConfigReader, type TypeDocOptions } from 'typedoc'
import { load as loadMarkdownPlugin } from 'typedoc-plugin-markdown'

const defaultTypeDocConfig: TypeDocConfig = {
  githubPages: false,
  readme: 'none',
}

const markdownPluginConfig = {
  // TODO(HiDeoo) Change based on the number of entry points?
  entryFileName: 'exports.md',
}

export function bootstrapApp(
  entryPoints: TypeDocOptions['entryPoints'],
  tsconfig: TypeDocOptions['tsconfig'],
  config: TypeDocConfig = {}
) {
  const app = new Application()
  app.options.addReader(new TSConfigReader())
  app.renderer.on(PageEvent.END, onRendererPageEnd)

  loadMarkdownPlugin(app)

  app.bootstrap({
    ...defaultTypeDocConfig,
    ...config,
    ...markdownPluginConfig,
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
  // TODO(HiDeoo) The title is wrong for the exports page
  event.contents = `---
title: ${event.model.name}
---

${event.contents}`
}

export type TypeDocConfig = Partial<Omit<TypeDocOptions, 'entryPoints' | 'tsconfig'>>
