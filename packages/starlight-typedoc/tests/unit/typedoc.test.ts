import fs from 'node:fs'

import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest'

import { generateTypeDoc, type StarlightTypeDocOptions } from '../../src'

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
    generateTypeDoc({
      ...starlightTypeDocOptions,
      entryPoints: ['../../fixtures/src/noExports.ts'],
    })
  ).rejects.toThrowErrorMatchingInlineSnapshot('"Failed to generate TypeDoc documentation."')
})

test('should support providing custom TypeDoc options', async () => {
  const options = {
    ...starlightTypeDocOptions,
    entryPoints: ['../../fixtures/src/noDocs.ts'],
  }

  await expect(generateTypeDoc(options)).resolves.not.toThrow()

  await expect(
    generateTypeDoc({
      ...options,
      typeDoc: {
        ...starlightTypeDocOptions.typeDoc,
        excludeNotDocumented: true,
      },
    })
  ).rejects.toThrowErrorMatchingInlineSnapshot('"Failed to generate TypeDoc documentation."')
})

test('should generate the doc in `src/content/docs/api` by default', async () => {
  await generateTypeDoc({
    ...starlightTypeDocOptions,
    entryPoints: ['../../fixtures/src/functions.ts'],
  })

  const mkdirSyncSpy = vi.mocked(fs.mkdirSync)

  expect(mkdirSyncSpy).toHaveBeenCalled()
  expect(mkdirSyncSpy.mock.calls[0]?.[0].toString().endsWith(`src/content/docs/api`)).toBe(true)
})

test('should generate the doc in a custom output directory relative to `src/content/docs/`', async () => {
  const output = 'dist-api'

  await generateTypeDoc({
    ...starlightTypeDocOptions,
    entryPoints: ['../../fixtures/src/functions.ts'],
    output,
  })

  const mkdirSyncSpy = vi.mocked(fs.mkdirSync)

  expect(mkdirSyncSpy).toHaveBeenCalled()
  expect(mkdirSyncSpy.mock.calls[0]?.[0].toString().endsWith(`src/content/docs/${output}`)).toBe(true)
})

test('should not add `README.md` module files for multiple entry points', async () => {
  await generateTypeDoc({
    ...starlightTypeDocOptions,
    entryPoints: ['../../fixtures/src/Bar.ts', '../../fixtures/src/Foo.ts'],
  })

  const writeFileSyncSpy = vi.mocked(fs.writeFileSync)
  const filePaths = writeFileSyncSpy.mock.calls.map((call) => call[0].toString())

  expect(writeFileSyncSpy).toHaveBeenCalled()
  expect(filePaths.some((filePath) => filePath.endsWith('README.md'))).toBe(false)
})

test('should support overriding typedoc-plugin-markdown readme and index page generation', async () => {
  await generateTypeDoc({
    ...starlightTypeDocOptions,
    typeDoc: {
      ...starlightTypeDocOptions.typeDoc,
      readme: 'README.md',
      skipIndexPage: false,
    },
    entryPoints: ['../../fixtures/src/Bar.ts', '../../fixtures/src/Foo.ts'],
  })

  const writeFileSyncSpy = vi.mocked(fs.writeFileSync)
  const filePaths = writeFileSyncSpy.mock.calls.map((call) => call[0].toString())

  expect(filePaths.some((filePath) => filePath.endsWith('API.md'))).toBe(true)
  expect(filePaths.some((filePath) => filePath.endsWith('README.md'))).toBe(true)
})

test('should output modules with index', async () => {
  await generateTypeDoc({
    ...starlightTypeDocOptions,
    typeDoc: {
      ...starlightTypeDocOptions.typeDoc,
      outputFileStrategy: 'modules',
      entryFileName: 'index.md',
      skipIndexPage: false,
      flattenOutputFiles: true,
    },
    entryPoints: ['../../fixtures/src/module.ts'],
  })

  const writeFileSyncSpy = vi.mocked(fs.writeFileSync)
  const filePaths = writeFileSyncSpy.mock.calls.map((call) => call[0].toString())

  expect(filePaths).toEqual([
    expect.stringMatching(/index\.md$/),
    expect.stringMatching(/Namespace\.bar\.md$/),
    expect.stringMatching(/Namespace\.foo\.md$/),
    expect.stringMatching(/Namespace\.functions\.md$/),
    expect.stringMatching(/Namespace\.shared\.md$/),
    expect.stringMatching(/Namespace\.types\.md$/),
  ])
})

test('should output index with correct module path', async () => {
  await generateTypeDoc({
    ...starlightTypeDocOptions,
    typeDoc: {
      ...starlightTypeDocOptions.typeDoc,
      outputFileStrategy: 'modules',
      entryFileName: 'index.md',
      skipIndexPage: false,
      flattenOutputFiles: true,
    },
    entryPoints: ['../../fixtures/src/module.ts'],
  })

  const writeFileSyncSpy = vi.mocked(fs.writeFileSync)
  const [, content] = writeFileSyncSpy.mock.calls.find((call) => call[0].toString().endsWith('index.md')) as [
    fs.PathOrFileDescriptor,
    string
  ]

  expect(
    content.includes(`
- [bar](/api/namespacebar/)
- [foo](/api/namespacefoo/)
- [functions](/api/namespacefunctions/)
- [shared](/api/namespaceshared/)
- [types](/api/namespacetypes/)`)
  ).toBe(true)
})
