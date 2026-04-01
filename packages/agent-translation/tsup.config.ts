import { defineConfig } from 'tsup'

export default defineConfig([
  // Browser-compatible library — index and react
  {
    entry: {
      index: 'src/index.ts',
      react: 'src/react.tsx',
    },
    format: ['esm'],
    dts: true,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    jsx: 'react-jsx',
    sourcemap: true,
    clean: true,
  },
  // ESLint plugin — node-only, also needs CJS for legacy eslint setups
  {
    entry: { eslint: 'src/eslint-plugin.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    external: [
      '@typescript-eslint/utils',
      '@typescript-eslint/utils/eslint-utils',
    ],
    clean: false,
  },
])
