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

/** Union of all configured locales. Derived from `RegisteredConfig`. Falls back to `string` if not registered. */
export type Locale = ConfigLocales

// Derive Tone union from registered config, fall back to string
type ConfigTones = RegisteredConfig extends { tones: infer T }
  ? T extends readonly string[]
    ? T[number]
    : string
  : string

/** Union of all configured tones. Derived from `RegisteredConfig`. Falls back to `string` if not registered. */
export type Tone = ConfigTones

// Derive DefaultLocale from registered config, fall back to string
/** The configured default locale. Derived from `RegisteredConfig`. Falls back to `string` if not registered. */
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

/** The shape of the object passed to and returned by {@link defineConfig}. */
export interface AgentTranslationConfig<
  L extends readonly string[],
  T extends readonly string[],
  D extends string,
> {
  /** All supported locale codes, e.g. `['en', 'ph']`. Must include at least one entry. */
  locales: L
  /** The locale used as the source of truth for translations. */
  defaultLocale: D
  /** Named translation tone variants, e.g. `['formal', 'casual', 'urgent']`. */
  tones: T
}
