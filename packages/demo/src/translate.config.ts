import { defineConfig } from '@nextpay-ai/agent-translation'

const config = defineConfig({
  locales: ['en', 'ph', 'es'] as const,
  defaultLocale: 'en',
  tones: ['formal', 'casual', 'urgent'] as const,
})

export default config

declare module '@nextpay-ai/agent-translation' {
  interface RegisteredConfig {
    locales: typeof config.locales
    tones: typeof config.tones
    defaultLocale: typeof config.defaultLocale
  }
}
