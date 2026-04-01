import { expect, test } from 'bun:test'
import { fnv1a } from '../src/hash'

test('produces 8-char lowercase hex', () => {
  const result = fnv1a('hello')
  expect(result).toHaveLength(8)
  expect(result).toMatch(/^[0-9a-f]{8}$/)
})

test('is deterministic', () => {
  expect(fnv1a('hello')).toBe(fnv1a('hello'))
})

test('different inputs produce different hashes', () => {
  expect(fnv1a('hello')).not.toBe(fnv1a('world'))
})

test('empty string produces valid hash', () => {
  const result = fnv1a('')
  expect(result).toHaveLength(8)
})

test('known vector: empty string', () => {
  // FNV-1a 32-bit of "" = 0x811c9dc5
  expect(fnv1a('')).toBe('811c9dc5')
})

test('known vector: "a"', () => {
  // FNV-1a 32-bit of "a" = 0xe40c292c
  expect(fnv1a('a')).toBe('e40c292c')
})
