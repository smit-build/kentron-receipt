/**
 * Receipt app state store.
 * Persists to localStorage under "receipt.proto.v1".
 * Raw API keys are NEVER stored — only hasOpenAIKey + keyLast4.
 */
import { createContext, useContext, type Dispatch } from "react"

// ─── Types ─────────────────────────────────────────────────────────────────

export type ChatState = "no-apps" | "ready"

export const TOTAL_CREDITS = 10

export type NavStage = 1 | 2 | 3

export type ReceiptStepStatus = "success" | "blocked" | "awaiting"

export interface ReceiptStep {
  id: string
  appId: string
  toolName: string
  inputSummary: string
  status: ReceiptStepStatus
  durationMs: number
  hash: string
}

export interface Receipt {
  id: string
  workspaceId: string
  createdAt: number // epoch ms
  durationMs: number
  steps: ReceiptStep[]
  verified: boolean
  isSample: boolean
}

export interface ConnectedApp {
  appId: string
  enabledTools: string[]
}

export interface ConnectedClient {
  id: string
  clientType: "claude-ai" | "claude-desktop" | "claude-code" | "cursor" | "codex" | "other"
  connectedAt: number
}

export interface WorkspaceState {
  id: string
  name: string
  isSample: boolean
  connectedApps: ConnectedApp[]
  connectedClients: ConnectedClient[]
}

export interface OnboardingProgress {
  currentStep: number // 0=signup, 1=intent, 2=workspace, 3=apps, 4=key, 5=invite
  skippedSteps: number[]
  completed: boolean
}

export interface AppState {
  user: {
    firstName: string
    email: string
  } | null
  org: {
    id: string
    name: string
  } | null
  workspaces: WorkspaceState[]
  activeWorkspaceId: string | null
  hasOpenAIKey: boolean
  keyLast4: string | null
  creditsUsed: number
  receipts: Receipt[]
  onboarding: OnboardingProgress
  intent: string[] // selected intent chips
  showAllFeatures: boolean
  seenTips: string[] // ids of one-time tooltips/coachmarks already shown
  lastVisitedRoute: string
  checklistHidden: boolean
  sampleWorkspaceHidden: boolean
}

// ─── Initial state ──────────────────────────────────────────────────────────

const INITIAL_STATE: AppState = {
  user: null,
  org: null,
  workspaces: [],
  activeWorkspaceId: null,
  hasOpenAIKey: false,
  keyLast4: null,
  creditsUsed: 0,
  receipts: [],
  onboarding: {
    currentStep: 0,
    skippedSteps: [],
    completed: false,
  },
  intent: [],
  showAllFeatures: false,
  seenTips: [],
  lastVisitedRoute: "/chat",
  checklistHidden: false,
  sampleWorkspaceHidden: false,
}

// ─── Actions ────────────────────────────────────────────────────────────────

export type AppAction =
  | { type: "SET_USER"; payload: { firstName: string; email: string } }
  | { type: "SET_ORG"; payload: { id: string; name: string } }
  | { type: "ADD_WORKSPACE"; payload: WorkspaceState }
  | { type: "UPDATE_WORKSPACE"; payload: { id: string; updates: Partial<WorkspaceState> } }
  | { type: "SET_ACTIVE_WORKSPACE"; payload: string }
  | { type: "CONNECT_APP"; payload: { workspaceId: string; app: ConnectedApp } }
  | { type: "DISCONNECT_APP"; payload: { workspaceId: string; appId: string } }
  | { type: "UPDATE_APP_TOOLS"; payload: { workspaceId: string; appId: string; tools: string[] } }
  | { type: "SET_OPENAI_KEY"; payload: { keyLast4: string } }
  | { type: "REMOVE_OPENAI_KEY" }
  | { type: "ADD_RECEIPT"; payload: Receipt }
  | { type: "SET_ONBOARDING_STEP"; payload: number }
  | { type: "SKIP_ONBOARDING_STEP"; payload: number }
  | { type: "COMPLETE_ONBOARDING" }
  | { type: "SET_INTENT"; payload: string[] }
  | { type: "SET_SHOW_ALL_FEATURES"; payload: boolean }
  | { type: "MARK_TIP_SEEN"; payload: string }
  | { type: "SET_LAST_VISITED_ROUTE"; payload: string }
  | { type: "SET_CHECKLIST_HIDDEN"; payload: boolean }
  | { type: "SET_SAMPLE_WORKSPACE_HIDDEN"; payload: boolean }
  | { type: "CONNECT_CLIENT"; payload: { workspaceId: string; client: ConnectedClient } }
  | { type: "USE_CREDIT"; payload?: number }
  | { type: "RESET" }

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload }
    case "SET_ORG":
      return { ...state, org: action.payload }
    case "ADD_WORKSPACE":
      return { ...state, workspaces: [...state.workspaces, action.payload] }
    case "UPDATE_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.map((ws) =>
          ws.id === action.payload.id ? { ...ws, ...action.payload.updates } : ws
        ),
      }
    case "SET_ACTIVE_WORKSPACE":
      return { ...state, activeWorkspaceId: action.payload }
    case "CONNECT_APP": {
      const { workspaceId, app } = action.payload
      return {
        ...state,
        workspaces: state.workspaces.map((ws) => {
          if (ws.id !== workspaceId) return ws
          const existing = ws.connectedApps.find((a) => a.appId === app.appId)
          return {
            ...ws,
            connectedApps: existing
              ? ws.connectedApps.map((a) => (a.appId === app.appId ? app : a))
              : [...ws.connectedApps, app],
          }
        }),
      }
    }
    case "DISCONNECT_APP":
      return {
        ...state,
        workspaces: state.workspaces.map((ws) =>
          ws.id === action.payload.workspaceId
            ? { ...ws, connectedApps: ws.connectedApps.filter((a) => a.appId !== action.payload.appId) }
            : ws
        ),
      }
    case "UPDATE_APP_TOOLS":
      return {
        ...state,
        workspaces: state.workspaces.map((ws) =>
          ws.id === action.payload.workspaceId
            ? {
                ...ws,
                connectedApps: ws.connectedApps.map((a) =>
                  a.appId === action.payload.appId ? { ...a, enabledTools: action.payload.tools } : a
                ),
              }
            : ws
        ),
      }
    case "SET_OPENAI_KEY":
      return { ...state, hasOpenAIKey: true, keyLast4: action.payload.keyLast4 }
    case "REMOVE_OPENAI_KEY":
      return { ...state, hasOpenAIKey: false, keyLast4: null }
    case "ADD_RECEIPT":
      return { ...state, receipts: [...state.receipts, action.payload] }
    case "SET_ONBOARDING_STEP":
      return { ...state, onboarding: { ...state.onboarding, currentStep: action.payload } }
    case "SKIP_ONBOARDING_STEP":
      return {
        ...state,
        onboarding: {
          ...state.onboarding,
          skippedSteps: [...state.onboarding.skippedSteps, action.payload],
          currentStep: state.onboarding.currentStep + 1,
        },
      }
    case "COMPLETE_ONBOARDING":
      return { ...state, onboarding: { ...state.onboarding, completed: true } }
    case "SET_INTENT":
      return { ...state, intent: action.payload }
    case "SET_SHOW_ALL_FEATURES":
      return { ...state, showAllFeatures: action.payload }
    case "MARK_TIP_SEEN":
      return {
        ...state,
        seenTips: state.seenTips.includes(action.payload)
          ? state.seenTips
          : [...state.seenTips, action.payload],
      }
    case "SET_LAST_VISITED_ROUTE":
      return { ...state, lastVisitedRoute: action.payload }
    case "SET_CHECKLIST_HIDDEN":
      return { ...state, checklistHidden: action.payload }
    case "SET_SAMPLE_WORKSPACE_HIDDEN":
      return { ...state, sampleWorkspaceHidden: action.payload }
    case "CONNECT_CLIENT": {
      const { workspaceId, client } = action.payload
      return {
        ...state,
        workspaces: state.workspaces.map((ws) =>
          ws.id === workspaceId
            ? { ...ws, connectedClients: [...(ws.connectedClients ?? []), client] }
            : ws
        ),
      }
    }
    case "USE_CREDIT":
      return { ...state, creditsUsed: Math.min((state.creditsUsed ?? 0) + (action.payload ?? 1), TOTAL_CREDITS) }
    case "RESET":
      return INITIAL_STATE
    default:
      return state
  }
}

// ─── Persistence ────────────────────────────────────────────────────────────

const STORAGE_KEY = "receipt.proto.v1"

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_STATE
    return { ...INITIAL_STATE, ...JSON.parse(raw) }
  } catch {
    return INITIAL_STATE
  }
}

function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // quota exceeded — silent fail
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

export interface StoreContextValue {
  state: AppState
  dispatch: Dispatch<AppAction>
}

export const StoreContext = createContext<StoreContextValue | null>(null)

export { reducer, loadState, saveState }

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>")
  return ctx
}

// ─── Selectors ───────────────────────────────────────────────────────────────

/** Returns true if any real (non-sample) workspace has ≥1 connected app. */
export function orgHasConnectedApp(state: AppState): boolean {
  return state.workspaces
    .filter((ws) => !ws.isSample)
    .some((ws) => ws.connectedApps.length > 0)
}

/** Returns true if any real receipt exists (sample receipts excluded). */
export function orgHasReceipt(state: AppState): boolean {
  return state.receipts.some((r) => !r.isSample)
}

/** Sidebar progressive-disclosure stage (1–3). */
export function navStage(state: AppState): NavStage {
  if (state.showAllFeatures) return 3
  if (orgHasReceipt(state)) return 3
  if (orgHasConnectedApp(state)) return 2
  return 1
}

export interface ChecklistStatus {
  createWorkspace: boolean
  connectApp: boolean
  addOpenAIKey: boolean
  firstReceipt: boolean
  inviteTeammate: boolean
  connectClient: boolean
}

export function checklistStatus(state: AppState): ChecklistStatus {
  const ws = state.workspaces.find(
    (w) => !w.isSample && w.id === state.activeWorkspaceId
  )
  return {
    createWorkspace: (ws ?? null) !== null,
    connectApp: (ws?.connectedApps.length ?? 0) > 0,
    addOpenAIKey: state.hasOpenAIKey,
    firstReceipt: state.receipts.some((r) => !r.isSample),
    inviteTeammate: false, // placeholder — no members model yet
    connectClient: (ws?.connectedClients?.length ?? 0) > 0,
  }
}

/** Chat state for the active workspace. */
export function chatState(state: AppState): ChatState {
  const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId)
  if (!ws || ws.connectedApps.length === 0) return "no-apps"
  return "ready"
}
