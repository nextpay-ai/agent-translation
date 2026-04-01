import React, { createContext, useContext, useState, useCallback } from 'react'
import { setActiveLocale } from './translate'
import { getConfig } from './config'
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
  children: React.ReactNode
}

export function TranslateProvider({ locale: localeProp, children }: TranslateProviderProps) {
  const config = getConfig()

  // Track in-app locale switches (e.g., from <LocaleToggle>)
  const [internalLocale, setInternalLocale] = useState(localeProp)

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

  const handleSetLocale = useCallback((next: string) => {
    setActiveLocale(next)
    setInternalLocale(next)
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

// ─── <Var> ──────────────────────────────────────────────────────────────────

/**
 * Wraps a dynamic value inside a <Translate> so the _v hash ignores it.
 * At runtime, renders its children directly with no wrapper element.
 */
export function Var({ children }: { children: React.ReactNode }) {
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
export function Plural({ n, singular, zero, children }: PluralProps) {
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
export function Translate(props: TranslateProps) {
  const { locale } = useContext(LocaleContext) ?? { locale: getConfig().defaultLocale }
  const { _v: _ignored, ctx: _ctx, tone: _tone, locale: _overrideLocale, ...localeMap } = props as any
  const activeLocale = _overrideLocale ?? locale
  const content = localeMap[activeLocale] ?? localeMap[getConfig().defaultLocale] ?? localeMap['en']
  return <>{content}</>
}

// ─── <LocaleToggle> ──────────────────────────────────────────────────────────

/**
 * A drop-in locale switcher. Uses @base-ui-components/react's DropdownMenu
 * if available, otherwise falls back to a native <select>.
 *
 * For custom UI, use useLocale() instead.
 */
export function LocaleToggle() {
  const { locale, setLocale, locales } = useLocale()

  let DropdownMenu: any
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DropdownMenu = (globalThis as any).require?.('@base-ui-components/react')?.DropdownMenu
    if (!DropdownMenu) throw new Error('not available')
  } catch {
    // Fallback: native <select> if @base-ui-components/react is not installed
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

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {getLocaleEmoji(locale)} {getLocaleNativeName(locale)}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Positioner>
          <DropdownMenu.Popup>
            {locales.map((loc) => (
              <DropdownMenu.Item
                key={loc}
                onClick={() => setLocale(loc)}
              >
                {getLocaleEmoji(loc)} {getLocaleNativeName(loc)}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Popup>
        </DropdownMenu.Positioner>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
