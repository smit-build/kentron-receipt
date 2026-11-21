/**
 * Dev panel — only shown with ?dev=1 in the URL.
 * Provides tools to reset, seed, and simulate state during development.
 */
import { useStore, chatState } from "@/lib/store"
import { simulateClientCall } from "@/lib/services/clients"
import { Button } from "@/components/ui/button"

export function DevPanel() {
  const { state, dispatch } = useStore()
  const currentChatState = chatState(state)

  return (
    <div
      role="complementary"
      aria-label="Dev panel"
      className="fixed bottom-4 right-4 z-50 w-64 rounded-lg border border-border bg-background shadow-lg"
    >
      <div className="border-b border-border px-3 py-2">
        <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Dev panel
        </span>
      </div>

      <div className="flex flex-col gap-1 p-2">
        {/* Reset */}
        <Button
          size="sm"
          variant="outline"
          className="w-full justify-start text-[12px]"
          onClick={() => dispatch({ type: "RESET" })}
        >
          Reset onboarding
        </Button>

        {/* Chat state */}
        <div className="mt-1 border-t border-dashed border-border pt-2">
          <p className="mb-1 px-1 text-[11px] text-muted-foreground">
            Chat state: <strong>{currentChatState}</strong>
          </p>
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              variant={currentChatState === "no-apps" ? "default" : "outline"}
              className="w-full justify-start text-[12px]"
              onClick={() => {
                dispatch({ type: "SET_OPENAI_KEY", payload: { keyLast4: "1234" } })
                // Clear apps in active workspace
                if (state.activeWorkspaceId) {
                  const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId)
                  if (ws) {
                    for (const app of ws.connectedApps) {
                      dispatch({ type: "DISCONNECT_APP", payload: { workspaceId: ws.id, appId: app.appId } })
                    }
                  }
                }
              }}
            >
              Set: no-apps
            </Button>
            <Button
              size="sm"
              variant={currentChatState === "ready" ? "default" : "outline"}
              className="w-full justify-start text-[12px]"
              onClick={() => {
                dispatch({ type: "SET_OPENAI_KEY", payload: { keyLast4: "1234" } })
                if (state.activeWorkspaceId) {
                  dispatch({
                    type: "CONNECT_APP",
                    payload: {
                      workspaceId: state.activeWorkspaceId,
                      app: { appId: "GitHub", enabledTools: ["list_prs", "get_pr"] },
                    },
                  })
                }
              }}
            >
              Set: ready
            </Button>
          </div>
        </div>

        {/* Simulate client call */}
        <div className="mt-1 border-t border-dashed border-border pt-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start text-[12px]"
            onClick={simulateClientCall}
          >
            Simulate client call
          </Button>
        </div>

        {/* Show all features */}
        <div className="mt-1 border-t border-dashed border-border pt-2">
          <Button
            size="sm"
            variant={state.showAllFeatures ? "default" : "outline"}
            className="w-full justify-start text-[12px]"
            onClick={() =>
              dispatch({ type: "SET_SHOW_ALL_FEATURES", payload: !state.showAllFeatures })
            }
          >
            {state.showAllFeatures ? "Hide all features" : "Show all features"}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Returns true if ?dev=1 is in the URL. */
export function isDevMode(): boolean {
  if (typeof window === "undefined") return false
  return new URLSearchParams(window.location.search).get("dev") === "1"
}
