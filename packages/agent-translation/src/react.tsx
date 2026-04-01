/**
 * @module
 *
 * React bindings for `@nextpay-ai/agent-translation`.
 *
 * - {@link TranslateProvider} — wrap your app root to set the active locale
 * - {@link useLocale} — read and set the active locale in any component
 * - {@link useT} — locale-aware `t()` hook for React components (preferred over standalone `t`)
 * - {@link Translate} — render JSX content for the current locale
 * - {@link LocaleToggle} — drop-in native `<select>` locale switcher
 * - {@link Var} — wrap dynamic values inside `<Translate>` so hashes ignore them
 * - {@link Plural} — render singular/plural/zero forms based on a count
 */
import React, { createContext, useContext, useState, useCallback } from 'react'
import { t, setActiveLocale } from './translate'
import { getConfig } from './config'
import type { TArg } from './types'
import { getLocaleEmoji, getLocaleNativeName } from './formatting'
import type { TranslateProps } from './types'

// ─── Context ────────────────────────────────────────────────────────────────

interface LocaleContextValue {
  locale: string
  setLocale: (locale: string) => void
  locales: readonly string[]
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

// ─── Provider ───────────────────────────────────────────────────────────────

interface TranslateProviderProps {
  locale: string
  /**
   * Called whenever the active locale changes — either from a user toggle or
   * when the stored localStorage value overrides the initial `locale` prop on mount.
   * Use this to persist the new locale back to a database or any external store.
   *
   * @example
   * <TranslateProvider locale={user.locale} onLocaleChange={(l) => updateUserLocale(l)}>
   */
  onLocaleChange?: (locale: string) => void
  children: React.ReactNode
}

const STORAGE_KEY = 'agent-translation:locale'

function readStoredLocale(validLocales: readonly string[]): string | null {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    return stored && validLocales.includes(stored) ? stored : null
  } catch {
    return null
  }
}

export function TranslateProvider({ locale: localeProp, onLocaleChange, children }: TranslateProviderProps): React.JSX.Element {
  const config = getConfig()

  // Track in-app locale switches (e.g., from <LocaleToggle>)
  // Seed from localStorage if present and valid, otherwise fall back to prop
  const [internalLocale, setInternalLocale] = useState(
    () => readStoredLocale(config.locales) ?? localeProp,
  )

  // Sync prop changes to internal state during render — no useEffect needed.
  // React's recommended pattern for deriving state from props:
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevProp, setPrevProp] = useState(localeProp)
  if (localeProp !== prevProp) {
    setPrevProp(localeProp)
    setInternalLocale(localeProp)
  }

  // Write to module-level var synchronously so t() can read it during this render
  setActiveLocale(internalLocale)

  // Fire onLocaleChange if localStorage seeded a different locale than the prop
  const onLocaleChangeRef = React.useRef(onLocaleChange)
  onLocaleChangeRef.current = onLocaleChange
  const didNotifyMount = React.useRef(false)
  if (!didNotifyMount.current && internalLocale !== localeProp) {
    didNotifyMount.current = true
    // Schedule for after render so the callback doesn't run during render
    Promise.resolve().then(() => onLocaleChangeRef.current?.(internalLocale))
  }

  const handleSetLocale = useCallback((next: string) => {
    setActiveLocale(next)
    setInternalLocale(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // storage unavailable (SSR, private browsing quota, etc.) — silently ignore
    }
    onLocaleChangeRef.current?.(next)
  }, [])

  return (
    <LocaleContext.Provider
      value={{ locale: internalLocale, setLocale: handleSetLocale, locales: config.locales }}
    >
      {children}
    </LocaleContext.Provider>
  )
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside <TranslateProvider>')
  return ctx
}

// ─── useT ────────────────────────────────────────────────────────────────────

/**
 * Returns a locale-aware translation function bound to the current React context.
 *
 * Preferred over the standalone `t()` import in React components. The standalone
 * `t()` reads a module-level singleton (`_activeLocale`) which can be duplicated
 * when build tools create multiple instances of the module. `useT()` avoids this
 * by passing the locale from context directly into each `t()` call.
 *
 * @example
 * function MyComponent() {
 *   const t = useT()
 *   return <span>{t({ en: 'Hello', ph: 'Kamusta', _v: '...' })}</span>
 * }
 */
export function useT(): (arg: TArg) => string {
  const { locale } = useLocale()
  return useCallback(
    (arg: TArg): string => t({ ...(arg as any), locale }),
    [locale],
  )
}

// ─── <Var> ──────────────────────────────────────────────────────────────────

/**
 * Wraps a dynamic value inside a <Translate> so the _v hash ignores it.
 * At runtime, renders its children directly with no wrapper element.
 */
export function Var({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <>{children}</>
}

// ─── <Plural> ────────────────────────────────────────────────────────────────

interface PluralProps {
  n: number
  singular: React.ReactNode
  zero?: React.ReactNode
  children: React.ReactNode // plural form (default)
}

/**
 * Renders different content based on count.
 * Each locale's JSX is responsible for providing its own grammatically
 * correct singular/plural/zero forms.
 */
export function Plural({ n, singular, zero, children }: PluralProps): React.JSX.Element {
  if (n === 0 && zero !== undefined) return <>{zero}</>
  if (n === 1) return <>{singular}</>
  return <>{children}</>
}

// ─── <Translate> ─────────────────────────────────────────────────────────────

/**
 * Renders JSX content for the currently active locale.
 * All configured locale props are required by the type system.
 *
 * @example
 * <Translate
 *   _v="a3f9c28e"
 *   en={<span>Hello <Var>{name}</Var></span>}
 *   ph={<span>Kamusta <Var>{name}</Var></span>}
 * />
 */
export function Translate(props: TranslateProps): React.JSX.Element {
  const { locale } = useContext(LocaleContext) ?? { locale: getConfig().defaultLocale }
  const { _v: _ignored, ctx: _ctx, tone: _tone, locale: _overrideLocale, ...localeMap } = props as any
  const activeLocale = _overrideLocale ?? locale
  const content = localeMap[activeLocale] ?? localeMap[getConfig().defaultLocale] ?? localeMap['en']
  return <>{content}</>
}

// ─── <LocaleToggle> ──────────────────────────────────────────────────────────

/**
 * A drop-in locale switcher rendered as a native <select>.
 *
 * For custom UI (dropdown, flags, etc.), use useLocale() instead:
 *
 * ```tsx
 * const { locale, setLocale, locales } = useLocale()
 * ```
 */
export function LocaleToggle(): React.JSX.Element {
  const { locale, setLocale, locales } = useLocale()

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      aria-label="Select language"
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {getLocaleEmoji(loc)} {getLocaleNativeName(loc)}
        </option>
      ))}
    </select>
  )
}
