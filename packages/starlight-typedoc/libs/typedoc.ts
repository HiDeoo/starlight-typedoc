import * as fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

import type { AstroConfig, AstroIntegrationLogger } from 'astro'
import { slug } from 'github-slugger'
import {
  Application,
  PageEvent,
  TSConfigReader,
  type TypeDocOptions,
  ParameterType,
  RendererEvent,
  type PageDefinition,
  type ProjectReflection,
} from 'typedoc'
import type { MarkdownPageEvent, PluginOptions } from 'typedoc-plugin-markdown'

import type { StarlightTypeDocOptions } from '..'

import { StarlightTypeDocLogger } from './logger'
import { addFrontmatter } from './markdown'
import { StarlightTypeDocMemberRouter, StarlightTypeDocModuleRouter } from './router'
import { getRelativeURL, getStarlightTypeDocOutputDirectory } from './starlight'
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
  entryFileName: 'index.md',
  hideBreadcrumbs: true,
  hidePageHeader: true,
  hidePageTitle: true,
}

export async function generateTypeDoc(
  options: StarlightTypeDocOptions,
  config: AstroConfig,
  logger: AstroIntegrationLogger,
) {
  const outputDirectory = options.output ?? 'api'

  const {
    entryPoints: jsonEntryPoints,
    tsconfig: jsonTsconfig,
    ...typeDocJsonConfig
  } = loadTypeDocJsonFile(process.cwd(), config.root)

  const entryPoints = options.entryPoints ?? jsonEntryPoints
  const tsconfig = options.tsconfig ?? jsonTsconfig

  if (!entryPoints) {
    throw new Error(
      'No `entryPoints` provided. Specify them in the plugin options or in a `typedoc.json` file at the project root.',
    )
  }
  if (!tsconfig) {
    throw new Error(
      'No `tsconfig` provided. Specify it in the plugin options or in a `typedoc.json` file at the project root.',
    )
  }

  const app = await bootstrapApp(
    entryPoints,
    tsconfig,
    options.typeDoc,
    typeDocJsonConfig as TypeDocConfig,
    {
      base: config.base,
      directory: outputDirectory,
      path: path.join(url.fileURLToPath(config.srcDir), 'content/docs', outputDirectory),
    },
    options.pagination ?? false,
    logger,
  )

  const definitions: TypeDocDefinitions = {}
  app.renderer.on(RendererEvent.END, (event) => {
    for (const page of event.pages) {
      if (!('id' in page.model)) continue
      definitions[page.model.id] = page.url
    }
  })

  let reflections: ProjectReflection | undefined

  if (options.watch) {
    reflections = await new Promise<ProjectReflection>((resolve) => {
      void app.convertAndWatch(async (reflections) => {
        await app.generateOutputs(reflections)
        resolve(reflections)
      })
    })
  } else {
    reflections = await app.convert()

    if (
      (!reflections?.groups || reflections.groups.length === 0) &&
      !reflections?.children?.some((child) => (child.groups ?? []).length > 0)
    ) {
      throw new NoReflectionsError()
    }

    await app.generateOutputs(reflections)
  }

  return { definitions, outputDirectory, reflections }
}

async function bootstrapApp(
  entryPoints: NonNullable<TypeDocOptions['entryPoints']>,
  tsconfig: NonNullable<TypeDocOptions['tsconfig']>,
  config: TypeDocConfig = {},
  typeDocJsonConfig: TypeDocConfig = {},
  output: TypeDocOutput,
  pagination: boolean,
  logger: AstroIntegrationLogger,
) {
  const pagesToRemove: string[] = []
  const outputDirectory = getStarlightTypeDocOutputDirectory(output.directory, output.base)

  const app = await Application.bootstrapWithPlugins({
    ...defaultTypeDocConfig,
    ...markdownPluginConfig,
    ...typeDocJsonConfig,
    ...config,
    // typedoc-plugin-markdown must be applied here so that it isn't overwritten by any additional applied plugins
    plugin: [...(typeDocJsonConfig.plugin ?? []), ...(config.plugin ?? []), 'typedoc-plugin-markdown'],
    entryPoints,
    tsconfig,
    outputs: [{ name: 'markdown', path: output.path }],
  })
  app.logger = new StarlightTypeDocLogger(logger)
  app.options.addReader(new TSConfigReader())
  app.renderer.defineRouter('starlight-typedoc-member', StarlightTypeDocMemberRouter)
  app.renderer.defineRouter('starlight-typedoc-module', StarlightTypeDocModuleRouter)
  if (!app.options.isSet('router')) {
    const outputFileStrategy = app.options.isSet('outputFileStrategy')
      ? app.options.getValue('outputFileStrategy')
      : 'members'
    app.options.setValue(
      'router',
      outputFileStrategy === 'modules' ? 'starlight-typedoc-module' : 'starlight-typedoc-member',
    )
  }
  app.renderer.defineTheme('starlight-typedoc', StarlightTypeDocTheme)
  app.renderer.on(PageEvent.BEGIN, (event) => {
    onRendererPageBegin(event as MarkdownPageEvent, outputDirectory, pagination)
  })
  app.renderer.on(PageEvent.END, (event) => {
    const shouldRemovePage = onRendererPageEnd(event as MarkdownPageEvent, outputDirectory, pagination)
    if (shouldRemovePage) {
      pagesToRemove.push(event.filename)
    }
  })
  app.renderer.on(RendererEvent.END, () => {
    onRendererEnd(pagesToRemove)
  })
  app.options.addDeclaration({
    defaultValue: outputDirectory,
    help: 'The starlight-typedoc output directory containing the generated documentation markdown files relative to the `src/content/docs/` directory.',
    name: 'starlight-typedoc-output',
    type: ParameterType.String,
  })

  return app
}

function onRendererPageBegin(event: MarkdownPageEvent, outputDirectory: string, pagination: boolean) {
  if (event.frontmatter) {
    event.frontmatter = getModelFrontmatter(event, outputDirectory, {
      ...event.frontmatter,
      editUrl: false,
      next: pagination,
      prev: pagination,
      title: event.model.name,
    })
  }
}

// Returning `true` will delete the page from the filesystem.
function onRendererPageEnd(event: MarkdownPageEvent, outputDirectory: string, pagination: boolean) {
  if (!event.contents) {
    return false
  }

  if (!event.frontmatter) {
    event.contents = addFrontmatter(
      event.contents,
      getModelFrontmatter(event, outputDirectory, {
        editUrl: false,
        next: pagination,
        prev: pagination,
        // Wrap in quotes to prevent issue with special characters in frontmatter
        title: `"${event.model.name}"`,
      }),
    )
  }

  return false
}

function onRendererEnd(pagesToRemove: string[]) {
  for (const page of pagesToRemove) {
    fs.rmSync(page, { force: true })
  }
}

function getModelFrontmatter(
  event: MarkdownPageEvent,
  outputDirectory: string,
  frontmatter: NonNullable<MarkdownPageEvent['frontmatter']>,
) {
  const defaultSlug = slug(event.model.name)

  if (defaultSlug.length === 0) {
    frontmatter['slug'] = getRelativeURL(event.url, outputDirectory, event.url).replaceAll(/^\/|\/$/g, '')
  }

  return frontmatter
}

function loadTypeDocJsonFile(...candidates: (URL | string | undefined)[]): TypeDocJsonFile {
  for (const candidate of candidates) {
    if (!candidate) continue
    try {
      const base = candidate instanceof URL ? url.fileURLToPath(candidate) : candidate
      const configPath = path.join(base, 'typedoc.json')
      if (!fs.existsSync(configPath)) continue
      return JSON.parse(fs.readFileSync(configPath, 'utf8')) as TypeDocJsonFile
    } catch {
      continue
    }
  }
  return {}
}

export class NoReflectionsError extends Error {
  constructor() {
    super('Failed to generate TypeDoc documentation.')
  }
}

export type TypeDocConfig = Partial<Omit<TypeDocOptions, 'entryPoints' | 'tsconfig'> & PluginOptions>
export type TypeDocDefinitions = Record<string, PageDefinition['url']>

type TypeDocJsonFile = Partial<TypeDocOptions & PluginOptions>

interface TypeDocOutput {
  base: string
  directory: string
  path: string
}
