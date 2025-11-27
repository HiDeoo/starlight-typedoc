# starlight-typedoc

## 0.21.5

### Patch Changes

- [#94](https://github.com/HiDeoo/starlight-typedoc/pull/94) [`e848c07`](https://github.com/HiDeoo/starlight-typedoc/commit/e848c07cffc5f4530e99af314bdf1e848d7310a7) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes a potential error when rendering link tags in comments that reference reflections without URLs.

## 0.21.4

### Patch Changes

- [#91](https://github.com/HiDeoo/starlight-typedoc/pull/91) [`2fd0555`](https://github.com/HiDeoo/starlight-typedoc/commit/2fd0555da100d6bfb1b38b009a8517e85eb7e3b7) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Setups trusted publishing using OpenID Connect (OIDC) authentication — no code changes.

## 0.21.3

### Patch Changes

- [#85](https://github.com/HiDeoo/starlight-typedoc/pull/85) [`51d3e37`](https://github.com/HiDeoo/starlight-typedoc/commit/51d3e370a5fff417a2c104175c0ee17d4048eb66) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes a sidebar generation issue when using the [plugin `watch` configuration option](https://starlight-typedoc.vercel.app/configuration/#watch).

## 0.21.2

### Patch Changes

- [#83](https://github.com/HiDeoo/starlight-typedoc/pull/83) [`2fc1bf2`](https://github.com/HiDeoo/starlight-typedoc/commit/2fc1bf2499d226ca624e18ae235134f314b18d47) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes a regression introduced in [version `0.21.0`](https://github.com/HiDeoo/starlight-typedoc/releases/tag/starlight-typedoc%400.21.0) that prevented the development server from starting when using the [plugin `watch` configuration option](https://starlight-typedoc.vercel.app/configuration/#watch).

## 0.21.1

### Patch Changes

- [#80](https://github.com/HiDeoo/starlight-typedoc/pull/80) [`e447787`](https://github.com/HiDeoo/starlight-typedoc/commit/e4477874721b8c8482375c35587aebabb3fa8d17) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes a potential page and link generation issue with some declaration reference names such as a function named `$`.

## 0.21.0

### Minor Changes

- [#77](https://github.com/HiDeoo/starlight-typedoc/pull/77) [`751021f`](https://github.com/HiDeoo/starlight-typedoc/commit/751021f9e1029600266cc8c3bea8232e385bbbc3) Thanks [@HiDeoo](https://github.com/HiDeoo)! - ⚠️ **BREAKING CHANGE:** The minimum supported version of `typedoc` is now `0.28.0`.

  ⚠️ **BREAKING CHANGE:** The minimum supported version of `typedoc-plugin-markdown` is now `4.6.0`.

## 0.20.0

### Minor Changes

- [#74](https://github.com/HiDeoo/starlight-typedoc/pull/74) [`2765549`](https://github.com/HiDeoo/starlight-typedoc/commit/276554979760b992d204ce25106c51611f289749) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds a new [`errorOnEmptyDocumentation`](https://starlight-typedoc.vercel.app/configuration/#erroronemptydocumentation) option, defaulting to `true`, to control whether the plugin should error when no TypeDoc documentation is generated.

  Setting this option to `false` will prevent the plugin from erroring in this case which can be useful when generating documentation for multiple entry points and only some of them contain documented code at a given time.

  The current behavior remains unchanged, and the plugin will error when no TypeDoc documentation is generated if the option is not explicitly set to `false`.

## 0.19.0

### Minor Changes

- [#70](https://github.com/HiDeoo/starlight-typedoc/pull/70) [`8ffcff1`](https://github.com/HiDeoo/starlight-typedoc/commit/8ffcff196052e58913135db766a102d7c3a4fb94) Thanks [@HiDeoo](https://github.com/HiDeoo)! - ⚠️ **BREAKING CHANGE:** The minimum supported version of Starlight is now version `0.32.0`.

  Please use the `@astrojs/upgrade` command to upgrade your project:

  ```sh
  npx @astrojs/upgrade
  ```

## 0.18.0

### Minor Changes

- [#66](https://github.com/HiDeoo/starlight-typedoc/pull/66) [`c4014bc`](https://github.com/HiDeoo/starlight-typedoc/commit/c4014bc2669e2072c2a452367641f11cc621214b) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds support for Astro v5, drops support for Astro v4.

  ⚠️ **BREAKING CHANGE:** The minimum supported version of Starlight is now `0.30.0`.

  Please follow the [upgrade guide](https://github.com/withastro/starlight/releases/tag/%40astrojs/starlight%400.30.0) to update your project.
