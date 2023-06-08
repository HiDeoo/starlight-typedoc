import { Application, TSConfigReader, type TypeDocOptions } from 'typedoc'
import { load as loadMarkdownPlugin, MarkdownTheme } from 'typedoc-plugin-markdown'

const themeName = 'starlight-typedoc'

const defaultOptions: Partial<TypeDocOptions> = {
  disableSources: true,
  readme: 'none',
  theme: themeName,
}

export function bootstrapApp(options: Partial<TypeDocOptions>) {
  const app = new Application()
  app.options.addReader(new TSConfigReader())

  loadMarkdownPlugin(app)

  app.renderer.defineTheme(themeName, MarkdownTheme)

  app.bootstrap({
    ...defaultOptions,
    ...options,
  })

  return app
}
