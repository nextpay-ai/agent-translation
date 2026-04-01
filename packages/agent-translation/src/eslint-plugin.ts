/**
 * @module
 *
 * ESLint plugin for `@nextpay-ai/agent-translation`.
 *
 * Provides the `no-stale-hash` rule, which errors when a `_v` hash in a `t()`
 * call no longer matches the `en` value. Auto-fixable.
 *
 * @example
 * ```js
 * import agentTranslation from '@nextpay-ai/agent-translation/eslint'
 *
 * export default [
 *   { plugins: { 'agent-translation': agentTranslation },
 *     rules: { 'agent-translation/no-stale-hash': 'error' } }
 * ]
 * ```
 */
import { RuleCreator } from '@typescript-eslint/utils/eslint-utils'
import { fnv1a } from './hash'

const createRule = RuleCreator(
  (name) => `https://github.com/nextpay-ai/agent-translation/blob/main/docs/rules/${name}.md`,
)

const noStaleHashRule = createRule({
  name: 'no-stale-hash',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that _v hashes match the en translation string',
    },
    messages: {
      staleHash:
        '_v hash "{{actual}}" does not match expected "{{expected}}" for en value "{{en}}". Run `npx agent-translation sync` to fix.',
    },
    schema: [],
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        // Match: t({ ... })
        if (
          node.callee.type !== 'Identifier' ||
          node.callee.name !== 't' ||
          node.arguments.length !== 1 ||
          node.arguments[0].type !== 'ObjectExpression'
        ) {
          return
        }

        const objExpr = node.arguments[0]
        let enValue: string | null = null
        let vValue: string | null = null
        let vNode: any = null

        for (const prop of objExpr.properties) {
          if (prop.type !== 'Property') continue
          if (prop.key.type !== 'Identifier' && prop.key.type !== 'Literal') continue

          const key =
            prop.key.type === 'Identifier' ? prop.key.name : String(prop.key.value)

          if (key === 'en' && prop.value.type === 'Literal' && typeof prop.value.value === 'string') {
            enValue = prop.value.value
          }
          if (key === '_v' && prop.value.type === 'Literal' && typeof prop.value.value === 'string') {
            vValue = prop.value.value
            vNode = prop
          }
        }

        if (enValue === null || vValue === null || vValue === '') return

        const expected = fnv1a(enValue)
        if (vValue !== expected) {
          context.report({
            node: vNode,
            messageId: 'staleHash',
            data: { actual: vValue, expected, en: enValue },
            fix(fixer) {
              return fixer.replaceText(vNode.value, `'${expected}'`)
            },
          })
        }
      },
    }
  },
})

interface ESLintPlugin {
  rules: Record<string, unknown>
  configs: Record<string, { rules: Record<string, string> }>
}

const plugin: ESLintPlugin = {
  rules: {
    'no-stale-hash': noStaleHashRule,
  },
  configs: {
    recommended: {
      rules: {
        'agent-translation/no-stale-hash': 'error',
      },
    },
  },
}

export default plugin
