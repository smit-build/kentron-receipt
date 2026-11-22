import { useState } from "react"
import { Tick02Icon } from "hugeicons-react"
import { useStore } from "@/lib/store"
import { getSuggestedApps } from "@/lib/data/intent-apps"
import { integrations } from "@/lib/integrations"
import { AppLogo } from "@/components/app-logo"
import { AppConnectFlow } from "@/components/app-connect-flow"
import { cn } from "@/lib/utils"

interface StepAppsProps {
  workspaceId: string
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

function getInitials(name: string): string {
  const found = integrations.find((i) => i.name === name)
  return found?.initials ?? name.slice(0, 2).toUpperCase()
}

export function StepApps({ workspaceId, onNext, onSkip }: StepAppsProps) {
  const { state } = useStore()
  const suggestedIds = getSuggestedApps(state.intent)
  const activeWs = state.workspaces.find((w) => w.id === workspaceId)
  const connectedIds = activeWs?.connectedApps.map((a) => a.appId) ?? []

  const [connectingApp, setConnectingApp] = useState<string | null>(null)

  const hasConnected = connectedIds.length > 0

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">
        Connect your first app
      </h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground">
        Connect with one click. You choose exactly which actions agents can take.
      </p>

      <div className="mt-6 flex flex-col divide-y divide-border rounded-lg border border-border">
        {suggestedIds.map((appId) => {
          const connected = connectedIds.includes(appId)
          return (
            <div key={appId} className="flex items-center gap-3 px-4 py-3">
              <AppLogo name={appId} initials={getInitials(appId)} className="size-7 shrink-0" />
              <span className="flex-1 text-[13px] font-medium">{appId}</span>

              {connected ? (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Tick02Icon className="size-3.5" />
                  <span className="text-[12px]">Connected</span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setConnectingApp(appId)}
                    className="rounded-md border border-border px-3 py-1 text-[12px] font-medium hover:bg-muted"
                  >
                    Connect
                  </button>
                  <AppConnectFlow
                    appId={appId}
                    workspaceId={workspaceId}
                    open={connectingApp === appId}
                    onOpenChange={(v) => { if (!v) setConnectingApp(null) }}
                    onConnected={() => setConnectingApp(null)}
                  />
                </>
              )}
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-[12px] text-muted-foreground">
        {connectedIds.length} of {suggestedIds.length} apps connected
      </p>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onSkip}
          className="text-[13px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasConnected}
          className={cn(
            "rounded-md bg-foreground px-4 py-1.5 text-[13px] font-medium text-background",
            "hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
