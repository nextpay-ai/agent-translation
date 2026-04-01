import type { AgentTranslationConfig } from './types'

let _config: AgentTranslationConfig<any, any, any> = {
  locales: ['en'],
  defaultLocale: 'en',
  tones: ['formal', 'casual', 'urgent'],
}

export function defineConfig<
  L extends readonly [string, ...string[]],
  T extends readonly string[],
  D extends L[number],
>(config: AgentTranslationConfig<L, T, D>): AgentTranslationConfig<L, T, D> {
  _config = config
  return config
}

export function getConfig() {
  return _config
}
