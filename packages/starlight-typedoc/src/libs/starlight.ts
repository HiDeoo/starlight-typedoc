import path from 'node:path'

import { slug } from 'github-slugger'
import type { DeclarationReflection, ProjectReflection } from 'typedoc'

// TODO(HiDeoo) Extra readme with multiple entry points
export function getSidebarGroupFromReflections(
  label = 'API',
  reflections: ProjectReflection | DeclarationReflection,
  outputDirectory: string
): SidebarGroup {
  const groups = reflections.groups ?? []

  return {
    label,
    items: groups
      .flatMap((group) => {
        // TODO(HiDeoo) Better test with kind or instanceof
        if (group.title === 'Modules') {
          return group.children.map((child) => {
            if (!child.url) {
              return undefined
            }

            const url = path.parse(child.url)

            // TODO(HiDeoo) Better name? Can be renamed through doc?
            return getSidebarGroupFromReflections(child.name, child, `${outputDirectory}/${slug(url.dir)}`)
          })
        }

        return {
          label: group.title,
          autogenerate: { directory: `${outputDirectory}/${group.title.toLowerCase()}` },
        }
      })
      .filter((item): item is SidebarGroup => item !== undefined),
  }
}

type SidebarGroup =
  | {
      items: (LinkItem | SidebarGroup)[]
      label: string
    }
  | {
      autogenerate: {
        directory: string
      }
      label: string
    }

interface LinkItem {
  label: string
  link: string
}
