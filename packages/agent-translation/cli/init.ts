import * as p from '@clack/prompts'
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DEFAULT_TONES = ['formal', 'casual', 'urgent'] as const

export async function runInit(cwd: string = process.cwd()): Promise<void> {
  p.intro('@nextpay-ai/agent-translation — project setup')

  // 1. Locales
  const localesInput = await p.text({
    message: 'Which locales do you want to support? (comma-separated)',
    placeholder: 'en, ph',
    defaultValue: 'en, ph',
    validate: (v) => {
      const locales = v.split(',').map((l) => l.trim()).filter(Boolean)
      if (locales.length < 1) return 'Please enter at least one locale'
      if (!locales.includes('en')) return 'en must be included as the source locale'
    },
  })
  if (p.isCancel(localesInput)) { p.cancel('Cancelled.'); process.exit(0) }
  const locales = (localesInput as string).split(',').map((l) => l.trim()).filter(Boolean)

  // 2. Tones
  const useDefaultTones = await p.confirm({
    message: `Use default tones? (${DEFAULT_TONES.join(', ')})`,
    initialValue: true,
  })
  if (p.isCancel(useDefaultTones)) { p.cancel('Cancelled.'); process.exit(0) }

  let tones: string[] = [...DEFAULT_TONES]
  if (!useDefaultTones) {
    const tonesInput = await p.text({
      message: 'Which tones do you want? (comma-separated)',
      placeholder: 'formal, casual, urgent',
    })
    if (p.isCancel(tonesInput)) { p.cancel('Cancelled.'); process.exit(0) }
    tones = (tonesInput as string).split(',').map((t) => t.trim()).filter(Boolean)
  }

  // 3. Git hook
  const gitHook = await p.select({
    message: 'Add `agent-translation sync` to a git hook?',
    options: [
      { value: 'pre-commit', label: 'pre-commit (recommended)' },
      { value: 'pre-push', label: 'pre-push' },
      { value: 'both', label: 'both' },
      { value: 'skip', label: "skip — I'll set this up manually" },
    ],
    initialValue: 'pre-commit',
  })
  if (p.isCancel(gitHook)) { p.cancel('Cancelled.'); process.exit(0) }

  // 4. LocaleToggle placement
  const togglePlacement = await p.select({
    message: 'Where should the <LocaleToggle> component go?',
    options: [
      { value: 'agent', label: "Tell me the path and I'll place it" },
      { value: 'snippet', label: 'Show me a copy-paste snippet' },
      { value: 'skip', label: "Skip — I'll handle it myself" },
    ],
    initialValue: 'snippet',
  })
  if (p.isCancel(togglePlacement)) { p.cancel('Cancelled.'); process.exit(0) }

  const s = p.spinner()
  s.start('Writing configuration...')

  // Write translate.config.ts
  const localeArray = locales.map((l) => `'${l}'`).join(', ')
  const toneArray = tones.map((t) => `'${t}'`).join(', ')
  const defaultLocale = locales[0]

  const configContent = `import { defineConfig } from '@nextpay-ai/agent-translation'

const config = defineConfig({
  locales: [${localeArray}] as const,
  defaultLocale: '${defaultLocale}',
  tones: [${toneArray}] as const,
})

export default config

declare module '@nextpay-ai/agent-translation' {
  interface RegisteredConfig {
    locales: typeof config.locales
    tones: typeof config.tones
    defaultLocale: typeof config.defaultLocale
  }
}
`
  writeFileSync(join(cwd, 'translate.config.ts'), configContent)

  // Set up git hooks
  if (gitHook !== 'skip') {
    const hooksDir = join(cwd, '.git', 'hooks')
    if (existsSync(hooksDir)) {
      const hooks = gitHook === 'both' ? ['pre-commit', 'pre-push'] : [gitHook as string]
      for (const hook of hooks) {
        const hookPath = join(hooksDir, hook)
        const existing = existsSync(hookPath) ? readFileSync(hookPath, 'utf-8') : '#!/bin/sh\n'
        if (!existing.includes('agent-translation sync')) {
          writeFileSync(hookPath, existing + '\nnpx agent-translation sync\n', { mode: 0o755 })
        }
      }
    }
  }

  // Copy skills from the package's own skills/ directory into the project
  // Skills are bundled inside the npm package — use import.meta.url to locate them
  const pkgSkillsDir = new URL('../../skills', import.meta.url).pathname
  const projectSkillsDir = join(cwd, '.claude', 'skills')
  mkdirSync(join(projectSkillsDir, 'scaffold'), { recursive: true })
  mkdirSync(join(projectSkillsDir, 'translate'), { recursive: true })
  const { copyFileSync } = await import('node:fs')
  copyFileSync(join(pkgSkillsDir, 'scaffold', 'SKILL.md'), join(projectSkillsDir, 'scaffold', 'SKILL.md'))
  copyFileSync(join(pkgSkillsDir, 'translate', 'SKILL.md'), join(projectSkillsDir, 'translate', 'SKILL.md'))

  s.stop('Configuration written.')

  // LocaleToggle placement output
  if (togglePlacement === 'snippet') {
    p.note(
      `Add <LocaleToggle /> from '@nextpay-ai/agent-translation/react' to your app header or nav.

Example:
  import { LocaleToggle } from '@nextpay-ai/agent-translation/react'

  function Header() {
    return (
      <header>
        <nav>...</nav>
        <LocaleToggle />
      </header>
    )
  }`,
      'LocaleToggle placement',
    )
  } else if (togglePlacement === 'agent') {
    const path = await p.text({
      message: 'Path to the file where LocaleToggle should be placed:',
      placeholder: 'src/components/header.tsx',
    })
    if (!p.isCancel(path)) {
      p.note(
        `Add this import and component to ${path}:\n\nimport { LocaleToggle } from '@nextpay-ai/agent-translation/react'\n\n// Inside your JSX:\n<LocaleToggle />`,
        'Add to your file',
      )
    }
  }

  p.outro('Done! Run `npx agent-translation check` to verify your setup.')
}
