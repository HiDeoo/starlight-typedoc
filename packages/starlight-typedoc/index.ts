import { randomBytes } from 'node:crypto'

import type { StarlightPlugin } from '@astrojs/starlight/types'
import type { TypeDocOptions } from 'typedoc'

import { getSidebarFromReflections, getSidebarGroupPlaceholder, type SidebarGroup } from './libs/starlight'
import { generateTypeDoc, type TypeDocConfig } from './libs/typedoc'

export const typeDocSidebarGroup = getSidebarGroupPlaceholder()

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
        async setup({ astroConfig, config, logger, updateConfig }) {
          const { outputDirectory, reflections } = await generateTypeDoc(options, astroConfig.base, logger)
          const sidebar = getSidebarFromReflections(
            config.sidebar,
            sidebarGroup,
            options.sidebar,
            reflections,
            outputDirectory,
          )

          updateConfig({ sidebar })
        },
      },
    }
  }
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
