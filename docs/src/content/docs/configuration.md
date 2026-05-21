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

This option can also be specified in a TypeDoc [options file](https://typedoc.org/documents/Options.Configuration.html#options) located at the root of the project (e.g. `typedoc.json` or `typedoc.mjs`).

### `tsconfig` (required)

**Type:** `string`

The path to the `tsconfig.json` file to use for the documentation generation.

This option can also be specified in a TypeDoc [options file](https://typedoc.org/documents/Options.Configuration.html#options) located at the root of the project (e.g. `typedoc.json` or `typedoc.mjs`).

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

Additional [TypeDoc](https://typedoc.org/documents/Options.html) or [typedoc-plugin-markdown](https://typedoc-plugin-markdown.org/docs/options#plugin-options) configuration to override the [default settings](https://github.com/HiDeoo/starlight-typedoc/blob/main/packages/starlight-typedoc/libs/typedoc.ts#L30-L43) used by the plugin.

These options can also be specified in a TypeDoc [options file](https://typedoc.org/documents/Options.Configuration.html#options) located at the root of the project (e.g. `typedoc.json` or `typedoc.mjs`).

:::note
When using TypeDoc [`packages`](https://typedoc.org/documents/Options.Input.html#packages) entry point strategy, all entry points should be directories that may contain their own TypeDoc configuration.
As documented in the [TypeDoc documentation](https://typedoc.org/documents/Options.Input.html#packages), the root configuration provided by this plugin will not be copied or merged with the entry point configuration.
:::

### `watch`

**Type:** `boolean`  
**Default:** `false`

Whether to watch the entry point(s) for changes and regenerate the documentation when needed.

### `errorOnEmptyDocumentation`

**Type:** `boolean`  
**Default:** `true`

Whether the plugin should error when no TypeDoc documentation is generated.

By default, the plugin will error when no TypeDoc documentation is generated.
Setting this option to `false` will prevent the plugin from erroring in this case.
This can be useful when generating documentation for multiple entry points and only some of them contain documented code at a given time.

## Sidebar configuration

The sidebar configuration is an object with the following properties:

### `collapsed`

**Type:** `boolean`  
**Default:** `false`

Whether the generated documentation sidebar group should be collapsed by default.
Note that nested sidebar groups are always collapsed.

### `label`

**Type:** `string`  
**Default:** `'API'`

The generated documentation sidebar group label.

### `readmeLabel`

**Type:** `string`  
**Default:** `'Overview'`

The label used for generated readme links in the sidebar when the [TypeDoc `readme` option](https://typedoc.org/documents/Options.Input.html#readme) is configured.
