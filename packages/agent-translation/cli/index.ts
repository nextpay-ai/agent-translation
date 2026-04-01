#!/usr/bin/env bun
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { runSync } from './sync'
import { runCheck } from './check'
import { runInit } from './init'
import { getConfig } from '../src/config'

const [, , command, ...args] = process.argv

const cwd = process.cwd()

async function loadUserConfig() {
  const configPath = join(cwd, 'translate.config.ts')
  if (existsSync(configPath)) {
    try {
      // Bun supports direct TypeScript imports — this executes defineConfig()
      // which updates the module-level config
      await import(configPath)
    } catch (e) {
      console.warn(`Warning: could not load translate.config.ts — ${e}`)
    }
  }
}

async function main() {
  // Load user config before any command that needs locale info
  if (command === 'check' || command === 'sync') {
    await loadUserConfig()
  }

  switch (command) {
    case 'sync': {
      console.log('agent-translation sync — recomputing _v hashes...')
      const result = await runSync({ dir: cwd })
      console.log(`Done. ${result.updated} updated, ${result.unchanged} unchanged.`)
      break
    }

    case 'check': {
      const json = args.includes('--json')
      const config = getConfig()
      const result = await runCheck({ dir: cwd, locales: [...config.locales] })

      if (json) {
        console.log(JSON.stringify(result, null, 2))
      } else {
        if (result.errors.length === 0) {
          console.log('✓ No translation errors found.')
        } else {
          for (const err of result.errors) {
            if (err.type === 'missing-locale') {
              console.error(`${err.file}:${err.line} — missing locales: ${err.missingLocales?.join(', ')} for en="${err.en}"`)
            } else {
              console.error(`${err.file}:${err.line} — stale _v for en="${err.en}" (got ${err.currentHash}, expected ${err.expectedHash})`)
            }
          }
          console.error(`\nFound ${result.errors.length} error(s) in ${result.summary.files} file(s).`)
        }
      }

      if (result.errors.length > 0) process.exit(1)
      break
    }

    case 'init': {
      await runInit(cwd)
      break
    }

    case 'install-skills': {
      const { mkdirSync, copyFileSync, existsSync: exists } = await import('node:fs')
      const pkgSkillsDir = new URL('../../skills', import.meta.url).pathname
      if (!exists(pkgSkillsDir)) {
        console.error('Skills directory not found in package. Try: curl -fsSL https://raw.githubusercontent.com/nextpay-ai/agent-translation/main/skills/install.sh | sh')
        process.exit(1)
      }
      const skillDirs = [
        join(cwd, '.claude', 'skills'),
        join(cwd, '.agents', 'skills'),
      ]
      // Install into whichever parent dirs exist; default to .claude/skills if neither does
      const targets = skillDirs.filter((d) => exists(d) || exists(join(d, '..', '..')))
      const installs = targets.length > 0 ? targets : [skillDirs[0]]
      for (const dest of installs) {
        mkdirSync(join(dest, 'agent-translation'), { recursive: true })
        mkdirSync(join(dest, 'agent-translation:scaffold'), { recursive: true })
        copyFileSync(join(pkgSkillsDir, 'agent-translation', 'SKILL.md'), join(dest, 'agent-translation', 'SKILL.md'))
        copyFileSync(join(pkgSkillsDir, 'agent-translation:scaffold', 'SKILL.md'), join(dest, 'agent-translation:scaffold', 'SKILL.md'))
        console.log(`Skills installed to ${dest}/`)
      }
      break
    }

    default: {
      console.log(`Usage: agent-translation <command>

Commands:
  sync             Recompute _v hashes in-place
  check            Report missing locales and stale hashes (exit 1 if any)
  check --json     Output errors as JSON for skill consumption
  init             Interactive project setup
  install-skills   Copy Claude Code skills to .claude/skills/
`)
      break
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
