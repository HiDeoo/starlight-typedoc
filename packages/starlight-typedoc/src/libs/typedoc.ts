import { Application, TSConfigReader, type TypeDocOptions } from 'typedoc'
import { load as loadMarkdownPlugin } from 'typedoc-plugin-markdown'

import { StarlightTypedocTheme } from './theme'

const defaultOptions: Partial<TypeDocOptions> = {
  disableSources: true,
  githubPages: false,
  readme: 'none',
  theme: StarlightTypedocTheme.identifier,
}

export function bootstrapApp(options: Partial<TypeDocOptions>) {
  const app = new Application()
  app.options.addReader(new TSConfigReader())

  loadMarkdownPlugin(app)

  app.renderer.defineTheme(StarlightTypedocTheme.identifier, StarlightTypedocTheme)

  app.bootstrap({
    ...defaultOptions,
    ...options,
  })

  return app
}
