'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'
import { type CVListStore, createCVListStore } from '@/stores/cvListStore'

export type CVListStoreApi = ReturnType<typeof createCVListStore>
export const CVListStoreContext = createContext<CVListStoreApi | undefined>(
  undefined,
)
export interface CVListStoreProviderProps {
  children: ReactNode
}
export const CVListStoreProvider = ({
  children,
}: CVListStoreProviderProps) => {
  const storeRef = useRef<CVListStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createCVListStore()
  }

  return (
    <CVListStoreContext.Provider value={storeRef.current}>
      {children}
    </CVListStoreContext.Provider>
  )
}
export const useCVListStore = <T,>(
  selector: (store: CVListStore) => T,
): T => {
  const cvListContext = useContext(CVListStoreContext)

  if (!cvListContext) {
    throw new Error(`useCVListStore must be used within CVListStoreProvider`)
  }

  return useStore(cvListContext, selector)
}
