/**
 * @module
 *
 * Agent-driven, type-enforced i18n for TypeScript and React.
 *
 * Core usage:
 * - {@link defineConfig} — declare your locales and tones in `translate.config.ts`
 * - {@link t} — translate a string map to the active locale
 * - {@link skip} — mark a string as intentionally untranslated
 *
 * React:
 * - `@nextpay-ai/agent-translation/react` — `TranslateProvider`, `Translate`, `LocaleToggle`, `useLocale`
 *
 * ESLint:
 * - `@nextpay-ai/agent-translation/eslint` — `no-stale-hash` rule
 */

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
