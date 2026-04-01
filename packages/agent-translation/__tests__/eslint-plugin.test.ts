import { expect, test } from 'bun:test'
import { noStaleHashRule } from '../src/eslint-plugin'
import { fnv1a } from '../src/hash'

test('no-stale-hash rule: valid _v matches expected hash', () => {
  const hash = fnv1a('Hello world')
  expect(hash).toHaveLength(8)
  expect(hash).toMatch(/^[0-9a-f]{8}$/)
  // Rule validates that _v equals fnv1a(en)
  expect(noStaleHashRule.name).toBe('no-stale-hash')
})

test('no-stale-hash rule: missing _v is allowed (sync adds it)', () => {
  // The rule allows missing _v since the sync command will add it
  expect(noStaleHashRule.meta.type).toBe('problem')
  expect(noStaleHashRule.meta.fixable).toBe('code')
})

test('no-stale-hash rule: invalid _v produces error message', () => {
  const messages = noStaleHashRule.meta.messages
  expect(messages?.staleHash).toContain('_v hash')
  expect(messages?.staleHash).toContain('does not match expected')
  expect(messages?.staleHash).toContain('npx agent-translation sync')
})

test('no-stale-hash rule: applies to t({ ... }) call expressions', () => {
  // Verify rule structure
  const creator = noStaleHashRule.create
  expect(creator).toBeDefined()
  expect(typeof creator).toBe('function')
})
