import { useState } from "react"
import {
  Add01Icon,
  UserAdd01Icon,
} from "hugeicons-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { WorkspaceDashboard } from "@/components/workspace-dashboard"
import { WorkspaceIntegrations } from "@/components/workspace-integrations"
import { WorkspaceSettings } from "@/components/workspace-settings"
import { ConnectClientDialog } from "@/components/connect-client-dialog"
import { useStore } from "@/lib/store"

interface WorkspaceShellProps {
  name: string
  onNavigateToChat?: () => void
}

export function WorkspaceShell({ name, onNavigateToChat }: WorkspaceShellProps) {
  const { state, dispatch } = useStore()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [connectClientOpen, setConnectClientOpen] = useState(false)

  const activeWs = state.workspaces.find((w) => w.id === state.activeWorkspaceId)
  const workspaceId = activeWs?.id ?? ""
  const isSample = activeWs?.isSample ?? false
  const clientCount = activeWs?.connectedClients?.length ?? 0
  const appCount = activeWs?.connectedApps?.length ?? 0

  // Find the user's real workspace for the "Go to…" link
  const realWs = state.workspaces.find((w) => !w.isSample)

  function goToRealWorkspace() {
    if (realWs) {
      dispatch({ type: "SET_ACTIVE_WORKSPACE", payload: realWs.id })
    }
  }

  // Dashboard action callbacks
  const dashboardCallbacks = {
    onConnectApp: isSample ? undefined : () => setActiveTab("integrations"),
    onAddKey: isSample ? undefined : () => setActiveTab("settings"),
    onFirstPrompt: onNavigateToChat,
    onInvite: isSample ? undefined : () => setActiveTab("settings"),
    onConnectClient: isSample ? undefined : () => setConnectClientOpen(true),
  }

  return (
    <div className="flex min-h-svh flex-1 flex-col">
      {/* Sample workspace banner */}
      {isSample && !state.sampleWorkspaceHidden && (
        <div className="flex items-center justify-between gap-4 border-b border-border bg-muted/40 px-6 py-2">
          <span className="text-[12px] text-muted-foreground">
            You&rsquo;re exploring sample data. Nothing here is real.
            {realWs && (
              <>
                {" "}
                <button
                  type="button"
                  onClick={goToRealWorkspace}
                  className="font-medium text-foreground underline underline-offset-2 hover:no-underline"
                >
                  Go to {realWs.name}
                </button>
              </>
            )}
          </span>
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_SAMPLE_WORKSPACE_HIDDEN", payload: true })}
            className="shrink-0 text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Hide sample workspace
          </button>
        </div>
      )}

      <header className="flex h-10 shrink-0 items-center justify-between border-b border-border px-6">
        <nav className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <span>All workspaces</span>
          <span className="text-border">/</span>
          <span className="font-medium text-foreground">{name}</span>
        </nav>
        <Avatar className="size-7">
          <AvatarFallback className="text-[10px] font-bold">
            {state.user ? (state.user.firstName[0] ?? "S").toUpperCase() : "SU"}
          </AvatarFallback>
        </Avatar>
      </header>

      <div className="w-full max-w-[1600px] flex-1 px-6 py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex flex-wrap items-center gap-2.5 text-2xl font-semibold tracking-tight">
              {name}
              {!isSample && appCount > 0 && (
                <Badge variant="secondary" className="gap-1.5 font-medium">
                  <span className="size-1.5 rounded-full bg-foreground" />
                  Endpoint live
                </Badge>
              )}
              {isSample && (
                <Badge variant="secondary" className="font-medium">Sample</Badge>
              )}
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {appCount > 0
                ? `Your AI clients reach ${appCount} connected app${appCount !== 1 ? "s" : ""} through this workspace.`
                : "Connect apps to let your AI clients take action here."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isSample ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button variant="outline" size="sm" disabled>
                      <UserAdd01Icon data-icon="inline-start" />
                      Invite
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Not available in the sample workspace</TooltipContent>
              </Tooltip>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setActiveTab("settings")}>
                <UserAdd01Icon data-icon="inline-start" />
                Invite
              </Button>
            )}

            {isSample ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button disabled>
                      <Add01Icon data-icon="inline-start" />
                      Connect client
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Not available in the sample workspace</TooltipContent>
              </Tooltip>
            ) : (
              <Button onClick={() => setConnectClientOpen(true)}>
                <Add01Icon data-icon="inline-start" />
                Connect client
                {clientCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{clientCount}</Badge>
                )}
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-5">
            <TabsList variant="line" className="h-auto bg-transparent p-0">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <WorkspaceDashboard {...dashboardCallbacks} />
          </TabsContent>
          <TabsContent value="integrations">
            <WorkspaceIntegrations />
          </TabsContent>
          <TabsContent value="settings">
            <WorkspaceSettings onConnectClient={() => setConnectClientOpen(true)} />
          </TabsContent>
        </Tabs>
      </div>

      <ConnectClientDialog
        workspaceId={workspaceId}
        workspaceName={name}
        open={connectClientOpen}
        onOpenChange={setConnectClientOpen}
      />
    </div>
  )
}
