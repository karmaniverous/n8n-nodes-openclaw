# Project Requirements (npm-package-template-ts)

When updated: 2025-08-29T18:15:00Z

Bundling (Rollup)
- Library outputs:
  - ESM at dist/mjs/index.js
  - CJS at dist/cjs/index.js
  - Types bundled at dist/index.d.ts
- Additional outputs:
  - Browser IIFE at dist/index.iife.js (and a minified variant)
  - CLI commands built from src/cli/<command>/index.ts into dist/cli/<command>/index.js
    with a shebang banner (#!/usr/bin/env node).
- Externalization:
  - Treat Node built-ins and all runtime dependencies/peerDependencies as external.
- Plugins:
  - Keep the library build minimal (TypeScript for transpile; rollup-plugin-dts for types).
  - IIFE/CLI builds may use commonjs/json/node-resolve where helpful.
- Rollup config contract:
  - rollup.config.ts MUST export:
    • buildLibrary(dest): RollupOptions
    • buildTypes(dest): RollupOptions
  - stan.rollup.config.ts consumes these for the STAN dev build.

ESLint

- Use a TypeScript flat config at eslint.config.ts.
- Lint uses @typescript-eslint strictTypeChecked config, Prettier alignment,
  simple-import-sort, and tsdoc syntax checks.
- Exclude STAN dev build artifacts from lint: ignore ".stan/**/*".

TypeScript configs

- No separate tsconfig.rollup.json is required at this time; the Rollup TypeScript plugin overrides conflicting compiler options for bundling (noEmit=false, declaration=false, etc.).