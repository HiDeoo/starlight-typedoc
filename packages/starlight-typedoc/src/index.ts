import path from 'node:path'

import type { ProjectReflection, TypeDocOptions } from 'typedoc'

import { bootstrapApp, type TypeDocConfig } from './libs/typedoc'

// TODO(HiDeoo) logs
// TODO(HiDeoo) handle errors
export async function generateTypeDoc(options: StarlightTypeDocOptions) {
  const app = bootstrapApp(options.entryPoints, options.tsconfig, options.typeDoc)
  const reflections = app.convert()

  if (!reflections?.groups || reflections.groups.length === 0) {
    throw new Error('Failed to generate TypeDoc documentation.')
  }

  const outputDirectory = options.output ?? 'api'

  await app.generateDocs(reflections, path.join('src/content/docs', outputDirectory))

  return getSidebarGroupFromReflections(options.sidebarLabel, reflections, outputDirectory)
}

// TODO(HiDeoo) Test with no results, multiple entry points, 1 group, etc.
function getSidebarGroupFromReflections(label = 'API', reflections: ProjectReflection, outputDirectory: string) {
  const groups = reflections.groups ?? []

  return {
    label,
    items: groups.map((group) => ({
      label: group.title,
      autogenerate: { directory: `${outputDirectory}/${group.title.toLowerCase()}` },
    })),
  }
}

export interface StarlightTypeDocOptions {
  /**
   * The entry points to document.
   */
  entryPoints: TypeDocOptions['entryPoints']
  /**
   * The output directory containing the generated documentation markdown files relative to the `src/content/docs/`
   * directory.
   * @default 'api'
   */
  output?: string
  /**
   * The generated documentation sidebar group label.
   * @default 'API'
   */
  sidebarLabel?: string
  /**
   * The path to the `tsconfig.json` file to use for the documentation generation.
   */
  tsconfig: TypeDocOptions['tsconfig']
  /**
   * Additional TypeDoc configuration.
   * @see https://typedoc.org/options
   */
  typeDoc?: TypeDocConfig
}
