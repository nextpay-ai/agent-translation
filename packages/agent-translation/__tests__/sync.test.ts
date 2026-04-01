import { expect, test, beforeEach, afterEach } from 'bun:test'
import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { runSync } from '../cli/sync'
import { fnv1a } from '../src/hash'

const tmpDir = '/tmp/agent-translation-test-sync'

beforeEach(() => {
  mkdirSync(tmpDir, { recursive: true })
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

test('sync rewrites stale _v in-place', async () => {
  const hash = fnv1a('Hello world')
  const source = `
import { t } from '@nextpay-ai/agent-translation'
const x = t({ en: 'Hello world', ph: 'Kamusta', _v: 'deadbeef' })
`.trim()

  const filePath = join(tmpDir, 'test.ts')
  writeFileSync(filePath, source)

  await runSync({ dir: tmpDir })

  const result = readFileSync(filePath, 'utf-8')
  expect(result).toContain(`_v: '${hash}'`)
  expect(result).not.toContain("_v: 'deadbeef'")
})

test('sync leaves correct _v unchanged', async () => {
  const hash = fnv1a('Hello world')
  const source = `const x = t({ en: 'Hello world', ph: 'Kamusta', _v: '${hash}' })`

  const filePath = join(tmpDir, 'test.ts')
  writeFileSync(filePath, source)
  const before = readFileSync(filePath, 'utf-8')

  await runSync({ dir: tmpDir })

  const after = readFileSync(filePath, 'utf-8')
  expect(after).toBe(before)
})

test('sync skips calls with missing _v — check handles those', async () => {
  const source = `const x = t({ en: 'Hello', ph: 'Kamusta' })`
  const filePath = join(tmpDir, 'test.ts')
  writeFileSync(filePath, source)
  const before = readFileSync(filePath, 'utf-8')

  const result = await runSync({ dir: tmpDir })

  const after = readFileSync(filePath, 'utf-8')
  expect(after).toBe(before) // file unchanged
  expect(result.skippedMissingV).toBe(1)
})

test('sync preserves quote style of existing _v', async () => {
  const source = `const x = t({ en: 'Hello', ph: 'Kamusta', _v: "deadbeef" })`
  const filePath = join(tmpDir, 'test.ts')
  writeFileSync(filePath, source)

  await runSync({ dir: tmpDir })

  const updated = readFileSync(filePath, 'utf-8')
  expect(updated).toContain(`_v: "${fnv1a('Hello')}"`) // double quotes preserved
})
