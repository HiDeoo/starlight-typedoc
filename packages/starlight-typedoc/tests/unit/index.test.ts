import type { HookParameters, StarlightPlugin } from '@astrojs/starlight/types'
import { expect, test, vi } from 'vitest'

import { createStarlightTypeDocPlugin } from '../..'
import { DefaultOutputDirectory } from '../../libs/typedoc'

vi.mock(import('../../libs/typedoc'), async (importOriginal) => {
  const mod = await importOriginal()
  return { ...mod, generateTypeDoc: vi.fn().mockResolvedValue({}) }
})

test.for([
  [undefined, undefined],
  [undefined, 'api'],
  ['api', './api'],
  ['api', 'api/admin'],
  ['api/admin', 'api'],
])('rejects conflicting output directories for multiple instances', async ([a, b]) => {
  await expect(runPlugins([createPlugin(a), createPlugin(b)])).rejects.toThrowError(
    `The 'output' directory '${b ?? DefaultOutputDirectory}' conflicts with the output directory of another Starlight TypeDoc plugin instance.`,
  )
})

function createPlugin(output?: string) {
  const [plugin] = createStarlightTypeDocPlugin()
  return plugin(output === undefined ? {} : { output })
}

async function runPlugins(plugins: StarlightPlugin[]) {
  const srcDir = new URL('src', import.meta.url)

  for (const plugin of plugins) {
    const hook = plugin.hooks['config:setup']
    if (!hook) throw new Error('Missing config:setup hook.')

    await hook({
      astroConfig: { srcDir },
      command: 'build',
      config: { plugins },
      logger: { warn: vi.fn() },
      updateConfig: vi.fn(),
    } as unknown as HookParameters<'config:setup'>)
  }
}

test('allows sibling output directories', async () => {
  await expect(runPlugins([createPlugin('api/public'), createPlugin('api/admin')])).resolves.toBeUndefined()
})
