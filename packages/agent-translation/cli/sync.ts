import { readFileSync, writeFileSync } from 'node:fs'
import { parseTCalls, findSourceFiles } from './parse'
import { fnv1a } from '../src/hash'

interface SyncOptions {
  dir: string
  quiet?: boolean
}

export interface SyncResult {
  updated: number
  unchanged: number
  skippedMissingV: number
}

export async function runSync(options: SyncOptions): Promise<SyncResult> {
  const files = await findSourceFiles(options.dir)
  let updated = 0
  let unchanged = 0
  let skippedMissingV = 0

  await Promise.all(
    files.map(async (filePath) => {
      const calls = parseTCalls(filePath)
      if (calls.length === 0) return

      let source = readFileSync(filePath, 'utf-8')
      let offset = 0
      let fileUpdated = false

      // Only process calls that already have a _v prop — sort front-to-back
      const withV = calls
        .filter((c) => c.hasVProp && c.vValueRange !== null)
        .sort((a, b) => a.vValueRange![0] - b.vValueRange![0])

      skippedMissingV += calls.filter((c) => !c.hasVProp).length

      for (const call of withV) {
        const expected = fnv1a(call.en)
        if (call.currentHash === expected) {
          unchanged++
          continue
        }

        const [start, end] = call.vValueRange!
        // Determine quote style from the existing value in source
        const existingChar = source[start + offset]
        const quote = existingChar === '"' ? '"' : "'"
        const replacement = `${quote}${expected}${quote}`

        source =
          source.slice(0, start + offset) +
          replacement +
          source.slice(end + offset)
        offset += replacement.length - (end - start)
        fileUpdated = true
      }

      if (fileUpdated) {
        writeFileSync(filePath, source)
        updated++
        if (!options.quiet) console.log(`  updated: ${filePath}`)
      }
    }),
  )

  return { updated, unchanged, skippedMissingV }
}
