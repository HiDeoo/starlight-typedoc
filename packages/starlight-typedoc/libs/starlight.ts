import path from 'node:path'

import type { StarlightPlugin } from '@astrojs/starlight/types'
import { slug } from 'github-slugger'
import { type DeclarationReflection, type ProjectReflection, ReflectionKind } from 'typedoc'

import type { StarlightTypeDocSidebarOptions } from '..'

const sidebarDefaultOptions = {
  collapsed: false,
  label: 'API',
} satisfies StarlightTypeDocSidebarOptions

const starlightTypeDocSidebarGroupLabel = Symbol('StarlightTypeDocSidebarGroupLabel')

export function getSidebarGroupPlaceholder(): SidebarGroup {
  return {
    items: [],
    label: starlightTypeDocSidebarGroupLabel.toString(),
  }
}

export function getSidebarFromReflections(
  sidebar: StarlightUserConfigSidebar,
  options: StarlightTypeDocSidebarOptions = {},
  reflections: ProjectReflection | DeclarationReflection,
  outputDirectory: string,
): StarlightUserConfigSidebar {
  if (!sidebar || sidebar.length === 0) {
    return sidebar
  }

  const sidebarGroup = getSidebarGroupFromReflections(options, reflections, outputDirectory)

  function replaceSidebarGroupPlaceholder(group: SidebarManualGroup): SidebarGroup {
    if (group.label === starlightTypeDocSidebarGroupLabel.toString()) {
      return sidebarGroup
    }

    if (isSidebarManualGroup(group)) {
      return {
        ...group,
        items: group.items.map((item) => {
          return isSidebarManualGroup(item) ? replaceSidebarGroupPlaceholder(item) : item
        }),
      }
    }

    return group
  }

  return sidebar.map((item) => {
    return isSidebarManualGroup(item) ? replaceSidebarGroupPlaceholder(item) : item
  })
}

function getSidebarGroupFromPackageReflections(
  options: StarlightTypeDocSidebarOptions,
  reflections: ProjectReflection | DeclarationReflection,
  outputDirectory: string,
): SidebarGroup {
  const groups = (reflections.children ?? []).map((child) => {
    if (!child.url) {
      return undefined
    }

    const url = path.parse(child.url)

    return getSidebarGroupFromReflections(options, child, `${outputDirectory}/${url.dir}`, child.name)
  })

  return {
    label: options.label ?? sidebarDefaultOptions.label,
    collapsed: options.collapsed ?? sidebarDefaultOptions.collapsed,
    items: groups.filter((item): item is SidebarGroup => item !== undefined),
  }
}

function getSidebarGroupFromReflections(
  options: StarlightTypeDocSidebarOptions,
  reflections: ProjectReflection | DeclarationReflection,
  outputDirectory: string,
  label?: string,
): SidebarGroup {
  if ((!reflections.groups || reflections.groups.length === 0) && reflections.children) {
    return getSidebarGroupFromPackageReflections(options, reflections, outputDirectory)
  }

  const groups = reflections.groups ?? []

  return {
    label: label ?? options.label ?? sidebarDefaultOptions.label,
    collapsed: options.collapsed ?? sidebarDefaultOptions.collapsed,
    items: groups
      .flatMap((group) => {
        if (group.title === 'Modules') {
          return group.children.map((child) => {
            if (!child.url) {
              return undefined
            }

            const url = path.parse(child.url)
            const isParentKindModule = child.parent?.kind === ReflectionKind.Module

            return getSidebarGroupFromReflections(
              { collapsed: true, label: child.name },
              child,
              `${outputDirectory}/${isParentKindModule ? url.dir.split('/').slice(1).join('/') : url.dir}`,
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

function isSidebarManualGroup(item: NonNullable<StarlightUserConfigSidebar>[number]): item is SidebarManualGroup {
  return 'items' in item
}

type SidebarGroup =
  | SidebarManualGroup
  | {
      autogenerate: {
        collapsed?: boolean
        directory: string
      }
      collapsed?: boolean
      label: string
    }

interface SidebarManualGroup {
  collapsed?: boolean
  items: (LinkItem | SidebarGroup)[]
  label: string
}

interface LinkItem {
  label: string
  link: string
}

type AsideType = 'caution' | 'danger' | 'note' | 'tip'

type StarlightUserConfigSidebar = Parameters<StarlightPlugin['hooks']['setup']>[0]['config']['sidebar']
