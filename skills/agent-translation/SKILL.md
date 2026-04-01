---
name: agent-translation
description: Fix missing or stale translations. Auto-triggers on TypeScript errors for missing locale props or lint errors for stale _v hashes. Asks the user which model to use and whether to run parallel subagents.
---

# agent-translation translate

This skill fixes two types of i18n errors:

- **Missing locale** — TypeScript error because a locale prop is absent (e.g., added `es` to config)
- **Stale hash** — ESLint `no-stale-hash` error because `en` content changed and `_v` is outdated

## When to invoke

Invoke this skill when:
- You see TypeScript errors about missing locale props on `t()` or `<Translate>`
- You see ESLint errors from `agent-translation/no-stale-hash`
- The user asks you to "fix translations" or "update translations"

## Steps

### 1. Enumerate all errors

```bash
npx agent-translation check --json
```

Parse the JSON output. Count the errors by type and by file.

### 2. Ask the user for model and parallelism

Present a summary:

```
Found N missing translations across M files.
Which model would you like to use?
  a) Haiku (fast, cheap — recommended for translation work)
  b) Sonnet
  c) Opus
Run in parallel subagents? (y/n)
```

**Recommend Haiku.** Translation is a well-defined, context-rich task. The `en` value, `ctx`, and `tone` give the agent everything it needs. Haiku handles this correctly and is 10-20x cheaper than Sonnet.

### 3. Dispatch subagents

**Parallel (recommended):** Dispatch one subagent per affected file. Each subagent:

1. Reads the file
2. For each error in the file:
   - For `missing-locale`: fills in the missing locale values based on `en`, `ctx`, and `tone`
   - For `stale-hash`: updates the stale locale values to match the updated `en`
3. Writes the updated file

**Sequential:** Process files one at a time in this session.

### 4. Subagent prompt template

When dispatching a subagent for a file, include:

```
File: <path>
Errors from `agent-translation check --json`:
<paste the errors for this file>

Instructions:
- For each missing-locale error: add the missing locale prop(s) to the t() call
- For each stale-hash error: update the stale locale values to match the updated `en`
- Use the `ctx` field for context and `tone` for register guidance
- Do NOT modify `_v` — the orchestrator will run `agent-translation sync` after all subagents complete
- Do NOT use skip() unless explicitly appropriate
- Write natural, idiomatic translations — not word-for-word
- When translating to Filipino (ph): use contemporary Filipino, not overly formal Tagalog
- If the file is a React component and imports `t` from `@nextpay-ai/agent-translation`, change it to use `useT` from `@nextpay-ai/agent-translation/react` (or `@nextpay-ai/agent-translation-ui`) instead — `const t = useT()` at the top of the component. Remove any `useLocale()` call added purely for re-render subscription.
```

### 5. After all subagents complete

Run sync to recompute all `_v` hashes:

```bash
npx agent-translation sync
```

Then verify:

```bash
npx agent-translation check
```

Expected: ✓ No translation errors found.

## Guidelines for good translations

- **Filipino (ph):** Contemporary Filipino (Tagalog-based). Avoid archaic terms. Code-switching (mixing English for technical terms) is natural and appropriate.
- **Tone `formal`:** Use `po`/`opo` markers for Filipino. Use complete sentences, no contractions.
- **Tone `casual`:** Natural, conversational. Contractions fine. For Filipino, mixing English is normal.
- **Tone `urgent`:** Direct, clear. Short sentences. No pleasantries.
- **`<Var>` contents:** Never translate these — they're dynamic values (names, amounts, IDs).
- **Brand names:** Use `skip()` if they genuinely don't translate.
