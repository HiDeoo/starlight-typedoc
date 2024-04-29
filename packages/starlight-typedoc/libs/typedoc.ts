import path from 'node:path'

import type { AstroIntegrationLogger } from 'astro'
import {
  Application,
  type DeclarationReflection,
  PageEvent,
  TSConfigReader,
  type TypeDocOptions,
  ParameterType,
} from 'typedoc'
import type { PluginOptions } from 'typedoc-plugin-markdown'

import type { StarlightTypeDocOptions } from '..'

import { StarlightTypeDocLogger } from './logger'
import { addFrontmatter } from './markdown'
import { getStarlightTypeDocOutputDirectory } from './starlight'
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
  hidePageHeader: true,
  hidePageTitle: true,
}

export async function generateTypeDoc(options: StarlightTypeDocOptions, base: string, logger: AstroIntegrationLogger) {
  const outputDirectory = options.output ?? 'api'

  const app = await bootstrapApp(
    options.entryPoints,
    options.tsconfig,
    options.typeDoc,
    outputDirectory,
    options.pagination ?? false,
    base,
    logger,
  )
  const reflections = await app.convert()

  if (
    (!reflections?.groups || reflections.groups.length === 0) &&
    !reflections?.children?.some((child) => (child.groups ?? []).length > 0)
  ) {
    throw new Error('Failed to generate TypeDoc documentation.')
  }

  const outputPath = path.join('src/content/docs', outputDirectory)

  if (options.watch) {
    app.convertAndWatch(async (reflections) => {
      await app.generateDocs(reflections, outputPath)
    })
  } else {
    await app.generateDocs(reflections, outputPath)
  }

  return { outputDirectory, reflections }
}

async function bootstrapApp(
  entryPoints: TypeDocOptions['entryPoints'],
  tsconfig: TypeDocOptions['tsconfig'],
  config: TypeDocConfig = {},
  outputDirectory: string,
  pagination: boolean,
  base: string,
  logger: AstroIntegrationLogger,
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
  app.logger = new StarlightTypeDocLogger(logger)
  app.options.addReader(new TSConfigReader())
  // @ts-expect-error - Invalid theme typing
  app.renderer.defineTheme('starlight-typedoc', StarlightTypeDocTheme)
  app.renderer.on(PageEvent.END, (event: PageEvent<DeclarationReflection>) => {
    onRendererPageEnd(event, pagination)
  })
  app.options.addDeclaration({
    defaultValue: getStarlightTypeDocOutputDirectory(outputDirectory, base),
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
