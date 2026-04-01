# @nextpay-ai/agent-translation

TypeScript-first i18n where the type system enforces locale completeness and coding agents do the translation work.

No JSON files. No external translation APIs. No manual handoff to translators.

```ts
// Add a new locale to your config...
export default defineConfig({ locales: ['en', 'ph', 'es'] as const, ... })

// TypeScript immediately fails everywhere 'es' is missing.
// Run the translate skill. Done.
```

---

## Why

Most i18n solutions fall into two categories: manage JSON files yourself (tedious, error-prone, stale), or send strings to a cloud translation API (runtime cost, privacy tradeoffs, CDN dependency).

This library takes a different approach: translations are co-located with the code that uses them, the type system enforces completeness, and coding agents (running locally, on your CI, in your editor) handle the actual translation work. Adding a language is a one-line config change. The agents take care of the rest.

The idea isn't new. [General Translation](https://github.com/generaltranslation/gt) pioneered inline JSX translations with their `<T>` component, and this library borrows heavily from their design — the `<Translate>` component pattern, `<Var>` for dynamic values, `<Plural>` for count-aware grammar, and the locale-aware formatting utilities all trace back to their work. What's different here is the workflow: instead of a cloud API doing the translation at build time or runtime, coding agents do it locally with no external dependency.

---

## Install

```bash
bun add @nextpay-ai/agent-translation
# or
npm install @nextpay-ai/agent-translation
```

---

## Setup

```bash
npx agent-translation init
```

Asks you which locales and tones to support, whether to add a git hook, and where to place the locale toggle. Generates `translate.config.ts` and wires everything up.

---

## Usage

### Config

```ts
// translate.config.ts
import { defineConfig } from '@nextpay-ai/agent-translation'

const config = defineConfig({
  locales: ['en', 'ph'] as const,
  defaultLocale: 'en',
  tones: ['formal', 'casual', 'urgent'] as const,
})

export default config

declare module '@nextpay-ai/agent-translation' {
  interface RegisteredConfig {
    locales: typeof config.locales
    tones: typeof config.tones
    defaultLocale: typeof config.defaultLocale
  }
}
```

Adding `'es'` to `locales` immediately makes `es` a required prop everywhere. TypeScript fails. Run the translate skill. TypeScript passes again.

### JSX — `<Translate>`

```tsx
import { Translate, Var, Plural } from '@nextpay-ai/agent-translation/react'

<Translate
  _v="a3f9c28e"
  en={<span>Good day, <Var>{user.name}</Var></span>}
  ph={<span>Magandang araw, <Var>{user.name}</Var></span>}
/>
```

`<Var>` marks dynamic values that shouldn't be translated. `<Plural>` handles count-based grammar:

```tsx
<Translate
  _v="c4a1f28e"
  en={<Plural n={count} singular={<>You have <Var>{count}</Var> notification.</>}>You have <Var>{count}</Var> notifications.</Plural>}
  ph={<Plural n={count} singular={<>Mayroon kang <Var>{count}</Var> abiso.</>}>Mayroon kang <Var>{count}</Var> na mga abiso.</Plural>}
/>
```

### Strings — `t()`

```ts
import { t } from '@nextpay-ai/agent-translation'

// Inside React — reads locale from context
const label = t({ en: 'Dashboard', ph: 'Dashboard', _v: 'a1b2c3d4' })

// Outside React — pass locale explicitly
const msg = t({ en: 'Transfer failed', ph: 'Nabigo ang paglipat', _v: 'b7d1e4f2', locale: userLocale })
```

### Skip untranslatable strings

```ts
import { t, skip } from '@nextpay-ai/agent-translation'

const brand = t(skip({ en: 'NextPay', reason: 'Brand name' }))
```

`reason` is required and visible in code review. `grep 'skip('` audits all escape hatches.

### Locale toggle

```tsx
import { TranslateProvider, LocaleToggle } from '@nextpay-ai/agent-translation/react'

// Wrap your app
<TranslateProvider locale={user.locale ?? 'en'}>
  <App />
</TranslateProvider>

// Place the toggle anywhere
<LocaleToggle />

// Or build your own
const { locale, setLocale, locales } = useLocale()
```

### Formatting

```ts
import { formatCurrency, formatDateTime, getLocaleName, getLocaleNativeName, getLocaleEmoji } from '@nextpay-ai/agent-translation'

formatCurrency(1999.99, 'PHP', { locale: 'ph' })  // "₱1,999.99"
getLocaleName('es')        // "Spanish"
getLocaleNativeName('es')  // "español"
getLocaleEmoji('ph')       // "🇵🇭"
```

---

## Stale translation detection

The `_v` prop is an 8-character FNV-1a hash of the `en` value. When `en` changes, `_v` goes stale. The bundled ESLint rule catches it:

```
agent-translation/no-stale-hash: _v hash "a3f9c28e" does not match expected "b1d4e7f2"
```

Fix by running:

```bash
npx agent-translation sync  # recomputes all _v hashes in-place
```

Then re-run the translate skill to update the affected locale translations.

---

## CLI

```bash
npx agent-translation sync          # recompute _v hashes
npx agent-translation check         # report errors, exit 1 if any
npx agent-translation check --json  # machine-readable output
npx agent-translation init          # interactive setup
```

---

## Claude Code skills

Two skills ship in `skills/` — copy them to your project's `.claude/skills/` directory (or let `init` do it):

- `scaffold` — adds the library to a project
- `translate` — fixes missing and stale translations, with model selection and parallel subagent support

The `translate` skill recommends Haiku for translation work. It's a well-defined task with full context (the `en` value, `ctx`, and `tone` give the agent everything it needs), and Haiku handles it correctly at a fraction of the cost of larger models.

---

## Trade-offs

This approach works best in codebases where coding agents are part of the development workflow. If your team doesn't use agents, the translate skill is just a convenient prompt — you'd be filling in locale props by hand, which is the same as any other i18n library.

The `_v` hash mechanism catches stale translations when `en` copy changes, but only for string-valued `t()` calls. JSX `<Translate>` props require the agent to inspect git diffs for changed `en={...}` props.

---

## Credits

Heavy inspiration from [General Translation](https://github.com/generaltranslation/gt) — the inline JSX translation pattern, `<Plural>`, `<Var>`, and the locale-aware formatting utilities all trace back to their work. If you want cloud-powered AI translation without the agent-driven workflow, check out GT.

---

## License

MIT © NextPay AI
