import { expect, test, beforeEach } from 'bun:test'
import { t, setActiveLocale, clearActiveLocale } from '../src/translate'

// Simulate a registered config with 'en' | 'ph' locales
// In real usage this comes from module augmentation in translate.config.ts
const enPhMap = { en: 'Hello', ph: 'Kamusta', _v: 'a1b2c3d4' }

beforeEach(() => {
  clearActiveLocale()
})

test('returns en value when no locale set (fallback)', () => {
  expect(t(enPhMap)).toBe('Hello')
})

test('returns ph value when locale is set to ph', () => {
  setActiveLocale('ph')
  expect(t(enPhMap)).toBe('Kamusta')
})

test('explicit locale option overrides active locale', () => {
  setActiveLocale('ph')
  expect(t({ ...enPhMap, locale: 'en' })).toBe('Hello')
})

test('falls back to en when locale has no matching key', () => {
  setActiveLocale('es' as never)
  expect(t(enPhMap)).toBe('Hello')
})

test('works with skip result', () => {
  const skipped = { __skip: true as const, en: 'NextPay', reason: 'Brand name' }
  expect(t(skipped)).toBe('NextPay')
  setActiveLocale('ph')
  expect(t(skipped)).toBe('NextPay') // same for all locales
})
