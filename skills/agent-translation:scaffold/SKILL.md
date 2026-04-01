---
name: agent-translation:scaffold
description: Add @nextpay-ai/agent-translation to an existing or new project. Asks preference questions, explores project structure, then sets up translate.config.ts, TranslateProvider, git hooks, ESLint plugin, and skills — without running the interactive CLI.
---

# agent-translation scaffold

Use this skill when the user wants to add i18n to a project using `@nextpay-ai/agent-translation`.

**Do not run `npx agent-translation init`** — that's an interactive CLI meant for humans. Instead, ask the preference questions yourself and do the setup directly.

## Step 1: Explore the project

Before asking anything, read the project to understand its structure:

- `package.json` — package manager (bun/npm/pnpm), existing deps, scripts
- `src/` structure — find the app root (usually `main.tsx`, `app.tsx`, `_app.tsx`, or wherever the router is mounted)
- ESLint config — `eslint.config.js`, `.eslintrc.js`, or `eslint.config.ts`
- Any existing i18n setup — look for `i18next`, `react-intl`, `next-intl`, `lingui`, etc.
- How user preferences are stored — look for user objects in Convex schemas, Zustand stores, Redux slices, or `localStorage` calls

## Step 2: Ask preference questions

Ask the user these questions. You can ask them all at once as a numbered list — no need to go one by one.

```
To set up agent-translation, I need a few answers:

1. **Locales** — which languages will this app support?
   (en is required as the source locale. Common additions: ph, es, id, zh, ar)

2. **Tones** — translation tone variants to enforce.
   Default: formal, casual, urgent. Keep defaults or customize?

3. **Git hook** — should `agent-translation sync` run before commits to keep hashes fresh?
   Options: pre-commit (recommended), pre-push, both, skip

4. **Locale source** — where does the active locale come from at runtime?
   e.g., `user.locale` from Convex, `localStorage.getItem('locale')`, a Zustand store, etc.
   This determines what we pass to `<TranslateProvider locale={...}>`.

5. **LocaleToggle placement** — where should the locale switcher UI live?
   e.g., the app header, a settings page, a nav sidebar. I'll find the right file.
```

If the user already answered some of these (e.g., "add English and Filipino"), skip those.

## Step 3: Install the package

```bash
bun add @nextpay-ai/agent-translation
# or: npm install @nextpay-ai/agent-translation
# or: pnpm add @nextpay-ai/agent-translation
```

Use whichever package manager the project already uses.

## Step 4: Write translate.config.ts

Create at the project root:

```ts
import { defineConfig } from '@nextpay-ai/agent-translation'

const config = defineConfig({
  locales: ['en', 'ph'] as const,       // ← use the locales from step 2
  defaultLocale: 'en',
  tones: ['formal', 'casual', 'urgent'] as const,  // ← from step 2
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

## Step 5: Wrap the app root with TranslateProvider

Find the root component from step 1. Import and wrap — use the locale source the user described:

```tsx
import { TranslateProvider } from '@nextpay-ai/agent-translation/react'

// Example with Convex user object:
<TranslateProvider locale={currentUser?.locale ?? 'en'}>
  <App />
</TranslateProvider>

// Example with localStorage:
<TranslateProvider locale={(localStorage.getItem('locale') as Locale) ?? 'en'}>
  <App />
</TranslateProvider>
```

If there's no locale preference system yet, default to `'en'` and note that wiring it up is a follow-up task.

## Step 6: Add LocaleToggle to the UI

Find the component the user pointed to (header, nav, settings page). Import and place it:

```tsx
import { LocaleToggle } from '@nextpay-ai/agent-translation/react'

// Inside the component's JSX:
<LocaleToggle />
```

`LocaleToggle` uses shadcn/base-ui if available, falls back to a native `<select>` otherwise.

## Step 7: Set up the git hook

If the user chose pre-commit or pre-push, append to `.git/hooks/<hook>`:

```sh
#!/bin/sh
npx agent-translation sync
```

Make sure the hook file is executable (`chmod +x .git/hooks/pre-commit`).

If `.git/hooks/pre-commit` already exists, append to it rather than overwriting.

## Step 8: Add the ESLint plugin

Open the ESLint config found in step 1. Add:

```js
import agentTranslation from '@nextpay-ai/agent-translation/eslint'

export default [
  // ...existing config
  {
    plugins: { 'agent-translation': agentTranslation },
    rules: { 'agent-translation/no-stale-hash': 'error' },
  },
]
```

For `.eslintrc.js` (legacy format):

```js
module.exports = {
  plugins: ['agent-translation'],
  rules: { 'agent-translation/no-stale-hash': 'error' },
}
```

## Step 9: Install agent skills

```bash
npx agent-translation install-skills
```

This copies `agent-translation` and `agent-translation:scaffold` into `.claude/skills/` and/or `.agents/skills/` — whichever exist in the project.

## Step 10: Run check

```bash
npx agent-translation check --json
```

If there are errors (missing locales or stale hashes), hand off to the `agent-translation` skill to fix them.

## Notes

- `translate.config.ts` must be in the TypeScript include paths. It usually is if it's at the project root.
- `setLocale` from `useLocale()` handles in-app locale toggling. Persisting the choice back to the DB or localStorage is the app's responsibility — point this out to the user.
- If the project already has i18n (i18next, lingui, etc.), flag the overlap before proceeding. agent-translation can coexist but the user should know.
