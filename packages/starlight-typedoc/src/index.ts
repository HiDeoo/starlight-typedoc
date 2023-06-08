import path from 'node:path'

import type { TypeDocOptions } from 'typedoc'

import { bootstrapApp } from './libs/typedoc'

// TODO(HiDeoo) logs
// TODO(HiDeoo) handle errors
export function generateTypeDoc(options: StarlightTypeDocOptions) {
  const app = bootstrapApp({ entryPoints: options.entryPoints, tsconfig: options.tsconfig })
  const reflections = app.convert()

  if (!reflections) {
    throw new Error('// TODO(HiDeoo) ')
  }

  app.generateDocs(reflections, path.join('src/content/docs', options.output ?? 'api'))

  // TODO(HiDeoo)
  return {
    // TODO(HiDeoo)
    label: 'API ',
    items: [
      // TODO(HiDeoo)
      { label: 'Exports ', link: '/api/exports' },
      // TODO(HiDeoo)...
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
}
