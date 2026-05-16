# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands should be run from the repo root unless noted otherwise.

```bash
# Lint (Astro type check + ESLint across workspaces)
pnpm lint

# Format
pnpm format

# Unit tests (from packages/starlight-typedoc)
cd packages/starlight-typedoc && pnpm test:unit

# Run a single unit test file
cd packages/starlight-typedoc && pnpm test:unit tests/unit/typedoc.test.ts

# E2E tests (three suites)
cd packages/starlight-typedoc && pnpm test:e2e:basics
cd packages/starlight-typedoc && pnpm test:e2e:packages
cd packages/starlight-typedoc && pnpm test:e2e:plugins

# All E2E suites at once
cd packages/starlight-typedoc && pnpm test:e2e

# CI variant (skips Playwright browser install)
cd packages/starlight-typedoc && pnpm test:e2e:ci
```

## Architecture

`starlight-typedoc` is a [Starlight](https://starlight.astro.build) plugin that generates API documentation from TypeScript source using TypeDoc and `typedoc-plugin-markdown`. The output is a set of Markdown files plus a Starlight sidebar configuration.

**Monorepo layout (pnpm workspaces):**
- `packages/starlight-typedoc/` — the published plugin
- `docs/` — plugin documentation site (Astro/Starlight)
- `example/` — multi-config reference app used by E2E tests
- `fixtures/` — TypeScript source fixtures (basics, packages) consumed by tests

### Plugin source (`packages/starlight-typedoc/`)

**`index.ts`** — Public entry point. Exports `starlightTypeDocPlugin()` (the normal integration) and `createStarlightTypeDocPlugin()` (for multi-instance setups). Hooks into Astro's `config:setup` lifecycle, calls `generateTypeDoc`, then wires the resulting sidebar entries and virtual modules into Starlight's config.

**`libs/typedoc.ts`** — Orchestrates TypeDoc. Bootstraps a TypeDoc `Application` with `typedoc-plugin-markdown`, attaches the custom theme and logger, renders pages by hooking `renderer.on(BEGIN/END)` to inject Starlight-compatible frontmatter, and returns the resolved reflections + output path.

**`libs/starlight.ts`** — Converts TypeDoc `ProjectReflection` / module reflections into a Starlight sidebar tree (`SidebarManualGroup`). Handles single entry point, multiple entry points, and package-mode entry points. Uses `github-slugger` for URL slug generation.

**`libs/theme.ts`** — Custom `MarkdownTheme` subclass for `typedoc-plugin-markdown`. Translates TypeDoc comment tags (`@alpha`, `@beta`, `@deprecated`, `@experimental`) into Starlight asides, and handles `@link`/`@linkcode`/`@linkplain` inline tags.

**`libs/logger.ts`** — Bridges TypeDoc's logger interface to Astro's `AstroIntegrationLogger`.

**`libs/markdown.ts`** — Small helper that prepends YAML frontmatter to a Markdown string.

### Test setup

Unit tests (Vitest) live in `tests/unit/` and test individual lib functions in isolation. E2E tests (Playwright) live in `tests/e2e/` and drive actual Astro builds against the `example/` app, using the `TEST_TYPE` env var (`basics` | `packages` | `plugins`) to select which configuration to build and test.
