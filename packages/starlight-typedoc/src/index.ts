import path from 'node:path'

import type { TypeDocOptions } from 'typedoc'

import { getSidebarGroupFromReflections, type SidebarGroup } from './libs/starlight'
import { bootstrapApp, type TypeDocConfig } from './libs/typedoc'

export async function generateTypeDoc(options: StarlightTypeDocOptions): Promise<SidebarGroup> {
  const outputDirectory = options.output ?? 'api'

  const app = await bootstrapApp(
    options.entryPoints,
    options.tsconfig,
    options.typeDoc,
    outputDirectory,
    options.pagination ?? false
  )
  const reflections = app.convert()

  if (!reflections?.groups || reflections.groups.length === 0) {
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

  return getSidebarGroupFromReflections(options.sidebar, reflections, outputDirectory)
}

export interface StarlightTypeDocOptions {
  /**
   * The path(s) to the entry point(s) to document.
   */
  entryPoints: TypeDocOptions['entryPoints']
  /**
   * The output directory containing the generated documentation markdown files relative to the `src/content/docs/`
   * directory.
   * @default 'api'
   */
  output?: string
  /**
   * The sidebar configuration for the generated documentation.
   */
  sidebar?: StarlightTypeDocSidebarOptions
  /**
   * Whether the footer should include previous and next page links for the generated documentation.
   * @default false
   */
  pagination?: boolean
  /**
   * The path to the `tsconfig.json` file to use for the documentation generation.
   */
  tsconfig: TypeDocOptions['tsconfig']
  /**
   * Additional TypeDoc configuration.
   * @see https://typedoc.org/options
   */
  typeDoc?: TypeDocConfig
  /**
   * Whether to watch the entry point(s) for changes and regenerate the documentation when needed.
   * @default false
   */
  watch?: boolean
}

export interface StarlightTypeDocSidebarOptions {
  /**
   * Wheter the generated documentation sidebar group should be collapsed by default.
   * Note that nested sidebar groups are always collapsed.
   * @default false
   */
  collapsed?: boolean
  /**
   * The generated documentation sidebar group label.
   * @default 'API'
   */
  label?: string
}
