/**
 * Onboarding flow controller (steps 1–5 from spec section 3).
 * Uses store's onboarding.currentStep (0-indexed → step 1 = intent).
 */
import { useStore } from "@/lib/store"
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout"
import { StepIntent } from "@/components/onboarding/step-intent"
import { StepWorkspace } from "@/components/onboarding/step-workspace"
import { StepApps } from "@/components/onboarding/step-apps"
import { StepInvite } from "@/components/onboarding/step-invite"

interface OnboardingFlowProps {
  navigate: (path: string) => void
}

const TOTAL_STEPS = 4

function ensureWorkspace(state: ReturnType<typeof useStore>["state"], dispatch: ReturnType<typeof useStore>["dispatch"]) {
  const realWs = state.workspaces.find((w) => !w.isSample)
  if (realWs) {
    if (state.activeWorkspaceId !== realWs.id) {
      dispatch({ type: "SET_ACTIVE_WORKSPACE", payload: realWs.id })
    }
    return realWs.id
  }
  const id = crypto.randomUUID()
  const ws = {
    id,
    name: `${state.user?.firstName ?? "My"}'s workspace`,
    isSample: false,
    connectedApps: [],
    connectedClients: [],
  }
  dispatch({ type: "ADD_WORKSPACE", payload: ws })
  dispatch({ type: "SET_ACTIVE_WORKSPACE", payload: id })
  return id
}

export function OnboardingFlow({ navigate }: OnboardingFlowProps) {
  const { state, dispatch } = useStore()
  const step = state.onboarding.currentStep // 0=intent,1=workspace,2=apps,3=key,4=invite

  function goTo(s: number) {
    dispatch({ type: "SET_ONBOARDING_STEP", payload: s })
  }

  function finish() {
    dispatch({ type: "COMPLETE_ONBOARDING" })
    dispatch({ type: "MARK_TIP_SEEN", payload: "chat-welcome-pending" }) // flag to show welcome in chat
    navigate("/chat")
  }

  function handleSkipAll() {
    ensureWorkspace(state, dispatch)
    dispatch({ type: "COMPLETE_ONBOARDING" })
    navigate("/chat")
  }

  // Resolve active workspace ID for steps that need it
  const activeWsId = state.workspaces.find((w) => w.id === state.activeWorkspaceId && !w.isSample)?.id

  const backHandler = step === 1 ? () => goTo(0)
    : step === 2 ? () => goTo(1)
    : step === 3 ? () => goTo(2)
    : undefined

  return (
    <OnboardingLayout
      step={step + 1}
      totalSteps={TOTAL_STEPS}
      onSkipAll={handleSkipAll}
      onBack={backHandler}
      hideFooter
    >
      {step === 0 && (
        <StepIntent
          onNext={() => goTo(1)}
          onSkip={() => goTo(1)}
        />
      )}

      {step === 1 && (
        <StepWorkspace
          onNext={(name) => {
            const existing = state.workspaces.find((w) => !w.isSample)
            if (!existing) {
              const id = crypto.randomUUID()
              dispatch({ type: "ADD_WORKSPACE", payload: { id, name, isSample: false, connectedApps: [], connectedClients: [] } })
              dispatch({ type: "SET_ACTIVE_WORKSPACE", payload: id })
            }
            goTo(2)
          }}
          onBack={() => goTo(0)}
          onSkip={() => {
            ensureWorkspace(state, dispatch)
            goTo(2)
          }}
        />
      )}

      {step === 2 && (
        <StepApps
          workspaceId={activeWsId ?? ensureWorkspace(state, dispatch)}
          onNext={() => goTo(3)}
          onBack={() => goTo(1)}
          onSkip={() => goTo(3)}
        />
      )}

      {step === 3 && (
        <StepInvite
          onNext={finish}
          onBack={() => goTo(2)}
        />
      )}
    </OnboardingLayout>
  )
}
