---
title: Multiple Instances
description: Learn how to use multiple instances of the Starlight TypeDoc plugin.
---

By default, the Starlight TypeDoc plugin generates documentation for one or multiple [entry points](/configuration/#entrypoints-required) using the same plugin or TypeDoc configuration.

Sometimes, you may want to generate documentation for different entry points using different configurations.
To achieve this, the Starlight TypeDoc plugin exposes a `createStarlightTypeDocPlugin()` function that allows you to create multiple instances of the plugin.

## `createStarlightTypeDocPlugin()`

Calling the `createStarlightTypeDocPlugin()` function returns an array with exactly two values:

1. A new Starlight TypeDoc plugin instance that you can add to your Starlight configuration.
1. A reference to the generated sidebar group for that instance that you can add to your sidebar.

The following example creates two Starlight TypeDoc plugin instances for two different entry points: one for a public API and another for an admin API.
The associated sidebar groups are then added to the sidebar:

```js {6-7}
// astro.config.mjs
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { createStarlightTypeDocPlugin } from 'starlight-typedoc'

const [publicStarlightTypeDoc, publicTypeDocSidebarGroup] = createStarlightTypeDocPlugin()
const [adminStarlightTypeDoc, adminTypeDocSidebarGroup] = createStarlightTypeDocPlugin()

export default defineConfig({
  integrations: [
    starlight({
      plugins: [
        // Generate the documentation for the public API.
        publicStarlightTypeDoc({
          entryPoints: ['../path/to/public/entry-point.ts'],
          output: 'api-public',
          tsconfig: '../path/to/public/tsconfig.json',
        }),
        // Generate the documentation for the admin API.
        adminStarlightTypeDoc({
          entryPoints: ['../path/to/admin/entry-point.ts'],
          output: 'api-admin',
          tsconfig: '../path/to/admin/tsconfig.json',
        }),
      ],
      sidebar: [
        {
          label: 'User Guide',
          // Add the generated public sidebar group to the sidebar.
          items: [publicTypeDocSidebarGroup],
        },
        {
          label: 'Admin Guide',
          // Add the generated admin sidebar group to the sidebar.
          items: [adminTypeDocSidebarGroup],
        },
      ],
      title: 'My Docs',
    }),
  ],
})
```
