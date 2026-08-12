import { randomBytes } from 'node:crypto'
import path from 'node:path'
import url from 'node:url'

import type { StarlightPlugin } from '@astrojs/starlight/types'
import { AstroError } from 'astro/errors'
import type { TypeDocOptions } from 'typedoc'

import {
  getSidebarFromReflections,
  getSidebarGroupPlaceholder,
  getSidebarWithoutReflections,
  type SidebarGroup,
} from './libs/starlight'
import { DefaultOutputDirectory, generateTypeDoc, NoReflectionsError, type TypeDocConfig } from './libs/typedoc'

export const typeDocSidebarGroup = getSidebarGroupPlaceholder()

const outputs = new WeakMap<URL, string[]>()

export default function starlightTypeDocPlugin(options: StarlightTypeDocOptions): StarlightPlugin {
  return makeStarlightTypeDocPlugin(typeDocSidebarGroup)(options)
}

export function createStarlightTypeDocPlugin(): [plugin: typeof starlightTypeDocPlugin, sidebarGroup: SidebarGroup] {
  const sidebarGroup = getSidebarGroupPlaceholder(Symbol(randomBytes(24).toString('base64url')))

  return [makeStarlightTypeDocPlugin(sidebarGroup), sidebarGroup]
}

function makeStarlightTypeDocPlugin(sidebarGroup: SidebarGroup): (options: StarlightTypeDocOptions) => StarlightPlugin {
  return function starlightTypeDocPlugin(options: StarlightTypeDocOptions) {
    return {
      name: 'starlight-typedoc-plugin',
      hooks: {
        async 'config:setup'({ astroConfig, command, config, logger, updateConfig }) {
          if (command === 'preview') return

          const output = options.output ?? DefaultOutputDirectory
          const outputPath = path.join(url.fileURLToPath(astroConfig.srcDir), 'content/docs', output)
          const knownOutputs = outputs.get(astroConfig.srcDir) ?? []

          for (const knownOutput of knownOutputs) {
            if (isSameOrNestedDirectory(knownOutput, outputPath) || isSameOrNestedDirectory(outputPath, knownOutput)) {
              throw new AstroError(
                `The 'output' directory '${output}' conflicts with the output directory of another Starlight TypeDoc plugin instance.`,
                "Configure each Starlight TypeDoc plugin instance with a distinct and non-overlapping 'output' directory.",
              )
            }
          }

          outputs.set(astroConfig.srcDir, [...knownOutputs, outputPath])

          try {
            const { definitions, outputDirectory, readmeUrls, reflections } = await generateTypeDoc(
              options,
              astroConfig,
              logger,
            )

            updateConfig({
              sidebar: getSidebarFromReflections(
                config.sidebar,
                sidebarGroup,
                options.sidebar,
                reflections,
                definitions,
                outputDirectory,
                readmeUrls,
              ),
            })
          } catch (error) {
            if (options.errorOnEmptyDocumentation === false && error instanceof NoReflectionsError) {
              logger.warn('No documentation generated but ignoring as `errorOnEmptyDocumentation` is disabled.')
              updateConfig({ sidebar: getSidebarWithoutReflections(config.sidebar, sidebarGroup) })
              return
            }

            throw error
          }
        },
      },
    }
  }
}

function isSameOrNestedDirectory(parent: string, child: string) {
  const relative = path.relative(parent, child)
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`))
}

export interface StarlightTypeDocOptions {
  /**
   * The path(s) to the entry point(s) to document.
   *
   * This option can also be specified in a TypeDoc options file located at the root of the project (e.g. `typedoc.json`
   * or `typedoc.mjs`).
   *
   * @see https://typedoc.org/documents/Options.Configuration.html#options
   */
  entryPoints?: NonNullable<TypeDocOptions['entryPoints']>
  /**
   * Whether the plugin should error when no TypeDoc documentation is generated.
   * @default true
   */
  errorOnEmptyDocumentation?: boolean
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
   *
   * This option can also be specified in a TypeDoc options file located at the root of the project (e.g. `typedoc.json`
   * or `typedoc.mjs`).
   *
   * @see https://typedoc.org/documents/Options.Configuration.html#options
   */
  tsconfig?: NonNullable<TypeDocOptions['tsconfig']>
  /**
   * Additional TypeDoc configuration.
   *
   * These options can also be specified in a TypeDoc options file located at the root of the project (e.g.
   * `typedoc.json` or `typedoc.mjs`).
   *
   * @see https://typedoc.org/documents/Options.html
   * @see https://typedoc.org/documents/Options.Configuration.html#options
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
   * Whether the generated documentation sidebar group should be collapsed by default.
   * Note that nested sidebar groups are always collapsed.
   * @default false
   */
  collapsed?: boolean
  /**
   * The generated documentation sidebar group label.
   * @default 'API'
   */
  label?: string
  /**
   * The label used for generated readme links in the sidebar when the TypeDoc `readme` option is configured.
   * @default 'Overview'
   * @see https://typedoc.org/documents/Options.Input.html#readme
   */
  readmeLabel?: string
}
