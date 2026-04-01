import { expect, test, beforeEach, afterEach } from 'bun:test'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { runCheck } from '../cli/check'
import { fnv1a } from '../src/hash'

const tmpDir = '/tmp/agent-translation-test-check'

beforeEach(() => {
  mkdirSync(tmpDir, { recursive: true })
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

test('check detects stale hash', async () => {
  const source = `const x = t({ en: 'Hello', ph: 'Kamusta', _v: 'deadbeef' })`
  writeFileSync(join(tmpDir, 'test.ts'), source)

  const result = await runCheck({ dir: tmpDir, locales: ['en', 'ph'] })

  expect(result.errors).toHaveLength(1)
  expect(result.errors[0].type).toBe('stale-hash')
  expect(result.errors[0].en).toBe('Hello')
  expect(result.errors[0].currentHash).toBe('deadbeef')
  expect(result.errors[0].expectedHash).toBe(fnv1a('Hello'))
  // locales field must be present per spec JSON schema
  expect(result.errors[0].locales).toEqual(['en', 'ph'])
})

test('check detects missing locale', async () => {
  const hash = fnv1a('Hello')
  const source = `const x = t({ en: 'Hello', _v: '${hash}' })`
  writeFileSync(join(tmpDir, 'test.ts'), source)

  const result = await runCheck({ dir: tmpDir, locales: ['en', 'ph'] })

  expect(result.errors).toHaveLength(1)
  expect(result.errors[0].type).toBe('missing-locale')
  expect(result.errors[0].missingLocales).toContain('ph')
})

test('check returns empty errors for valid file', async () => {
  const hash = fnv1a('Hello')
  const source = `const x = t({ en: 'Hello', ph: 'Kamusta', _v: '${hash}' })`
  writeFileSync(join(tmpDir, 'test.ts'), source)

  const result = await runCheck({ dir: tmpDir, locales: ['en', 'ph'] })

  expect(result.errors).toHaveLength(0)
})

test('check summary counts are correct', async () => {
  const hash = fnv1a('Hello')
  const source = `
const a = t({ en: 'Hello', ph: 'Kamusta', _v: '${hash}' })
const b = t({ en: 'World', ph: 'Mundo', _v: 'deadbeef' })
const c = t({ en: 'Foo', _v: '${fnv1a('Foo')}' })
`.trim()
  writeFileSync(join(tmpDir, 'test.ts'), source)

  const result = await runCheck({ dir: tmpDir, locales: ['en', 'ph'] })

  expect(result.summary.staleHash).toBe(1)
  expect(result.summary.missingLocale).toBe(1)
  expect(result.summary.files).toBe(1)
})
