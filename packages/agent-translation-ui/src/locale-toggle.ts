import React from 'react'
import { useLocale } from '@nextpay-ai/agent-translation/react'

const LOCALE_COUNTRY: Record<string, string> = {
  en: 'US',
  ph: 'PH',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  ja: 'JP',
  zh: 'CN',
  ko: 'KR',
  ar: 'SA',
  pt: 'PT',
}

const LOCALE_BCP47: Record<string, string> = {
  ph: 'fil',
}

function getFlag(locale: string): string {
  const code = LOCALE_COUNTRY[locale]
  if (!code) return '🌐'
  return Array.from(code)
    .map((c) => String.fromCodePoint(0x1f1a5 + c.charCodeAt(0)))
    .join('')
}

function getNativeName(locale: string): string {
  const tag = LOCALE_BCP47[locale] ?? locale
  try {
    const name = new Intl.DisplayNames([tag], { type: 'language' }).of(tag) ?? locale
    return name.charAt(0).toUpperCase() + name.slice(1)
  } catch {
    return locale
  }
}

/**
 * A compact locale switcher built on the native `<select>` element.
 *
 * Must be rendered inside a `<TranslateProvider>`.
 */
export function LocaleToggle(): React.JSX.Element {
  const { locale, setLocale, locales } = useLocale()

  return React.createElement(
    'label',
    {
      style: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
      },
    },
    React.createElement(
      'span',
      {
        'aria-hidden': 'true',
        style: {
          position: 'absolute',
          left: '0.8rem',
          pointerEvents: 'none',
          fontSize: '1rem',
          lineHeight: 1,
        },
      },
      getFlag(locale),
    ),
    React.createElement(
      'select',
      {
        'aria-label': 'Select language',
        value: locale,
        onChange: (event: React.ChangeEvent<HTMLSelectElement>) => setLocale(event.target.value),
        style: {
          appearance: 'none',
          minWidth: '9rem',
          height: '2.9rem',
          borderRadius: '999px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(255, 255, 255, 0.04)',
          color: 'inherit',
          padding: '0 2.3rem 0 2.2rem',
          font: 'inherit',
          cursor: 'pointer',
        },
      },
      ...(locales as readonly string[]).map((loc) =>
        React.createElement(
          'option',
          { key: loc, value: loc },
          getNativeName(loc),
        ),
      ),
    ),
    React.createElement(
      'span',
      {
        'aria-hidden': 'true',
        style: {
          position: 'absolute',
          right: '0.9rem',
          pointerEvents: 'none',
          fontSize: '0.65rem',
          opacity: 0.75,
        },
      },
      '▼',
    ),
  )
}
