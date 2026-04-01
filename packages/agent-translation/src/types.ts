/**
 * Augment this interface in your translate.config.ts to register your locales and tones.
 *
 * @example
 * declare module '@nextpay-ai/agent-translation' {
 *   interface RegisteredConfig {
 *     locales: readonly ['en', 'ph']
 *     tones: readonly ['formal', 'casual', 'urgent']
 *     defaultLocale: 'en'
 *   }
 * }
 */
export interface RegisteredConfig {}

// Derive Locale union from registered config, fall back to string
type ConfigLocales = RegisteredConfig extends { locales: infer L }
  ? L extends readonly string[]
    ? L[number]
    : string
  : string

export type Locale = ConfigLocales

// Derive Tone union from registered config, fall back to string
type ConfigTones = RegisteredConfig extends { tones: infer T }
  ? T extends readonly string[]
    ? T[number]
    : string
  : string

export type Tone = ConfigTones

// Derive DefaultLocale from registered config, fall back to string
export type DefaultLocale = RegisteredConfig extends { defaultLocale: infer D }
  ? D
  : string

/** A map of all required locales to a value of type T */
export type LocaleMap<T> = Record<Locale, T>

/** The object passed to skip() */
export interface SkipInput<T = string> {
  en: T
  reason: string
}

/** What skip() returns — satisfies LocaleMap by spreading en to all slots */
export interface SkipResult<T = string> {
  __skip: true
  en: T
  reason: string
}

/** Options accepted by t() in addition to the locale map */
export interface TOptions {
  _v?: string
  ctx?: string
  tone?: Tone
  locale?: string
}

/** Full argument to t() for string translations */
export type TArg<T = string> = (LocaleMap<T> & TOptions) | SkipResult<T>

/** Props for <Translate> component (JSX translations) */
export type TranslateProps = LocaleMap<unknown> & TOptions

export interface AgentTranslationConfig<
  L extends readonly string[],
  T extends readonly string[],
  D extends string,
> {
  locales: L
  defaultLocale: D
  tones: T
}
