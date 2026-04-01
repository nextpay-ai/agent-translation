// Re-export everything from the core React module so consumers
// only need to install @nextpay-ai/agent-translation-ui.
export {
  TranslateProvider,
  useLocale,
  useT,
  Translate,
  Var,
  Plural,
} from '@nextpay-ai/agent-translation/react'

export { LocaleToggle } from './locale-toggle'
