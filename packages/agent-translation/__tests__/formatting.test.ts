import { expect, test } from 'bun:test'
import {
  formatCurrency,
  formatDateTime,
  formatList,
  getLocaleName,
  getLocaleNativeName,
  getLocaleEmoji,
  toBcp47,
} from '../src/formatting'

test('toBcp47 maps ph to fil', () => {
  expect(toBcp47('ph')).toBe('fil')
})

test('toBcp47 passes through known BCP 47 tags', () => {
  expect(toBcp47('en')).toBe('en')
  expect(toBcp47('es')).toBe('es')
})

test('formatCurrency formats PHP', () => {
  const result = formatCurrency(1999.99, 'PHP', { locale: 'en' })
  expect(result).toContain('1,999.99')
})

test('formatCurrency formats with ph locale', () => {
  const result = formatCurrency(1999.99, 'PHP', { locale: 'ph' })
  expect(result).toContain('1,999.99')
})

test('getLocaleName returns English name', () => {
  expect(getLocaleName('es')).toBe('Spanish')
})

test('getLocaleNativeName returns native name', () => {
  expect(getLocaleNativeName('es')).toBe('español')
})

test('getLocaleEmoji returns flag emoji for ph', () => {
  expect(getLocaleEmoji('ph')).toBe('🇵🇭')
})

test('getLocaleEmoji returns flag emoji for es', () => {
  expect(getLocaleEmoji('es')).toBe('🇪🇸')
})

test('formatList joins with conjunction', () => {
  const result = formatList(['a', 'b', 'c'], { locale: 'en', type: 'conjunction' })
  expect(result).toBe('a, b, and c')
})

test('formatDateTime returns a string', () => {
  const result = formatDateTime(new Date('2024-01-15'), { locale: 'en', dateStyle: 'long' })
  expect(typeof result).toBe('string')
  expect(result.length).toBeGreaterThan(0)
})
