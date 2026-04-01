import { getConfig } from './config'
import type { TArg, LocaleMap, SkipResult, SkipInput } from './types'

// Module-level active locale — written by TranslateProvider, read by t()
let _activeLocale: string | null = null

/** Called by TranslateProvider on every render */
export function setActiveLocale(locale: string): void {
  _activeLocale = locale
}

/** Called in tests and when provider unmounts */
export function clearActiveLocale(): void {
  _activeLocale = null
}

/**
 * Translate a string map to the currently active locale.
 * Works inside and outside React trees.
 */
export function t(arg: TArg): string {
  // skip() result — same value for all locales
  if ('__skip' in arg && arg.__skip) {
    return (arg as SkipResult).en
  }

  const map = arg as LocaleMap<string> & { locale?: string; _v?: string; ctx?: string; tone?: string }
  const locale = map.locale ?? _activeLocale ?? getConfig().defaultLocale

  // Try exact locale, fall back to defaultLocale, then 'en'
  const defaultLocale = getConfig().defaultLocale
  return (
    map[locale as keyof typeof map] as string | undefined
    ?? map[defaultLocale as keyof typeof map] as string | undefined
    ?? (map as Record<string, string>)['en']
    ?? ''
  )
}

/**
 * Mark a string as intentionally not needing translation.
 * The `reason` field is required and is visible in code review.
 * At runtime, all locale slots receive the `en` value.
 */
export function skip<T extends string>(input: SkipInput<T>): SkipResult<T> {
  return {
    __skip: true,
    en: input.en,
    reason: input.reason,
  }
}
