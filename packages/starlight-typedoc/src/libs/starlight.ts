import path from 'node:path'

import { slug } from 'github-slugger'
import type { DeclarationReflection, ProjectReflection } from 'typedoc'

import type { StarlightTypeDocSidebarOptions } from '..'

const sidebarDefaultOptions = {
  collapsed: false,
  label: 'API',
} satisfies StarlightTypeDocSidebarOptions

export function getSidebarGroupFromReflections(
  options: StarlightTypeDocSidebarOptions = {},
  reflections: ProjectReflection | DeclarationReflection,
  outputDirectory: string
): SidebarGroup {
  const groups = reflections.groups ?? []

  return {
    label: options.label ?? sidebarDefaultOptions.label,
    collapsed: options.collapsed ?? sidebarDefaultOptions.collapsed,
    items: groups
      .flatMap((group) => {
        if (group.title === 'Modules') {
          return group.children.map((child) => {
            if (!child.url) {
              return undefined
            }

            const url = path.parse(child.url)

            return getSidebarGroupFromReflections(
              { collapsed: true, label: child.name },
              child,
              `${outputDirectory}/${url.dir}`
            )
          })
        }

        return {
          collapsed: true,
          label: group.title,
          autogenerate: {
            collapsed: true,
            directory: `${outputDirectory}/${slug(group.title.toLowerCase())}`,
          },
        }
      })
      .filter((item): item is SidebarGroup => item !== undefined),
  }
}

export function getAsideMarkdown(type: AsideType, title: string, content: string) {
  return `:::${type}[${title}]
${content}
:::`
}

export type SidebarGroup =
  | {
      collapsed?: boolean
      items: (LinkItem | SidebarGroup)[]
      label: string
    }
  | {
      autogenerate: {
        collapsed?: boolean
        directory: string
      }
      collapsed?: boolean
      label: string
    }

interface LinkItem {
  label: string
  link: string
}

type AsideType = 'caution' | 'danger' | 'note' | 'tip'
