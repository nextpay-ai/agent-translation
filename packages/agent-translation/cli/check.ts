import { parseTCalls, findSourceFiles } from './parse'
import { fnv1a } from '../src/hash'

interface CheckOptions {
  dir: string
  locales: string[]
}

export interface CheckError {
  file: string
  line: number
  type: 'missing-locale' | 'stale-hash'
  en: string
  ctx: string | null
  tone: string | null
  // missing-locale fields
  missingLocales?: string[]
  // stale-hash fields
  locales?: string[]
  currentHash?: string
  expectedHash?: string
}

export interface CheckResult {
  errors: CheckError[]
  summary: {
    missingLocale: number
    staleHash: number
    files: number
  }
}

export async function runCheck(options: CheckOptions): Promise<CheckResult> {
  const files = await findSourceFiles(options.dir)
  const errors: CheckError[] = []
  const affectedFiles = new Set<string>()

  for (const filePath of files) {
    const calls = parseTCalls(filePath)

    for (const call of calls) {
      let fileHasErrors = false

      // Check for missing locales
      const missingLocales = options.locales.filter(
        (loc) => loc !== 'en' && !(loc in call.locales),
      )
      if (missingLocales.length > 0) {
        errors.push({
          file: filePath,
          line: call.line,
          type: 'missing-locale',
          en: call.en,
          ctx: call.ctx,
          tone: call.tone,
          missingLocales,
        })
        fileHasErrors = true
      }

      // Check for stale hash
      if (call.currentHash !== null) {
        const expected = fnv1a(call.en)
        if (call.currentHash !== expected) {
          const allLocales = ['en', ...Object.keys(call.locales)]
          errors.push({
            file: filePath,
            line: call.line,
            type: 'stale-hash',
            en: call.en,
            ctx: call.ctx,
            tone: call.tone,
            locales: allLocales,
            currentHash: call.currentHash,
            expectedHash: expected,
          })
          fileHasErrors = true
        }
      }

      if (fileHasErrors) affectedFiles.add(filePath)
    }
  }

  return {
    errors,
    summary: {
      missingLocale: errors.filter((e) => e.type === 'missing-locale').length,
      staleHash: errors.filter((e) => e.type === 'stale-hash').length,
      files: affectedFiles.size,
    },
  }
}
