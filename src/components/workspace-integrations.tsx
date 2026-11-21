import { useMemo, useState } from "react"
import { Search01Icon } from "hugeicons-react"
import { Input } from "@/components/ui/input"
import { IntegrationCard } from "@/components/integration-card"
import { AppConnectFlow } from "@/components/app-connect-flow"
import {
  integrations,
  categoryFilters,
  methodFilters,
  type IntegrationCategory,
  type AuthMethod,
} from "@/lib/integrations"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

type StatusFilter = "All" | "Available" | "Coming soon"

export function WorkspaceIntegrations() {
  const { state, dispatch } = useStore()
  const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId)
  const isSample = ws?.isSample ?? false
  const connectedIds = ws?.connectedApps.map((a) => a.appId) ?? []

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [category, setCategory] = useState<IntegrationCategory | "All">("All")
  const [method, setMethod] = useState<AuthMethod | "All methods">("All methods")
  const [connectingApp, setConnectingApp] = useState<string | null>(null)

  const matches = useMemo(() => {
    return integrations.filter((i) => {
      if (query && !i.name.toLowerCase().includes(query.toLowerCase())) return false
      if (category !== "All" && i.category !== category) return false
      if (method !== "All methods" && i.method !== method) return false
      return true
    })
  }, [query, category, method])

  const connected = matches.filter((i) => connectedIds.includes(i.name))
  const available = matches.filter((i) => i.status === "available" && !connectedIds.includes(i.name))
  const comingSoon = matches.filter((i) => i.status === "coming-soon")

  function handleDisconnect(appId: string) {
    if (!ws) return
    dispatch({ type: "DISCONNECT_APP", payload: { workspaceId: ws.id, appId } })
  }

  const noResults = connected.length === 0 && available.length === 0 && comingSoon.length === 0

  const statusPills: StatusFilter[] = ["All", "Available", "Coming soon"]

  return (
    <div className="flex flex-col gap-4">
      {/* Search + filters */}
      <div className="flex flex-col gap-3">
        <div className="relative max-w-sm">
          <Search01Icon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search integrations"
            className="h-8 bg-background pl-8 text-[12.5px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {statusPills.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                "h-7 rounded-full border border-border px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground",
                statusFilter === s && "border-foreground bg-foreground text-background hover:text-background"
              )}
            >
              {s}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-border" />
          {categoryFilters.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c === category ? "All" : c)}
              className={cn(
                "h-7 rounded-full border border-border px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground",
                category === c && "border-foreground bg-foreground text-background hover:text-background"
              )}
            >
              {c}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-border" />
          {methodFilters.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m === method ? "All methods" : m)}
              className={cn(
                "h-7 rounded-full border border-border px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground",
                method === m && "border-foreground bg-foreground text-background hover:text-background"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {noResults && (
        <p className="py-8 text-center text-[13px] text-muted-foreground">
          {query ? `No apps match "${query}". Try another name.` : "No integrations match these filters."}
        </p>
      )}

      {/* Connected group */}
      {(statusFilter === "All") && connected.length > 0 && (
        <Section label="Connected" count={connected.length}>
          {connected.map((i) => (
            <IntegrationCard
              key={i.name}
              {...i}
              isConnected
              disabled={isSample}
              onDisconnect={() => handleDisconnect(i.name)}
            />
          ))}
        </Section>
      )}

      {(statusFilter === "All") && connected.length === 0 && !query && (
        <div className="py-2 text-[13px] text-muted-foreground">
          No apps connected in this workspace.{" "}
        </div>
      )}

      {/* Available group */}
      {(statusFilter === "All" || statusFilter === "Available") && available.length > 0 && (
        <Section label="Available" count={available.length}>
          {available.map((i) => (
            <>
              <IntegrationCard
                key={i.name}
                {...i}
                isConnected={false}
                disabled={isSample}
                onConnect={isSample ? undefined : () => setConnectingApp(i.name)}
              />
              {!isSample && (
                <AppConnectFlow
                  key={`flow-${i.name}`}
                  appId={i.name}
                  workspaceId={ws?.id ?? ""}
                  open={connectingApp === i.name}
                  onOpenChange={(v) => { if (!v) setConnectingApp(null) }}
                  onConnected={() => setConnectingApp(null)}
                />
              )}
            </>
          ))}
        </Section>
      )}

      {/* Coming soon group */}
      {(statusFilter === "All" || statusFilter === "Coming soon") && comingSoon.length > 0 && (
        <Section label="Coming soon" count={comingSoon.length}>
          {comingSoon.map((i) => (
            <IntegrationCard
              key={i.name}
              {...i}
              isConnected={false}
              onNotify={() => {}}
            />
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-[11px] text-muted-foreground">{count}</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  )
}
