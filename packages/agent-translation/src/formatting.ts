/** Map short locale codes used by this library to BCP 47 language tags */
const LOCALE_TO_BCP47: Record<string, string> = {
  ph: 'fil', // Filipino
  en: 'en',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ja: 'ja',
  zh: 'zh',
  ko: 'ko',
  ar: 'ar',
  pt: 'pt',
}

/** Map short locale codes to ISO 3166-1 alpha-2 country codes for emoji */
const LOCALE_TO_COUNTRY: Record<string, string> = {
  ph: 'PH',
  en: 'US',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  ja: 'JP',
  zh: 'CN',
  ko: 'KR',
  ar: 'SA',
  pt: 'PT',
}

export function toBcp47(locale: string): string {
  return LOCALE_TO_BCP47[locale] ?? locale
}

export function formatCurrency(
  amount: number,
  currency: string,
  options: { locale: string; style?: string },
): string {
  return new Intl.NumberFormat(toBcp47(options.locale), {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDateTime(
  date: Date,
  options: { locale: string; dateStyle?: 'full' | 'long' | 'medium' | 'short'; timeStyle?: 'full' | 'long' | 'medium' | 'short' },
): string {
  const { locale, ...intlOptions } = options
  return new Intl.DateTimeFormat(toBcp47(locale), intlOptions).format(date)
}

export function formatList(
  items: string[],
  options: { locale: string; type?: 'conjunction' | 'disjunction' | 'unit' },
): string {
  return new Intl.ListFormat(toBcp47(options.locale), {
    type: options.type ?? 'conjunction',
  }).format(items)
}

export function getLocaleName(locale: string): string {
  const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })
  return displayNames.of(toBcp47(locale)) ?? locale
}

export function getLocaleNativeName(locale: string): string {
  const bcp47 = toBcp47(locale)
  const displayNames = new Intl.DisplayNames([bcp47], { type: 'language' })
  const result = displayNames.of(bcp47) ?? locale
  // Intl.DisplayNames returns capitalized names; lowercase the first character for consistency
  return result.charAt(0).toLowerCase() + result.slice(1)
}

/** Returns the flag emoji for a locale using regional indicator symbols */
export function getLocaleEmoji(locale: string): string {
  const country = LOCALE_TO_COUNTRY[locale]
  if (!country) return '🌐'
  // Regional indicator symbols start at U+1F1E6 for 'A' (charCode 65).
  // Offset = 0x1F1E6 - 65 = 0x1F1A5
  return Array.from(country)
    .map((char) => String.fromCodePoint(0x1f1a5 + char.charCodeAt(0)))
    .join('')
}
