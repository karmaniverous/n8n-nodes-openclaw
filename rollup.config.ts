import { createRequire } from 'node:module';

import aliasPlugin, { type Alias } from '@rollup/plugin-alias';
import commonjsPlugin from '@rollup/plugin-commonjs';
import jsonPlugin from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terserPlugin from '@rollup/plugin-terser';
import typescriptPlugin from '@rollup/plugin-typescript';
import fs from 'fs-extra';
import type { InputOptions, OutputOptions, RollupOptions } from 'rollup';
import dtsPlugin from 'rollup-plugin-dts';

const require = createRequire(import.meta.url);
type Package = Record<string, Record<string, string> | undefined>;
const pkg = require('./package.json') as Package;

import { packageName } from './src/util/packageName';

const outputPath = `dist`;

// Rollup writes bundle outputs; the TS plugin should only transpile.
// - outputToFilesystem=false avoids outDir/dir validation errors for multi-output builds.
// - incremental=false avoids TS build-info state referencing transient Rollup config artifacts.
const typescript = typescriptPlugin({
  tsconfig: './tsconfig.json',
  outputToFilesystem: false,
  // Only compile bundled sources; prevents transient Rollup config artifacts
  // (e.g. rollup.config-*.mjs) from being pulled into the TS program.
  include: ['src/**/*.ts'],
  exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],

  // Override repo tsconfig settings for bundling.
  noEmit: false,
  declaration: false,
  declarationMap: false,
  incremental: false,
  allowJs: false,
  checkJs: false,
});

const commonPlugins = [
  commonjsPlugin(),
  jsonPlugin(),
  nodeResolve(),
  typescript,
];

const commonAliases: Alias[] = [];

/**
 * Common input options for library builds (ESM + CJS).
 * Externalize runtime dependencies and peers.
 */
const commonInputOptions: InputOptions = {
  input: 'src/index.ts',
  external: [
    ...Object.keys((pkg as unknown as Package).dependencies ?? {}),
    ...Object.keys((pkg as unknown as Package).peerDependencies ?? {}),
    'tslib',
  ],
  plugins: [aliasPlugin({ entries: commonAliases }), ...commonPlugins],
};

const iifeCommonOutputOptions: OutputOptions = {
  name: packageName ?? 'unknown',
};

/** Discover CLI commands under src/cli. */
const cliCommands = (await fs.readdir('src/cli').catch(() => [])) as string[];

/**
 * Build the library (ESM + CJS).
 */
export const buildLibrary = (dest: string): RollupOptions => ({
  ...commonInputOptions,
  output: [
    {
      dir: `${dest}/mjs`,
      extend: true,
      format: 'esm',
    },
    {
      dir: `${dest}/cjs`,
      extend: true,
      format: 'cjs',
    },
  ],
});

/**
 * Build bundled .d.ts at dest/index.d.ts.
 */
export const buildTypes = (dest: string): RollupOptions => ({
  input: 'src/index.ts',
  output: [{ file: `${dest}/index.d.ts`, format: 'esm' }],
  plugins: [dtsPlugin()],
});

/** Assemble complete config including IIFE and CLI outputs. */
const config: RollupOptions[] = [
  // Library output (ESM + CJS)
  buildLibrary(outputPath),

  // IIFE output (and minified IIFE)
  {
    ...commonInputOptions,
    output: [
      {
        ...iifeCommonOutputOptions,
        extend: true,
        file: `${outputPath}/index.iife.js`,
        format: 'iife',
      },
      {
        ...iifeCommonOutputOptions,
        extend: true,
        file: `${outputPath}/index.iife.min.js`,
        format: 'iife',
        plugins: [terserPlugin()],
      },
    ],
  },

  // Type definitions output (single .d.ts)
  buildTypes(outputPath),

  // CLI output.
  ...cliCommands.map<RollupOptions>((c) => ({
    ...commonInputOptions,
    input: `src/cli/${c}/index.ts`,
    output: [
      {
        dir: `${outputPath}/cli/${c}`,
        extend: true,
        format: 'esm',
        banner: '#!/usr/bin/env node',
      },
    ],
  })),
];

export default config;
