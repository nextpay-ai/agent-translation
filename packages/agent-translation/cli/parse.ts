import { parse } from '@typescript-eslint/typescript-estree'
import type { TSESTree } from '@typescript-eslint/typescript-estree'
import { readFileSync } from 'node:fs'

export interface TCall {
  file: string
  line: number
  column: number
  en: string
  currentHash: string | null
  locales: Record<string, string> // locale → value (string only, not JSX)
  ctx: string | null
  tone: string | null
  /** Byte range of the _v value literal in the source, for in-place rewriting */
  vValueRange: [number, number] | null
  /** Whether _v property exists at all */
  hasVProp: boolean
  /** Byte range of the entire _v property (including key), for insertion context */
  vPropRange: [number, number] | null
  isSkip: boolean
}

function getStringValue(node: TSESTree.Expression): string | null {
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value
  if (node.type === 'TemplateLiteral' && node.quasis.length === 1) {
    return node.quasis[0].value.raw
  }
  return null
}

/**
 * Parse a TypeScript/TSX source file and extract all t({}) call sites.
 * Only handles string translations (not JSX props — those are handled separately).
 */
export function parseTCalls(filePath: string): TCall[] {
  const source = readFileSync(filePath, 'utf-8')
  let ast: TSESTree.Program
  try {
    ast = parse(source, {
      jsx: filePath.endsWith('.tsx') || filePath.endsWith('.jsx'),
      range: true,
      loc: true,
    })
  } catch {
    return []
  }

  const calls: TCall[] = []

  function walk(node: TSESTree.Node) {
    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'Identifier' &&
      node.callee.name === 't' &&
      node.arguments.length === 1 &&
      node.arguments[0].type === 'ObjectExpression'
    ) {
      const obj = node.arguments[0] as TSESTree.ObjectExpression
      let en: string | null = null
      let currentHash: string | null = null
      let ctx: string | null = null
      let tone: string | null = null
      let vValueRange: [number, number] | null = null
      let vPropRange: [number, number] | null = null
      let hasVProp = false
      let isSkip = false
      const locales: Record<string, string> = {}

      for (const prop of obj.properties) {
        if (prop.type !== 'Property') continue
        if (prop.key.type !== 'Identifier' && prop.key.type !== 'Literal') continue
        const key = prop.key.type === 'Identifier' ? prop.key.name : String((prop.key as TSESTree.Literal).value)
        const val = getStringValue(prop.value as TSESTree.Expression)

        if (key === 'en' && val !== null) en = val
        else if (key === '_v') {
          hasVProp = true
          if (val !== null) currentHash = val
          if (prop.value.range) vValueRange = prop.value.range as [number, number]
          if (prop.range) vPropRange = prop.range as [number, number]
        }
        else if (key === 'ctx' && val !== null) ctx = val
        else if (key === 'tone' && val !== null) tone = val
        else if (key === '__skip') isSkip = true
        else if (val !== null && !['locale', 'reason'].includes(key)) locales[key] = val
      }

      if (en !== null && !isSkip) {
        calls.push({
          file: filePath,
          line: node.loc!.start.line,
          column: node.loc!.start.column,
          en,
          currentHash,
          locales,
          ctx,
          tone,
          vValueRange,
          hasVProp,
          vPropRange,
          isSkip,
        })
      }
    }

    for (const key of Object.keys(node)) {
      const child = (node as any)[key]
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          child.forEach((c) => c && typeof c.type === 'string' && walk(c))
        } else if (typeof child.type === 'string') {
          walk(child)
        }
      }
    }
  }

  walk(ast)
  return calls
}

/** Glob TypeScript/TSX files in a directory, excluding node_modules */
export async function findSourceFiles(dir: string): Promise<string[]> {
  const { glob } = await import('glob')
  return glob(`${dir}/**/*.{ts,tsx}`, {
    ignore: ['**/node_modules/**', '**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
  })
}
