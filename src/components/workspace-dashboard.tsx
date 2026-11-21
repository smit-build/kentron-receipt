/**
 * Workspace dashboard. Three states:
 * - No apps connected → empty state with compact diagram
 * - Apps but no receipts → "No activity yet" empty state
 * - Has data → setup card + stats + charts
 */
import { useStore } from "@/lib/store"
import { CallsChart } from "@/components/calls-chart"
import { UsageByApp } from "@/components/usage-by-app"
import { WorkspaceSetupCard } from "@/components/workspace-setup-card"
import { HowReceiptWorks } from "@/components/how-receipt-works"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface WorkspaceDashboardProps {
  onConnectApp?: () => void
  onAddKey?: () => void
  onFirstPrompt?: () => void
  onInvite?: () => void
  onConnectClient?: () => void
}

export function WorkspaceDashboard({
  onConnectApp,
  onAddKey,
  onFirstPrompt,
  onInvite,
  onConnectClient,
}: WorkspaceDashboardProps) {
  const { state } = useStore()
  const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId)
  const wsName = ws?.name ?? "Your workspace"
  const connectedApps = ws?.connectedApps ?? []
  const realReceipts = state.receipts.filter(
    (r) => r.workspaceId === ws?.id && !r.isSample
  )

  const hasApps = connectedApps.length > 0
  const hasReceipts = realReceipts.length > 0
  const isSample = ws?.isSample ?? false

  // No apps connected
  if (!hasApps && !isSample) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <WorkspaceSetupCard
          onConnectApp={onConnectApp}
          onAddKey={onAddKey}
          onFirstPrompt={onFirstPrompt}
          onInvite={onInvite}
          onConnectClient={onConnectClient}
        />
        <div>
          <p className="mb-1 text-[13px] font-medium text-foreground">No apps connected yet</p>
          <p className="mb-4 text-[13px] text-muted-foreground">
            Connect an app so agents in this workspace can use it. Every call is checked and recorded.
          </p>
          <HowReceiptWorks
            size="compact"
            workspaceName={wsName}
            className="max-w-lg"
          />
          {onConnectApp && (
            <Button size="sm" className="mt-4" onClick={onConnectApp}>
              Connect apps
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Apps but no receipts (real workspace only)
  if (hasApps && !hasReceipts && !isSample) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <WorkspaceSetupCard
          onConnectApp={onConnectApp}
          onAddKey={onAddKey}
          onFirstPrompt={onFirstPrompt}
          onInvite={onInvite}
          onConnectClient={onConnectClient}
        />
        <div>
          <p className="mb-1 text-[13px] font-medium text-foreground">No activity yet</p>
          <p className="mb-4 text-[13px] text-muted-foreground">
            Run a prompt in Chat or connect an AI client. Calls and their receipts show up here.
          </p>
          <div className="flex gap-2">
            {onFirstPrompt && (
              <Button size="sm" onClick={onFirstPrompt}>Open Chat</Button>
            )}
            {onConnectClient && (
              <Button size="sm" variant="outline" onClick={onConnectClient}>Connect client</Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Has data (sample workspace or real workspace with receipts)
  const appCount = connectedApps.length
  const toolCount = connectedApps.reduce((sum, a) => sum + a.enabledTools.length, 0)
  const receiptCount = isSample
    ? state.receipts.filter((r) => r.workspaceId === ws?.id).length
    : realReceipts.length
  const blockedCount = (isSample
    ? state.receipts.filter((r) => r.workspaceId === ws?.id)
    : realReceipts
  ).reduce((sum, r) => sum + r.steps.filter((s) => s.status === "blocked").length, 0)

  const stats = [
    { label: "Connected apps", value: String(appCount), sub: "In this workspace" },
    { label: "Tools enabled", value: String(toolCount), sub: "Agents see only these" },
    { label: "Receipts", value: String(receiptCount), sub: isSample ? "Sample data" : "Total recorded" },
    {
      label: "Blocked by policy",
      value: String(blockedCount),
      sub: blockedCount > 0 ? "Review guardrails" : "All clear",
      subEmphasis: blockedCount > 0,
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <WorkspaceSetupCard
        onConnectApp={onConnectApp}
        onAddKey={onAddKey}
        onFirstPrompt={onFirstPrompt}
        onInvite={onInvite}
        onConnectClient={onConnectClient}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="gap-1 py-3.5">
            <CardContent className="px-4">
              <div className="text-[12px] text-muted-foreground">{stat.label}</div>
              <div className="mt-0.5 text-2xl leading-8 font-semibold tracking-tight">
                {stat.value}
              </div>
              <div className={stat.subEmphasis ? "text-[12px] font-medium text-foreground" : "text-[12px] text-muted-foreground"}>
                {stat.sub}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <CallsChart />
        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">Usage by app</CardTitle>
            <CardDescription className="text-[12px]">Tool calls per connected app</CardDescription>
            <CardAction>
              {onFirstPrompt && (
                <Button variant="ghost" size="sm" onClick={onFirstPrompt}>
                  View activity
                </Button>
              )}
            </CardAction>
          </CardHeader>
          <CardContent className="px-4">
            <UsageByApp />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
