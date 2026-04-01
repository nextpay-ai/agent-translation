import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

const base = process.env.GITHUB_ACTIONS ? '/agent-translation/' : '/'

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@nextpay-ai/agent-translation/react', replacement: resolve(__dirname, '../agent-translation/src/react.tsx') },
      { find: '@nextpay-ai/agent-translation-ui', replacement: resolve(__dirname, '../agent-translation-ui/src/index.ts') },
      { find: '@nextpay-ai/agent-translation', replacement: resolve(__dirname, '../agent-translation/src/index.ts') },
    ],
  },
})
