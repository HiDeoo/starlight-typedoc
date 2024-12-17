import fs from 'node:fs'

import type { AstroIntegrationLogger, AstroConfig } from 'astro'
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest'

import type { StarlightTypeDocOptions } from '../..'
import { generateTypeDoc } from '../../libs/typedoc'

const starlightTypeDocOptions = {
  tsconfig: '../../fixtures/basics/tsconfig.json',
  typeDoc: {
    logLevel: 4,
  },
} satisfies Partial<StarlightTypeDocOptions>

const starlightTypeDocAstroConfig: Partial<AstroConfig> = {
  // './src' is the default value supplied by Astro — https://docs.astro.build/en/reference/configuration-reference/#srcdir
  srcDir: new URL('src', import.meta.url),
}

beforeAll(() => {
  vi.spyOn(fs, 'mkdirSync').mockReturnValue(undefined)
  vi.spyOn(fs, 'rmSync').mockReturnValue(undefined)
  vi.spyOn(fs, 'writeFileSync').mockReturnValue(undefined)
})

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  vi.restoreAllMocks()
})

test('should throw an error with no exports', async () => {
  await expect(
    generateTestTypeDoc({
      ...starlightTypeDocOptions,
      entryPoints: ['../../fixtures/basics/src/noExports.ts'],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Failed to generate TypeDoc documentation.]`)
})

test('should support providing custom TypeDoc options', async () => {
  const options = {
    ...starlightTypeDocOptions,
    entryPoints: ['../../fixtures/basics/src/noDocs.ts'],
  }

  await expect(generateTestTypeDoc(options)).resolves.not.toThrow()

  await expect(
    generateTestTypeDoc({
      ...options,
      typeDoc: {
        ...starlightTypeDocOptions.typeDoc,
        excludeNotDocumented: true,
      },
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Failed to generate TypeDoc documentation.]`)
})

test('should generate the doc in `src/content/docs/api` by default', async () => {
  await generateTestTypeDoc({
    ...starlightTypeDocOptions,
    entryPoints: ['../../fixtures/basics/src/functions.ts'],
  })

  const mkdirSyncSpy = vi.mocked(fs.mkdirSync)

  expect(mkdirSyncSpy).toHaveBeenCalled()
  expect(mkdirSyncSpy.mock.calls[0]?.[0].toString()).toMatch(/src[/\\]content[/\\]docs[/\\]api$/)
})

test('should generate the doc in `/content/docs/api` of the srcDir via the AstroConfig', async () => {
  await generateTestTypeDoc(
    {
      ...starlightTypeDocOptions,
      entryPoints: ['../../fixtures/basics/src/functions.ts'],
    },
    { srcDir: new URL('www/src', import.meta.url) },
  )

  const mkdirSyncSpy = vi.mocked(fs.mkdirSync)

  expect(mkdirSyncSpy).toHaveBeenCalled()
  expect(mkdirSyncSpy.mock.calls[0]?.[0].toString()).toMatch(/www[/\\]src[/\\]content[/\\]docs[/\\]api$/)
})

test('should generate the doc in a custom output directory relative to `src/content/docs/`', async () => {
  const output = 'dist-api'

  await generateTestTypeDoc({
    ...starlightTypeDocOptions,
    entryPoints: ['../../fixtures/basics/src/functions.ts'],
    output,
  })

  const mkdirSyncSpy = vi.mocked(fs.mkdirSync)

  expect(mkdirSyncSpy).toHaveBeenCalled()
  expect(mkdirSyncSpy.mock.calls[0]?.[0].toString()).toMatch(
    new RegExp(`src[/\\\\]content[/\\\\]docs[/\\\\]${output}$`),
  )
})

test('should not add `README.md` module files for multiple entry points', async () => {
  await generateTestTypeDoc({
    ...starlightTypeDocOptions,
    entryPoints: ['../../fixtures/basics/src/Bar.ts', '../../fixtures/basics/src/Foo.ts'],
  })

  const rmSyncSpy = vi.mocked(fs.rmSync)
  const filePaths = rmSyncSpy.mock.calls.map((call) => call[0].toString())

  expect(rmSyncSpy).toHaveBeenCalled()
  expect(filePaths.filter((filePath) => /\/(?:Bar|Foo)\/README\.md$/.test(filePath)).length).toBe(2)
})

test('should support overriding typedoc-plugin-markdown readme page generation', async () => {
  await generateTestTypeDoc({
    ...starlightTypeDocOptions,
    typeDoc: {
      ...starlightTypeDocOptions.typeDoc,
      readme: 'README.md',
    },
    entryPoints: ['../../fixtures/basics/src/Bar.ts', '../../fixtures/basics/src/Foo.ts'],
  })

  const writeFileSyncSpy = vi.mocked(fs.writeFileSync)
  const filePaths = writeFileSyncSpy.mock.calls.map((call) => call[0].toString())

  expect(filePaths.some((filePath) => filePath.endsWith('modules.md'))).toBe(true)
  expect(filePaths.some((filePath) => filePath.endsWith('README.md'))).toBe(true)
})

test('should output modules with index', async () => {
  await generateTestTypeDoc({
    ...starlightTypeDocOptions,
    typeDoc: {
      ...starlightTypeDocOptions.typeDoc,
      outputFileStrategy: 'modules',
      entryFileName: 'index.md',
    },
    entryPoints: ['../../fixtures/basics/src/module.ts'],
  })

  const writeFileSyncSpy = vi.mocked(fs.writeFileSync)
  const filePaths = writeFileSyncSpy.mock.calls.map((call) => call[0].toString())

  expect(filePaths).toEqual([
    expect.stringMatching(/index\.md$/),
    expect.stringMatching(/namespaces\/bar\.md$/),
    expect.stringMatching(/namespaces\/foo\.md$/),
    expect.stringMatching(/namespaces\/functions\.md$/),
    expect.stringMatching(/namespaces\/shared\.md$/),
    expect.stringMatching(/namespaces\/types\.md$/),
  ])
})

test('should output index with correct module path', async () => {
  await generateTestTypeDoc({
    ...starlightTypeDocOptions,
    typeDoc: {
      ...starlightTypeDocOptions.typeDoc,
      outputFileStrategy: 'modules',
      entryFileName: 'index.md',
    },
    entryPoints: ['../../fixtures/basics/src/module.ts'],
  })

  const writeFileSyncSpy = vi.mocked(fs.writeFileSync)
  const [, content] = writeFileSyncSpy.mock.calls.find((call) => call[0].toString().endsWith('index.md')) as [
    fs.PathOrFileDescriptor,
    string,
  ]

  expect(
    content.includes(`
- [bar](/api/namespaces/bar/)
- [foo](/api/namespaces/foo/)
- [functions](/api/namespaces/functions/)
- [shared](/api/namespaces/shared/)
- [types](/api/namespaces/types/)`),
  ).toBe(true)
})

function generateTestTypeDoc(
  options: Parameters<typeof generateTypeDoc>[0],
  config: Partial<AstroConfig> = starlightTypeDocAstroConfig,
) {
  return generateTypeDoc(
    {
      ...starlightTypeDocOptions,
      ...options,
    },
    config as AstroConfig,
    {
      info() {
        // noop
      },
      warn() {
        // noop
      },
    } as unknown as AstroIntegrationLogger,
  )
}
