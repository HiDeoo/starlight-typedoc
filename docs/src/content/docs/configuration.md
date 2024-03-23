---
title: Configuration
description: An overview of all the configuration options supported by the Starlight TypeDoc plugin.
---

The Starlight TypeDoc plugin can be configured inside the `astro.config.mjs` configuration file of your project:

```js {11}
// astro.config.mjs
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc'

export default defineConfig({
  integrations: [
    starlight({
      plugins: [
        starlightTypeDoc({
          // Configuration options go here.
        }),
      ],
      title: 'My Docs',
    }),
  ],
})
```

## Configuration options

You can pass the following options to the Starlight TypeDoc plugin.

### `entryPoints` (required)

**Type:** `string[]`

The path(s) to the entry point(s) to document.

### `tsconfig` (required)

**Type:** `string`

The path to the `tsconfig.json` file to use for the documentation generation.

### `output`

**Type:** `string`  
**Default:** `'api'`

The output directory containing the generated documentation markdown files relative to the `src/content/docs/` directory.

### `pagination`

**Type:** `boolean`  
**Default:** `false`

Whether the footer should include previous and next page links for the generated documentation.

### `sidebar`

**Type:** [`StarlightTypeDocSidebarOptions`](#sidebar-configuration)

The generated documentation [sidebar configuration](#sidebar-configuration).

### `typeDoc`

**Type:** `TypeDocConfig`

Additional [TypeDoc](https://typedoc.org/options) or [typedoc-plugin-markdown](https://github.com/tgreyuk/typedoc-plugin-markdown/blob/next/packages/typedoc-plugin-markdown/docs/usage/options.md) configuration to override the [default settings](https://github.com/HiDeoo/starlight-typedoc/blob/main/packages/starlight-typedoc/libs/typedoc.ts#L21-L28) used by the plugin.

:::note
When using TypeDoc [`packages`](https://typedoc.org/options/input/#packages) entry point strategy, all entry points should be directories that may contain their own TypeDoc configuration.
As documented in the [TypeDoc documentation](https://typedoc.org/options/input/#packages), the root configuration provided by this plugin will not be copied or merged with the entry point configuration.
:::

### `watch`

**Type:** `boolean`  
**Default:** `false`

Whether to watch the entry point(s) for changes and regenerate the documentation when needed.

## Sidebar configuration

The sidebar configuration is an object with the following properties:

### `collapsed`

**Type:** `boolean`  
**Default:** `false`

Wheter the generated documentation sidebar group should be collapsed by default.
Note that nested sidebar groups are always collapsed.

### `label`

**Type:** `string`  
**Default:** `'API'`

The generated documentation sidebar group label.
