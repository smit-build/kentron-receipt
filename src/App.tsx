import { useCallback, useEffect, useRef, useState } from "react"
import { useStore, TOTAL_CREDITS } from "@/lib/store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { AppSidebar } from "@/components/app-sidebar"
import { SignUpScreen } from "@/components/onboarding/sign-up-screen"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { WorkspaceShell } from "@/components/workspace-shell"
import { WorkspacesEmpty } from "@/components/workspaces-empty"
import { WorkspaceCreateDialog } from "@/components/workspace-create-dialog"
import { DevPanel, isDevMode } from "@/components/dev-panel"
import { ChatScreen, CreditsExhaustedModal } from "@/components/chat-screen"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { buildSampleReceipts } from "@/lib/services/receipts"
import { defaultTools } from "@/lib/services/integrations-svc"

function App() {
  const { state, dispatch } = useStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const [showExhaustedModal, setShowExhaustedModal] = useState(false)
  const [offerExpiresAt] = useState(() => Date.now() + 48 * 60 * 60 * 1000)
  const creditsModalTriggered = useRef(false)

  useEffect(() => {
    if (
      state.onboarding.completed &&
      !state.seenTips.includes("credits-modal-shown") &&
      !creditsModalTriggered.current
    ) {
      creditsModalTriggered.current = true
      setShowCreditsModal(true)
      dispatch({ type: "MARK_TIP_SEEN", payload: "credits-modal-shown" })
    }
  }, [state.onboarding.completed]) // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = useCallback(
    (path: string) => dispatch({ type: "SET_LAST_VISITED_ROUTE", payload: path }),
    [dispatch]
  )

  // Seed sample workspace once after sign-up
  useEffect(() => {
    if (!state.user) return
    if (state.workspaces.some((w) => w.isSample)) return

    const sampleId = crypto.randomUUID()
    dispatch({
      type: "ADD_WORKSPACE",
      payload: {
        id: sampleId,
        name: "Sample workspace",
        isSample: true,
        connectedApps: [
          { appId: "GitHub", enabledTools: defaultTools("GitHub") },
          { appId: "Slack", enabledTools: defaultTools("Slack") },
          { appId: "Notion", enabledTools: defaultTools("Notion") },
        ],
        connectedClients: [],
      },
    })

    for (const r of buildSampleReceipts(sampleId)) {
      dispatch({ type: "ADD_RECEIPT", payload: { ...r, isSample: true } })
    }
  }, [state.user?.email]) // eslint-disable-line react-hooks/exhaustive-deps

  // Not signed up → sign-up (no sidebar)
  if (!state.user) {
    return (
      <TooltipProvider delayDuration={200}>
        <SignUpScreen
          onComplete={(user) => {
            dispatch({ type: "SET_USER", payload: user })
            dispatch({ type: "SET_ORG", payload: { id: crypto.randomUUID(), name: `${user.firstName}'s org` } })
          }}
        />
        {isDevMode() && <DevPanel />}
      </TooltipProvider>
    )
  }

  // Onboarding not done → onboarding (no sidebar)
  if (!state.onboarding.completed) {
    return (
      <TooltipProvider delayDuration={200}>
        <OnboardingFlow navigate={navigate} />
        {isDevMode() && <DevPanel />}
      </TooltipProvider>
    )
  }

  // Main app
  const route = state.lastVisitedRoute || "/chat"
  const workspaces = state.workspaces
  const activeWorkspace = workspaces.find((w) => w.id === state.activeWorkspaceId) ?? null

  function handleSelectWorkspace(id: string) {
    dispatch({ type: "SET_ACTIVE_WORKSPACE", payload: id })
    navigate("/workspace")
  }

  function renderContent() {
    if (route === "/chat") return <ChatScreen onCreditsExhausted={() => setShowExhaustedModal(true)} />
    if (route === "/workspace" || route.startsWith("/workspace")) {
      if (!activeWorkspace) return <WorkspacesEmpty onCreate={() => setCreateOpen(true)} />
      return <WorkspaceShell name={activeWorkspace.name} onNavigateToChat={() => navigate("/chat")} />
    }
    return (
      <div className="flex flex-1 items-center justify-center text-[13px] text-muted-foreground">
        {route}
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider>
        <AppSidebar
          workspaces={workspaces.map((w) => ({ id: w.id, name: w.name, isSample: w.isSample }))}
          activeId={state.activeWorkspaceId}
          onSelectWorkspace={handleSelectWorkspace}
          onCreateWorkspace={() => setCreateOpen(true)}
          currentRoute={route}
          onNavigate={navigate}
          onGetCredits={() => setShowExhaustedModal(true)}
        />
        {renderContent()}
      </SidebarProvider>

      {isDevMode() && <DevPanel />}

      <Dialog open={showCreditsModal} onOpenChange={setShowCreditsModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>You have {TOTAL_CREDITS} free credits</DialogTitle>
            <DialogDescription>
              No API key needed. Start chatting with your agents right away.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Credits used</span>
              <span className="font-medium">0%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-muted-foreground/40" style={{ width: "0%" }} />
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowCreditsModal(false)}
              className="rounded-md bg-foreground px-4 py-1.5 text-[13px] font-medium text-background hover:bg-foreground/90"
            >
              Start chatting
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreditsExhaustedModal
        open={showExhaustedModal}
        onClose={() => setShowExhaustedModal(false)}
        offerExpiresAt={offerExpiresAt}
      />

      <WorkspaceCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(name) => {
          const id = crypto.randomUUID()
          dispatch({ type: "ADD_WORKSPACE", payload: { id, name, isSample: false, connectedApps: [], connectedClients: [] } })
          dispatch({ type: "SET_ACTIVE_WORKSPACE", payload: id })
          setCreateOpen(false)
          navigate("/workspace")
        }}
      />
    </TooltipProvider>
  )
}

export default App
