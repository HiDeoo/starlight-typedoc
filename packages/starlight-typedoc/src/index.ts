import path from 'node:path'

import type { ProjectReflection, TypeDocOptions } from 'typedoc'

import { bootstrapApp, type TypeDocConfig } from './libs/typedoc'

// TODO(HiDeoo) logs
// TODO(HiDeoo) handle errors
export function generateTypeDoc(options: StarlightTypeDocOptions) {
  const app = bootstrapApp(options.entryPoints, options.tsconfig, options.typeDoc)
  const reflections = app.convert()

  if (!reflections) {
    throw new Error('// TODO(HiDeoo) ')
  }

  const outputDirectory = options.output ?? 'api'

  app.generateDocs(reflections, path.join('src/content/docs', outputDirectory))

  const t = getSidebarGroupFromReflections(reflections, outputDirectory)

  return t
}

// TODO(HiDeoo) Test with no results, multiple entry points, 1 group, etc.
function getSidebarGroupFromReflections(reflections: ProjectReflection, outputDirectory: string) {
  const groups = reflections.groups ?? []

  return {
    // TODO(HiDeoo) Handle name
    label: 'API ',
    items: [
      // TODO(HiDeoo) Handle multiple entry points
      { label: 'Exports', link: `/${outputDirectory}/exports` },
      ...groups.map((group) => ({
        label: group.title,
        autogenerate: { directory: `${outputDirectory}/${group.title.toLowerCase()}` },
      })),
    ],
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
   * The path to the `tsconfig.json` file to use for the documentation generation.
   */
  tsconfig: TypeDocOptions['tsconfig']
  /**
   * Additional TypeDoc configuration.
   * @see https://typedoc.org/options
   */
  typeDoc?: TypeDocConfig
}
