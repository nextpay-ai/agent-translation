import { defineConfig } from '@playwright/test'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
  },
  webServer: {
    command: 'bun run build && bun run preview -- --host 127.0.0.1 --port 4173',
    cwd: __dirname,
    port: 4173,
    reuseExistingServer: true,
    timeout: 120000,
  },
})
