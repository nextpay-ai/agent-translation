// Core
export { defineConfig } from './config'
export { t, skip, setActiveLocale, clearActiveLocale } from './translate'

// Types
export type {
  RegisteredConfig,
  Locale,
  Tone,
  DefaultLocale,
  LocaleMap,
  SkipInput,
  SkipResult,
  TArg,
  TOptions,
  TranslateProps,
  AgentTranslationConfig,
} from './types'

// Formatting
export {
  formatCurrency,
  formatDateTime,
  formatList,
  getLocaleName,
  getLocaleNativeName,
  getLocaleEmoji,
  toBcp47,
} from './formatting'

// Hash (useful for CLI and ESLint plugin consumers)
export { fnv1a } from './hash'
