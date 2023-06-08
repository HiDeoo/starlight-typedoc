import { Application, type DeclarationReflection, PageEvent, TSConfigReader, type TypeDocOptions } from 'typedoc'
import { load as loadMarkdownPlugin } from 'typedoc-plugin-markdown'

const defaultTypeDocOptions: Partial<TypeDocOptions> = {
  // TODO(HiDeoo)
  entryFileName: 'exports.md',
  githubPages: false,
  readme: 'none',
}

export function bootstrapApp(options: Partial<TypeDocOptions>) {
  const app = new Application()
  app.options.addReader(new TSConfigReader())
  app.renderer.on(PageEvent.END, onPageEnd)

  loadMarkdownPlugin(app)

  app.bootstrap({
    ...defaultTypeDocOptions,
    ...options,
  })

  return app
}

function onPageEnd(event: PageEvent<DeclarationReflection>) {
  if (!event.contents) {
    return
  }

  // TODO(HiDeoo)
  event.contents = `---
title: ${event.model.name}
---

${event.contents}`
}
