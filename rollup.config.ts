import { createRequire } from 'node:module';

import aliasPlugin, { type Alias } from '@rollup/plugin-alias';
import commonjsPlugin from '@rollup/plugin-commonjs';
import jsonPlugin from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescriptPlugin from '@rollup/plugin-typescript';
import type { InputOptions, RollupOptions } from 'rollup';
import copyPlugin from 'rollup-plugin-copy';
import dtsPlugin from 'rollup-plugin-dts';

const require = createRequire(import.meta.url);
type Package = Record<string, Record<string, string> | undefined>;
const pkg = require('./package.json') as Package;

const outputPath = `dist`;

// Rollup writes bundle outputs; the TS plugin should only transpile.
const typescript = typescriptPlugin({
  tsconfig: './tsconfig.json',
  outputToFilesystem: false,
  include: ['src/**/*.ts'],
  exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
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
 * Common input options for library builds.
 * Externalize runtime dependencies and peers.
 */
const commonInputOptions: InputOptions = {
  input: {
    index: 'src/index.ts',
    'credentials/OpenClawApi.credentials':
      'src/credentials/OpenClawApi.credentials.ts',
    'nodes/OpenClaw/OpenClaw.node': 'src/nodes/OpenClaw/OpenClaw.node.ts',
    'nodes/OpenClaw/toolSchemas': 'src/nodes/OpenClaw/toolSchemas.ts',
  },
  external: [
    ...Object.keys((pkg as unknown as Package).dependencies ?? {}),
    ...Object.keys((pkg as unknown as Package).peerDependencies ?? {}),
    'tslib',
    /^n8n-/,
  ],
  plugins: [
    aliasPlugin({ entries: commonAliases }),
    ...commonPlugins,
    copyPlugin({
      targets: [
        {
          src: 'src/nodes/OpenClaw/openclaw.svg',
          dest: 'dist/nodes/OpenClaw',
        },
      ],
    }),
  ],
};

/**
 * Build the library (ESM only) with preserved entry points.
 */
export const buildLibrary = (dest: string): RollupOptions => ({
  ...commonInputOptions,
  output: [
    {
      dir: dest,
      extend: true,
      format: 'cjs',
      entryFileNames: '[name].js',
      chunkFileNames: '_shared/[name]-[hash].js',
      exports: 'named',
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

const config: RollupOptions[] = [
  buildLibrary(outputPath),
  buildTypes(outputPath),
];

export default config;
