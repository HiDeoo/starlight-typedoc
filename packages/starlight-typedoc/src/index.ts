import type { AstroIntegration } from 'astro'

export default function starlightTypeDocIntegration(): AstroIntegration {
  return {
    name: 'starlight-typedoc',
    hooks: {
      'astro:config:done': () => {
        console.warn('INTEGRATION: starlight-typedoc')
      },
    },
  }
}
