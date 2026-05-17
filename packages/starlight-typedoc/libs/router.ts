import path from 'node:path'

import { ReflectionKind, type Reflection } from 'typedoc'
import { MemberRouter, ModuleRouter } from 'typedoc-plugin-markdown'

// When `entryFileName` is `index.md`, a module literally named `index`
// (e.g. from `src/index.ts` with `entryPoints: ["src/*"]`) would generate
// `<pkg>/index/index.md` and collide with `<pkg>/index.md` once Starlight
// routes both to the same URL — the child silently wins and the package
// README disappears. Renaming the module's folder breaks the collision while
// keeping its file as `index.md`.
const RENAMED_INDEX_SEGMENT = '_index_'

function renameIfIndexModule(
  alias: string,
  reflection: Reflection,
  entryFileName: string,
): string {
  if (
    reflection.kind === ReflectionKind.Module &&
    alias === path.parse(entryFileName).name
  ) {
    return RENAMED_INDEX_SEGMENT
  }
  return alias
}

export class StarlightTypeDocMemberRouter extends MemberRouter {
  override getReflectionAlias(reflection: Reflection): string {
    return renameIfIndexModule(super.getReflectionAlias(reflection), reflection, this.entryFileName)
  }
}

export class StarlightTypeDocModuleRouter extends ModuleRouter {
  override getReflectionAlias(reflection: Reflection): string {
    return renameIfIndexModule(super.getReflectionAlias(reflection), reflection, this.entryFileName)
  }
}
