---
'starlight-typedoc': minor
---

Adds a new [`errorOnEmptyDocumentation`](https://starlight-typedoc.vercel.app/configuration/#erroronemptydocumentation) option, defaulting to `true`, to control whether the plugin should error when no TypeDoc documentation is generated.

Setting this option to `false` will prevent the plugin from erroring in this case which can be useful when generating documentation for multiple entry points and only some of them contain documented code at a given time.

The current behavior remains unchanged, and the plugin will error when no TypeDoc documentation is generated if the option is not explicitly set to `false`.
