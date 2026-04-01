---
name: agent-translation:scaffold
description: Add @nextpay-ai/agent-translation to an existing or new project. Installs the package, generates translate.config.ts, wraps the app root, sets up git hooks, and copies skills.
---

# agent-translation scaffold

Use this skill when the user wants to add i18n to a project using `@nextpay-ai/agent-translation`.

## Steps

1. **Install the package**

```bash
bun add @nextpay-ai/agent-translation
```

2. **Run the interactive init command**

```bash
npx agent-translation init
```

This will ask:
- Which locales to support (must include `en`)
- Which tones to use (default: `formal`, `casual`, `urgent`)
- Whether to add `sync` to a git hook
- Where to place `<LocaleToggle>`

3. **Wrap the app root with `<TranslateProvider>`**

Find the app's root component (usually `src/main.tsx`, `src/app.tsx`, or wherever the router is mounted). Import and wrap:

```tsx
import { TranslateProvider } from '@nextpay-ai/agent-translation/react'

// Wrap your root:
<TranslateProvider locale={user?.locale ?? 'en'}>
  <App />
</TranslateProvider>
```

The `locale` value should come from the user's stored preference. If you don't have a preference system yet, default to `'en'`.

4. **Add the ESLint plugin**

In `eslint.config.js` (or `.eslintrc.js`):

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

5. **Run check on existing strings**

```bash
npx agent-translation check --json
```

If there are existing strings that need translation, hand off to the `translate` skill.

6. **Copy skills to `.claude/skills/`**

```bash
cp -r node_modules/@nextpay-ai/agent-translation/../../skills/* .claude/skills/
```

## Notes

- `translate.config.ts` uses module augmentation to drive TypeScript's `Locale` union. This file must be included in your `tsconfig.json` include paths (it usually is by default if it's at the project root).
- The `locale` passed to `<TranslateProvider>` should update when the user changes their preference. `setLocale` from `useLocale()` handles the in-app toggle; persisting to Convex/DB is the app's responsibility.
