/**
 * Minimal type stubs for @base-ui-components/react peer dependency.
 * The real types are provided by the host app; these stubs keep our own
 * typecheck clean when the peer is not installed in devDependencies.
 */
declare module '@base-ui-components/react/select' {
  import type * as React from 'react'

  interface RootProps {
    value?: string
    onValueChange?: (value: string | null) => void
    children?: React.ReactNode
    [key: string]: unknown
  }

  interface SharedProps {
    children?: React.ReactNode
    className?: string
    [key: string]: unknown
  }

  interface SideProps extends SharedProps {
    side?: string
    align?: string
    sideOffset?: number
  }

  export const Select: {
    Root: React.FC<RootProps>
    Trigger: React.FC<SharedProps & { 'aria-label'?: string }>
    Value: React.FC<SharedProps>
    Portal: React.FC<SharedProps>
    Positioner: React.FC<SideProps>
    Popup: React.FC<SharedProps>
    List: React.FC<SharedProps>
    Item: React.FC<SharedProps & { value: string; key?: string }>
    ItemText: React.FC<SharedProps>
    ItemIndicator: React.FC<SharedProps>
  }
}
