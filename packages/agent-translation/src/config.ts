import type { AgentTranslationConfig } from './types'

let _config: AgentTranslationConfig<any, any, any> = {
  locales: ['en'],
  defaultLocale: 'en',
  tones: ['formal', 'casual', 'urgent'],
}

/**
 * Define your project's i18n configuration.
 * Call this in `translate.config.ts` and use module augmentation to register
 * the config with TypeScript so locale props are enforced everywhere.
 *
 * @example
 * ```ts
 * const config = defineConfig({
 *   locales: ['en', 'ph'] as const,
 *   defaultLocale: 'en',
 *   tones: ['formal', 'casual', 'urgent'] as const,
 * })
 * ```
 */
export function defineConfig<
  L extends readonly [string, ...string[]],
  T extends readonly string[],
  D extends L[number],
>(config: AgentTranslationConfig<L, T, D>): AgentTranslationConfig<L, T, D> {
  _config = config
  return config
}

/** Returns the active config set by {@link defineConfig}. Falls back to `{ locales: ['en'], defaultLocale: 'en' }`. */
export function getConfig(): AgentTranslationConfig<readonly string[], readonly string[], string> {
  return _config
}
