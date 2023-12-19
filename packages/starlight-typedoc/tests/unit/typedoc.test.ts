import fs from 'node:fs'

import type { AstroIntegrationLogger } from 'astro'
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest'

import type { StarlightTypeDocOptions } from '../..'
import { generateTypeDoc } from '../../libs/typedoc'

const starlightTypeDocOptions = {
  tsconfig: '../../fixtures/tsconfig.json',
  typeDoc: {
    logLevel: 4,
  },
} satisfies Partial<StarlightTypeDocOptions>

beforeAll(() => {
  vi.spyOn(fs, 'mkdirSync').mockReturnValue(undefined)
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
      entryPoints: ['../../fixtures/src/noExports.ts'],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Failed to generate TypeDoc documentation.]`)
})

test('should support providing custom TypeDoc options', async () => {
  const options = {
    ...starlightTypeDocOptions,
    entryPoints: ['../../fixtures/src/noDocs.ts'],
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
    entryPoints: ['../../fixtures/src/functions.ts'],
  })

  const mkdirSyncSpy = vi.mocked(fs.mkdirSync)

  expect(mkdirSyncSpy).toHaveBeenCalled()
  expect(mkdirSyncSpy.mock.calls[0]?.[0].toString().endsWith(`src/content/docs/api`)).toBe(true)
})

test('should generate the doc in a custom output directory relative to `src/content/docs/`', async () => {
  const output = 'dist-api'

  await generateTestTypeDoc({
    ...starlightTypeDocOptions,
    entryPoints: ['../../fixtures/src/functions.ts'],
    output,
  })

  const mkdirSyncSpy = vi.mocked(fs.mkdirSync)

  expect(mkdirSyncSpy).toHaveBeenCalled()
  expect(mkdirSyncSpy.mock.calls[0]?.[0].toString().endsWith(`src/content/docs/${output}`)).toBe(true)
})

test('should not add `README.md` module files for multiple entry points', async () => {
  await generateTestTypeDoc({
    ...starlightTypeDocOptions,
    entryPoints: ['../../fixtures/src/Bar.ts', '../../fixtures/src/Foo.ts'],
  })

  const writeFileSyncSpy = vi.mocked(fs.writeFileSync)
  const filePaths = writeFileSyncSpy.mock.calls.map((call) => call[0].toString())

  expect(writeFileSyncSpy).toHaveBeenCalled()
  expect(filePaths.some((filePath) => /\/(?:Bar|Foo)\/README\.md$/.test(filePath))).toBe(false)
})

test('should support overriding typedoc-plugin-markdown readme and index page generation', async () => {
  await generateTestTypeDoc({
    ...starlightTypeDocOptions,
    typeDoc: {
      ...starlightTypeDocOptions.typeDoc,
      readme: 'README.md',
    },
    entryPoints: ['../../fixtures/src/Bar.ts', '../../fixtures/src/Foo.ts'],
  })

  const writeFileSyncSpy = vi.mocked(fs.writeFileSync)
  const filePaths = writeFileSyncSpy.mock.calls.map((call) => call[0].toString())

  expect(filePaths.some((filePath) => filePath.endsWith('API.md'))).toBe(true)
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
    entryPoints: ['../../fixtures/src/module.ts'],
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
    entryPoints: ['../../fixtures/src/module.ts'],
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

function generateTestTypeDoc(options: Parameters<typeof generateTypeDoc>[0]) {
  return generateTypeDoc(
    {
      ...starlightTypeDocOptions,
      ...options,
    },
    '/',
    {
      info() {
        // noop
      },
    } as unknown as AstroIntegrationLogger,
  )
}
