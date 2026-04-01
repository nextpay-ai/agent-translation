# @nextpay-ai/agent-translation

i18n where TypeScript enforces that every locale is filled in, and coding agents do the actual translation.

No JSON files. No cloud translation API. No waiting for someone to fill in strings.

```ts
// Add a locale to your config...
export default defineConfig({ locales: ['en', 'ph', 'es'] as const, ... })

// TypeScript immediately fails everywhere 'es' is missing.
// Run the translate skill. Done.
```

---

## Why

Most i18n solutions are either manage-your-own-JSON (tedious, stale, merge conflicts on every locale file) or send-to-a-cloud-API (runtime cost, privacy tradeoffs, another service to depend on).

This one works differently: translations live next to the code that uses them, TypeScript enforces that every locale is present, and coding agents handle the translation work. Adding a language is a one-line config change. The agents fill in the rest automatically.

The `<Translate>` component pattern, `<Var>`, `<Plural>`, and the locale-aware formatting utilities are all borrowed from [General Translation](https://github.com/generaltranslation/gt) — their inline JSX translation approach is genuinely good and we didn't try to reinvent it. What's different here is the workflow: no cloud API, no build step, agents run locally.

---

## Install

**React apps** — install the UI package. It includes `TranslateProvider`, `useLocale`, `Translate`, `Var`, `Plural`, and a styled `LocaleToggle`, all in one:

```bash
npx jsr add @nextpay-ai/agent-translation-ui
```

**Non-React projects** (Node scripts, CLI tools, ESLint config only):

```bash
npx jsr add @nextpay-ai/agent-translation
```

---

## Skills

The package ships two skills: `agent-translation:scaffold` (adds i18n to a project) and `agent-translation` (fixes missing or stale translations). Works with Claude Code, Codex, and any agent that uses `.claude/skills/` or `.agents/skills/`.

**Paste this prompt to your coding agent:**

```
Read https://raw.githubusercontent.com/nextpay-ai/agent-translation/main/skills/agent-translation:scaffold/SKILL.md and follow the instructions to set up agent-translation in this project.
```

**Shell:**

```bash
curl -fsSL https://raw.githubusercontent.com/nextpay-ai/agent-translation/main/skills/install.sh | sh
```

**CLI (after installing the package):**

```bash
npx jsr run @nextpay-ai/agent-translation install-skills
```

---

## Setup

```bash
npx agent-translation init
```

Asks which locales and tones to support, whether to add a git hook, and where to place the locale toggle. Generates `translate.config.ts` and wires everything up.

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

**Important:** `translate.config.ts` is a side-effect module. `defineConfig()` registers the locale list at runtime by mutating shared state inside the package. The `declare module` augmentation is TypeScript-only — forgetting to import the file silently falls back to `['en']` at runtime with no error. Import it explicitly in your app entry point:

```ts
// main.tsx (or wherever your app root is)
import './translate.config' // must import — registers locales at runtime
```

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

`reason` is required and shows up in code review. `grep 'skip('` audits all escape hatches.

### Locale toggle

```tsx
import { TranslateProvider, LocaleToggle, useLocale } from '@nextpay-ai/agent-translation-ui'

// Wrap your app
<TranslateProvider locale={user.locale ?? 'en'}>
  <App />
</TranslateProvider>

// Place the styled toggle anywhere (base-ui Select, flag emoji trigger)
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

Then re-run the translate skill to update affected locale translations.

---

## CLI

```bash
npx agent-translation sync             # recompute _v hashes
npx agent-translation check            # report errors, exit 1 if any
npx agent-translation check --json     # machine-readable output
npx agent-translation init             # interactive setup
npx agent-translation install-skills   # copy Claude Code skills to .claude/skills/
```

---

## Trade-offs

This works well in codebases where coding agents are already part of the workflow. If your team doesn't use agents, the translate skill is just a prompt — you'd be filling in locale props by hand, same as any other i18n library.

The `_v` hash catches stale translations for string `t()` calls. JSX `<Translate>` props are harder — the agent needs to inspect git diffs for changed `en={...}` props where sibling locales weren't updated in the same commit.

---

## Credits

[General Translation](https://github.com/generaltranslation/gt) did the hard design work here. The inline JSX translation pattern, `<Plural>`, `<Var>`, and the locale-aware formatting utilities all come from their library. If you want cloud-powered translation without the agent workflow, use GT directly.

---

## License

MIT © NextPay AI
