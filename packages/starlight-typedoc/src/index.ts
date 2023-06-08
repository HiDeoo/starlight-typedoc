import path from 'node:path'

import type { AstroIntegration } from 'astro'
import type { TypeDocOptions } from 'typedoc'

import { bootstrapApp } from './libs/typedoc'

export default function starlightTypeDocIntegration(options: StarlightTypeDocIntegration): AstroIntegration {
  return {
    name: 'starlight-typedoc',
    hooks: {
      'astro:config:done': () => {
        // TODO(HiDeoo) logs
        // TODO(HiDeoo) handle errors

        const app = bootstrapApp({ entryPoints: options.entryPoints, tsconfig: options.tsconfig })
        const reflections = app.convert()

        if (!reflections) {
          // TODO(HiDeoo)
          return
        }

        app.generateDocs(reflections, path.join('src/content/docs', options.output ?? 'api'))
      },
    },
  }
}

export interface StarlightTypeDocIntegration {
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
   * The path to the `tsconfig.json` file to use.
   */
  tsconfig: TypeDocOptions['tsconfig']
}
