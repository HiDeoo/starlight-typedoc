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

test('should generate the doc in `src/content/docs/api`', async () => {
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
