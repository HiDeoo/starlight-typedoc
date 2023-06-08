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

        const app = bootstrapApp(options)
        const reflections = app.convert()

        if (!reflections) {
          // TODO(HiDeoo)
          return
        }

        // TODO(HiDeoo) path
        app.generateDocs(reflections, './docs')
      },
    },
  }
}

export interface StarlightTypeDocIntegration {
  entryPoints: TypeDocOptions['entryPoints']
  tsconfig: TypeDocOptions['tsconfig']
}
