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
  TypeDocReader,
  PackageJsonReader,
  type OptionsReader,
  type Options,
  PageKind,
  ReflectionKind,
} from 'typedoc'
import type { MarkdownPageEvent, PluginOptions } from 'typedoc-plugin-markdown'

import type { StarlightTypeDocOptions } from '..'

import { StarlightTypeDocLogger } from './logger'
import { addFrontmatter } from './markdown'
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

  const { app, isReadmeConfigured } = await bootstrapApp(
    options.entryPoints,
    options.tsconfig,
    options.typeDoc,
    {
      base: config.base,
      directory: outputDirectory,
      path: path.join(url.fileURLToPath(config.srcDir), 'content/docs', outputDirectory),
    },
    options.pagination ?? false,
    logger,
  )

  const definitions: TypeDocDefinitions = {}
  const readmeUrls: TypeDocReadmeUrls = {}

  const entryFileName = app.options.getValue('entryFileName')
  const fileExtension = app.options.getValue('fileExtension')
  const entryPageFileName =
    typeof entryFileName === 'string' && typeof fileExtension === 'string'
      ? `${path.parse(entryFileName).name}${fileExtension}`
      : undefined

  app.renderer.on(RendererEvent.END, (event) => {
    for (const page of event.pages) {
      const isPackageEntryPage =
        entryPageFileName !== undefined &&
        path.basename(page.url) === entryPageFileName &&
        'kind' in page.model &&
        page.model.kind === ReflectionKind.Module &&
        page.model.parent?.kind === ReflectionKind.Project

      if (
        isReadmeConfigured &&
        'id' in page.model &&
        // Root readme pages are emitted as index pages; package overviews are emitted as module entry pages.
        (page.kind === PageKind.Index || isPackageEntryPage)
      ) {
        readmeUrls[page.model.id] = page.url
      }

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

  return { definitions, outputDirectory, readmeUrls, reflections }
}

async function bootstrapApp(
  entryPoints: TypeDocOptions['entryPoints'],
  tsconfig: TypeDocOptions['tsconfig'],
  config: TypeDocConfig = {},
  output: TypeDocOutput,
  pagination: boolean,
  logger: AstroIntegrationLogger,
) {
  const pagesToRemove: string[] = []
  const outputDirectory = getStarlightTypeDocOutputDirectory(output.directory, output.base)

  // Merge plugins later so plugins from config files are preserved.
  const { plugin = [], ...typeDocConfig } = config

  const app = await Application.bootstrapWithPlugins(
    {
      ...defaultTypeDocConfig,
      ...markdownPluginConfig,
      ...typeDocConfig,
      ...(entryPoints === undefined ? {} : { entryPoints }),
      ...(tsconfig === undefined ? {} : { tsconfig }),
      outputs: [{ name: 'markdown', path: output.path }],
    },
    [new TypeDocReader(), new PackageJsonReader(), new TSConfigReader(), new PluginOptionsReader(plugin)],
  )
  app.logger = new StarlightTypeDocLogger(logger)
  // TODO(HiDeoo)
  app.options.addReader(new TSConfigReader())

  const readme = app.options.getValue('readme')
  const isReadmeConfigured = typeof readme === 'string' && !readme.endsWith('none')

  app.renderer.defineTheme('starlight-typedoc', StarlightTypeDocTheme)
  app.renderer.on(PageEvent.BEGIN, (event) => {
    onRendererPageBegin(event as MarkdownPageEvent, outputDirectory, pagination)
  })
  app.renderer.on(PageEvent.END, (event) => {
    const shouldRemovePage = onRendererPageEnd(
      event as MarkdownPageEvent,
      outputDirectory,
      pagination,
      isReadmeConfigured,
    )
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

  return { app, isReadmeConfigured }
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
function onRendererPageEnd(
  event: MarkdownPageEvent,
  outputDirectory: string,
  pagination: boolean,
  isReadmeConfigured: boolean,
) {
  if (!event.contents) {
    return false
  } else if (!isReadmeConfigured && /^.+[/\\]README\.md$/.test(event.url)) {
    // Do not save `README.md` files for multiple entry points if the `readme` option is not configured.
    // It is no longer supported in TypeDoc 0.26.0 to call `event.preventDefault()` to prevent the file from being saved.
    // https://github.com/TypeStrong/typedoc/commit/6e6b3b662c92b3d4bc24b6c6c0c6e227e063c759
    // event.preventDefault()
    return true
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

class PluginOptionsReader implements OptionsReader {
  readonly name = 'starlight-typedoc-plugin'
  // Run after config readers so config-file plugins can be merged instead of overwritten.
  readonly order = 300
  readonly supportsPackages = false

  constructor(private readonly plugin: NonNullable<TypeDocOptions['plugin']>) {}

  read(container: Options) {
    // Let TypeDoc normalize plugin names before deduping them.
    container.setValue('plugin', [...container.getValue('plugin'), ...this.plugin, 'typedoc-plugin-markdown'])

    const plugins = container.getValue('plugin')
    const markdownPlugin = plugins.at(-1)

    if (markdownPlugin === undefined) return

    container.setValue('plugin', [
      ...this.#dedupePlugins(plugins.filter((plugin) => plugin !== markdownPlugin)),
      markdownPlugin,
    ])
  }

  #dedupePlugins(plugins: NonNullable<TypeDocOptions['plugin']>) {
    const uniquePlugins: NonNullable<TypeDocOptions['plugin']> = []

    for (const plugin of plugins) {
      if (!uniquePlugins.includes(plugin)) {
        uniquePlugins.push(plugin)
      }
    }

    return uniquePlugins
  }
}

export class NoReflectionsError extends Error {
  constructor() {
    super('Failed to generate TypeDoc documentation.')
  }
}

export type TypeDocConfig = Partial<Omit<TypeDocOptions, 'entryPoints' | 'tsconfig'> & PluginOptions>
export type TypeDocDefinitions = Record<string, PageDefinition['url']>
export type TypeDocReadmeUrls = Record<string, PageDefinition['url']>

interface TypeDocOutput {
  base: string
  directory: string
  path: string
}
