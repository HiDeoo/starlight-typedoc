import path from 'node:path'

import type { HookParameters } from '@astrojs/starlight/types'
import { slug } from 'github-slugger'
import {
  type DeclarationReflection,
  type ProjectReflection,
  ReflectionKind,
  ReferenceReflection,
  type ReflectionGroup,
} from 'typedoc'

import type { StarlightTypeDocSidebarOptions } from '..'

const externalLinkRegex = /^(http|ftp)s?:\/\//

const sidebarDefaultOptions = {
  collapsed: false,
  label: 'API',
} satisfies StarlightTypeDocSidebarOptions

const starlightTypeDocSidebarGroupLabel = Symbol('StarlightTypeDocSidebarGroupLabel')

export function getSidebarGroupPlaceholder(label = starlightTypeDocSidebarGroupLabel): SidebarGroup {
  return {
    items: [],
    label: label.toString(),
  }
}

export function getSidebarFromReflections(
  sidebar: StarlightUserConfigSidebar,
  sidebarGroupPlaceholder: SidebarGroup,
  options: StarlightTypeDocSidebarOptions = {},
  reflections: ProjectReflection | DeclarationReflection,
  baseOutputDirectory: string,
): StarlightUserConfigSidebar {
  if (!sidebar || sidebar.length === 0) {
    return sidebar
  }

  const sidebarGroup = getSidebarGroupFromReflections(options, reflections, baseOutputDirectory, baseOutputDirectory)

  function replaceSidebarGroupPlaceholder(group: SidebarManualGroup): SidebarGroup {
    if (group.label === sidebarGroupPlaceholder.label) {
      return group.badge ? { ...sidebarGroup, badge: group.badge } : sidebarGroup
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

export function getSidebarWithoutReflections(
  sidebar: StarlightUserConfigSidebar,
  sidebarGroupPlaceholder: SidebarGroup,
): StarlightUserConfigSidebar {
  if (!sidebar || sidebar.length === 0) {
    return sidebar
  }

  function removeSidebarGroupPlaceholder(
    entries: NonNullable<StarlightUserConfigSidebar>,
  ): NonNullable<StarlightUserConfigSidebar> {
    const sidebarWithoutPlaceholder: StarlightUserConfigSidebar = []

    for (const item of entries) {
      if (isSidebarManualGroup(item)) {
        if (item.label === sidebarGroupPlaceholder.label) continue

        sidebarWithoutPlaceholder.push({
          ...item,
          items: removeSidebarGroupPlaceholder(item.items),
        })
        continue
      }

      sidebarWithoutPlaceholder.push(item)
    }

    return sidebarWithoutPlaceholder
  }

  return removeSidebarGroupPlaceholder(sidebar)
}

function getSidebarGroupFromPackageReflections(
  options: StarlightTypeDocSidebarOptions,
  reflections: ProjectReflection | DeclarationReflection,
  baseOutputDirectory: string,
): SidebarGroup {
  const groups = (reflections.children ?? []).map((child) => {
    if (!child.url) {
      return undefined
    }

    const url = path.parse(child.url)

    return getSidebarGroupFromReflections(
      options,
      child,
      baseOutputDirectory,
      `${baseOutputDirectory}/${url.dir}`,
      child.name,
    )
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
  baseOutputDirectory: string,
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
            if (!child.url || child.variant === 'document') {
              return undefined
            }

            const url = path.parse(child.url)
            const isParentKindModule = child.parent?.kind === ReflectionKind.Module

            return getSidebarGroupFromReflections(
              { collapsed: true, label: child.name },
              child,
              baseOutputDirectory,
              `${outputDirectory}/${isParentKindModule ? url.dir.split('/').slice(1).join('/') : url.dir}`,
            )
          })
        }

        if (isReferenceReflectionGroup(group)) {
          return getReferencesSidebarGroup(group, baseOutputDirectory)
        }

        const directory = `${outputDirectory}/${slug(group.title.toLowerCase())}`

        // The groups generated using the `@group` tag do not have an associated directory on disk.
        const isGroupWithDirectory = group.children.some((child) =>
          path.posix.join(baseOutputDirectory, child.url?.replace('\\', '/') ?? '').startsWith(directory),
        )

        if (!isGroupWithDirectory) {
          return undefined
        }

        return {
          collapsed: true,
          label: group.title,
          autogenerate: {
            collapsed: true,
            directory,
          },
        }
      })
      .filter((item): item is SidebarGroup => item !== undefined),
  }
}

function getReferencesSidebarGroup(
  group: ReflectionGroup,
  baseOutputDirectory: string,
): SidebarManualGroup | undefined {
  const referenceItems: LinkItem[] = group.children
    .map((child) => {
      const reference = child as ReferenceReflection
      let target = reference.tryGetTargetReflectionDeep()

      if (!target) {
        return undefined
      }

      if (target.kindOf(ReflectionKind.TypeLiteral) && target.parent) {
        target = target.parent
      }

      if (!target.url) {
        return undefined
      }

      return {
        label: reference.name,
        link: getRelativeURL(target.url, getStarlightTypeDocOutputDirectory(baseOutputDirectory)),
      }
    })
    .filter((item): item is LinkItem => item !== undefined)

  if (referenceItems.length === 0) {
    return undefined
  }

  return {
    label: group.title,
    items: referenceItems,
  }
}

export function getAsideMarkdown(type: AsideType, title: string, content: string) {
  return `:::${type}[${title}]
${content}
:::`
}

export function getRelativeURL(url: string, baseUrl: string, pageUrl?: string): string {
  if (externalLinkRegex.test(url)) {
    return url
  }

  const currentDirname = path.dirname(pageUrl ?? '')
  const urlDirname = path.dirname(url)
  const relativeUrl =
    currentDirname === urlDirname ? url : path.posix.join(currentDirname, path.posix.relative(currentDirname, url))

  const filePath = path.parse(relativeUrl)
  const [, anchor] = filePath.base.split('#')
  const segments = filePath.dir
    .split(/[/\\]/)
    .map((segment) => slug(segment))
    .filter((segment) => segment !== '')

  let constructedUrl = typeof baseUrl === 'string' ? baseUrl : ''
  constructedUrl += segments.length > 0 ? `${segments.join('/')}/` : ''
  constructedUrl += slug(filePath.name)
  constructedUrl += '/'
  constructedUrl += anchor && anchor.length > 0 ? `#${anchor}` : ''

  return constructedUrl
}

export function getStarlightTypeDocOutputDirectory(outputDirectory: string, base = '') {
  return path.posix.join(base, `/${outputDirectory}${outputDirectory.endsWith('/') ? '' : '/'}`)
}

function isSidebarManualGroup(item: NonNullable<StarlightUserConfigSidebar>[number]): item is SidebarManualGroup {
  return typeof item === 'object' && 'items' in item
}

function isReferenceReflectionGroup(group: ReflectionGroup) {
  return group.children.every((child) => child instanceof ReferenceReflection)
}

export type SidebarGroup =
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
  badge?:
    | string
    | {
        text: string
        variant: 'note' | 'danger' | 'success' | 'caution' | 'tip' | 'default'
      }
    | undefined
}

interface LinkItem {
  label: string
  link: string
}

type AsideType = 'caution' | 'danger' | 'note' | 'tip'

type StarlightUserConfigSidebar = HookParameters<'config:setup'>['config']['sidebar']
