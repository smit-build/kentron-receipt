import { useReducer, useEffect, type ReactNode } from "react"
import { StoreContext, reducer, loadState, saveState } from "@/lib/store"

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  return <StoreContext value={{ state, dispatch }}>{children}</StoreContext>
}
