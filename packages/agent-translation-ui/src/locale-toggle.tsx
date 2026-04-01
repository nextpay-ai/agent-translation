import { Select } from '@base-ui-components/react/select'
import { useLocale } from '@nextpay-ai/agent-translation/react'

// ─── Locale helpers ───────────────────────────────────────────────────────────

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

// ─── LocaleToggle ─────────────────────────────────────────────────────────────

/**
 * A compact locale switcher built on @base-ui-components/react Select.
 *
 * Renders a flag emoji trigger that opens a styled dropdown listing all
 * configured locales. Reads and writes the active locale via `useLocale()`.
 *
 * Must be rendered inside a `<TranslateProvider>`.
 *
 * @example
 * ```tsx
 * import { LocaleToggle } from '@nextpay-ai/agent-translation-ui'
 *
 * <LocaleToggle />
 * ```
 */
export function LocaleToggle() {
  const { locale, setLocale, locales } = useLocale()

  return (
    <Select.Root
      value={locale}
      onValueChange={(val) => val && setLocale(val)}
    >
      <Select.Trigger
        aria-label="Select language"
        className="flex size-8 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Select.Value>
          <span className="text-base leading-none" aria-hidden="true">
            {getFlag(locale)}
          </span>
        </Select.Value>
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner side="right" align="end" sideOffset={8} className="isolate z-50">
          <Select.Popup className="min-w-36 overflow-hidden rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 origin-(--transform-origin)">
            <Select.List className="p-1">
              {(locales as readonly string[]).map((loc) => (
                <Select.Item
                  key={loc}
                  value={loc}
                  className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {getFlag(loc)}
                  </span>
                  <Select.ItemText>{getNativeName(loc)}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
