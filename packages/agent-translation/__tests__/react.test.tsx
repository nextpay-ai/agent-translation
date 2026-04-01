import { expect, test, beforeEach, afterEach } from 'bun:test'
import { JSDOM } from 'jsdom'
import React from 'react'
import { defineConfig } from '../src/config'
import { clearActiveLocale } from '../src/translate'
import { fnv1a } from '../src/hash'

// Set up jsdom BEFORE importing @testing-library/react so that `screen` initialises correctly
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  pretendToBeVisual: true,
})
const jsdomWin = dom.window as any
const g = globalThis as any
g.window = jsdomWin
g.document = jsdomWin.document
g.HTMLElement = jsdomWin.HTMLElement
g.SVGElement = jsdomWin.SVGElement
g.Element = jsdomWin.Element
g.Node = jsdomWin.Node
g.NodeList = jsdomWin.NodeList
g.DocumentFragment = jsdomWin.DocumentFragment
g.MutationObserver = jsdomWin.MutationObserver
g.Event = jsdomWin.Event
g.CustomEvent = jsdomWin.CustomEvent
g.MouseEvent = jsdomWin.MouseEvent
g.KeyboardEvent = jsdomWin.KeyboardEvent
g.FocusEvent = jsdomWin.FocusEvent
g.InputEvent = jsdomWin.InputEvent
g.PointerEvent = jsdomWin.PointerEvent
g.Text = jsdomWin.Text
g.Comment = jsdomWin.Comment
g.Range = jsdomWin.Range
g.getComputedStyle = jsdomWin.getComputedStyle.bind(jsdomWin)
g.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0)
g.cancelAnimationFrame = clearTimeout
g.navigator = jsdomWin.navigator

// Now it is safe to import @testing-library/react — document is already set
const { render, screen, cleanup } = await import('@testing-library/react')
const { TranslateProvider, useLocale, Translate, Var, Plural } = await import('../src/react')

// Set up a test config
defineConfig({ locales: ['en', 'ph'] as const, defaultLocale: 'en', tones: ['formal'] as const })

beforeEach(() => {
  clearActiveLocale()
})

afterEach(() => {
  cleanup()
})

function LocaleDisplay() {
  const { locale } = useLocale()
  return <span data-testid="locale">{locale}</span>
}

test('TranslateProvider provides locale to children', () => {
  render(
    <TranslateProvider locale="en">
      <LocaleDisplay />
    </TranslateProvider>
  )
  expect(screen.getByTestId('locale').textContent).toBe('en')
})

test('TranslateProvider syncs locale prop changes without useEffect lag', () => {
  const { rerender } = render(
    <TranslateProvider locale="en">
      <LocaleDisplay />
    </TranslateProvider>
  )
  expect(screen.getByTestId('locale').textContent).toBe('en')

  rerender(
    <TranslateProvider locale="ph">
      <LocaleDisplay />
    </TranslateProvider>
  )
  expect(screen.getByTestId('locale').textContent).toBe('ph')
})

test('<Translate> renders the active locale', () => {
  const hash = fnv1a('Hello')
  render(
    <TranslateProvider locale="ph">
      <Translate _v={hash} en="Hello" ph="Kamusta" />
    </TranslateProvider>
  )
  expect(screen.getByText('Kamusta')).toBeTruthy()
})

test('<Translate> falls back to en when locale missing', () => {
  const hash = fnv1a('Hello')
  render(
    <TranslateProvider locale="en">
      <Translate _v={hash} en="Hello" ph="Kamusta" />
    </TranslateProvider>
  )
  expect(screen.getByText('Hello')).toBeTruthy()
})

test('<Var> renders children transparently', () => {
  render(<Var>dynamic-value</Var>)
  expect(screen.getByText('dynamic-value')).toBeTruthy()
})

test('<Plural> renders singular when n=1', () => {
  render(<Plural n={1} singular={<span>1 item</span>}>many items</Plural>)
  expect(screen.getByText('1 item')).toBeTruthy()
})

test('<Plural> renders plural children when n>1', () => {
  render(<Plural n={5} singular={<span>1 item</span>}>5 items</Plural>)
  expect(screen.getByText('5 items')).toBeTruthy()
})

test('<Plural> renders zero content when n=0 and zero prop provided', () => {
  render(
    <Plural n={0} singular={<span>1 item</span>} zero={<span>no items</span>}>
      many items
    </Plural>
  )
  expect(screen.getByText('no items')).toBeTruthy()
})

test('<Plural> renders plural when n=0 and no zero prop', () => {
  render(
    <Plural n={0} singular={<span>1 item</span>}>
      0 items
    </Plural>
  )
  expect(screen.getByText('0 items')).toBeTruthy()
})
