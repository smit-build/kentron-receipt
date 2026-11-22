/**
 * Chat screen — conversational AI interface.
 *
 * Chat states (driven by chatState selector):
 *   A  no-key   → setup banner + disabled composer
 *   B  no-apps  → setup banner + composer enabled
 *   C  ready, no messages → welcome + prompt grid
 *   D  ready, in conversation
 *
 * Thinking phases (while sending):
 *   thinking → 3 animated dots
 *   searching → app logo + "Searching [App]…"
 *   writing  → cursor blink + "Writing response…"
 *
 * Streaming: word-by-word reveal for assistant messages.
 *
 * "check all states" toggle at bottom-right of content area
 * injects 10 demo state cards for every conversational AI state.
 */
import { useEffect, useRef, useState } from "react"
import {
  Add01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Mic01Icon,
  Search01Icon,
  Settings01Icon,
  Tick02Icon,
  Upload01Icon,
  User02Icon,
} from "hugeicons-react"
import { useStore, chatState, TOTAL_CREDITS, type Receipt } from "@/lib/store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { isDevMode } from "@/components/dev-panel"
import { mockSendMessage, type ChatMessage } from "@/lib/services/chat"
import { getReadyStatePrompts } from "@/lib/data/app-prompts"
import { getSuggestedApps } from "@/lib/data/intent-apps"
import { integrations } from "@/lib/integrations"
import { AppLogo } from "@/components/app-logo"
import { AppConnectFlow } from "@/components/app-connect-flow"
import { ReceiptCard } from "@/components/receipt-card"
import { ReceiptReplayPanel } from "@/components/receipt-replay-panel"
import { cn } from "@/lib/utils"

// ─── helpers ────────────────────────────────────────────────────────────────

/** Variable credit cost: longer prompts cost slightly more, with mild randomness. */
function calcCredits(prompt: string): number {
  const words = prompt.trim().split(/\s+/).length
  const base = words < 8 ? 1 : words < 25 ? 2 : 3
  const jitter = Math.random() < 0.35 ? 1 : 0
  return Math.min(base + jitter, 3)
}

function getInitials(name: string) {
  return integrations.find((i) => i.name === name)?.initials ?? name.slice(0, 2).toUpperCase()
}

type ThinkingPhase = "thinking" | "searching" | "writing"

/** Mock receipt used in demo state 6 (response + receipt) */
const MOCK_RECEIPT: Receipt = {
  id: "demo-rcpt-001",
  workspaceId: "demo",
  createdAt: Date.now() - 3000,
  durationMs: 1361,
  verified: true,
  isSample: false,
  steps: [
    {
      id: "s1",
      appId: "GitHub",
      toolName: "pulls_list",
      inputSummary: "owner=smitux, state=open, sort=updated, per_page=20",
      status: "success",
      durationMs: 312,
      hash: "a3f72c",
    },
    {
      id: "s2",
      appId: "GitHub",
      toolName: "pulls_get",
      inputSummary: "pull_number=142",
      status: "success",
      durationMs: 198,
      hash: "b81e4d",
    },
    {
      id: "s3",
      appId: "GitHub",
      toolName: "pulls_get",
      inputSummary: "pull_number=140",
      status: "success",
      durationMs: 203,
      hash: "c56a19",
    },
    {
      id: "s4",
      appId: "Slack",
      toolName: "conversations_list",
      inputSummary: "types=public_channel, exclude_archived=true, limit=100",
      status: "success",
      durationMs: 445,
      hash: "d2f830",
    },
    {
      id: "s5",
      appId: "Slack",
      toolName: "chat_postMessage",
      inputSummary: "channel=#eng, as_user=false, draft=true",
      status: "awaiting",
      durationMs: 0,
      hash: "e94b7c",
    },
  ],
}

// ─── Avatar color system ─────────────────────────────────────────────────────

const USER_AVATAR_COLORS = [
  { bg: "oklch(0.95 0.015 25)", fg: "oklch(0.40 0.07 25)" },
  { bg: "oklch(0.95 0.015 60)", fg: "oklch(0.40 0.06 60)" },
  { bg: "oklch(0.95 0.015 100)", fg: "oklch(0.40 0.06 100)" },
  { bg: "oklch(0.95 0.015 150)", fg: "oklch(0.40 0.06 150)" },
  { bg: "oklch(0.95 0.015 195)", fg: "oklch(0.40 0.06 195)" },
  { bg: "oklch(0.95 0.015 240)", fg: "oklch(0.40 0.06 240)" },
  { bg: "oklch(0.95 0.015 270)", fg: "oklch(0.40 0.07 270)" },
  { bg: "oklch(0.95 0.015 300)", fg: "oklch(0.40 0.07 300)" },
  { bg: "oklch(0.95 0.015 330)", fg: "oklch(0.40 0.07 330)" },
  { bg: "oklch(0.95 0 0)", fg: "oklch(0.40 0 0)" },
]

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0
  return Math.abs(h)
}

function getUserAvatarColor(seed: string) {
  return USER_AVATAR_COLORS[hashStr(seed) % USER_AVATAR_COLORS.length]
}

// ─── ChatScreen ──────────────────────────────────────────────────────────────

export function ChatScreen({ onCreditsExhausted }: { onCreditsExhausted?: () => void } = {}) {
  const { state, dispatch } = useStore()
  const cs = chatState(state)
  const activeWs = state.workspaces.find((w) => w.id === state.activeWorkspaceId && !w.isSample)
  const wsName = activeWs?.name ?? "Workspace"
  const connectedAppIds = activeWs?.connectedApps.map((a) => a.appId) ?? []

  // conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [localReceipts, setLocalReceipts] = useState<Record<string, Receipt>>({})
  const [replayReceipt, setReplayReceipt] = useState<Receipt | null>(null)
  const [connectingApp, setConnectingApp] = useState<string | null>(null)
  const [mentionOpen, setMentionOpen] = useState(false)

  // thinking animation phases
  const [thinkingPhase, setThinkingPhase] = useState<ThinkingPhase>("thinking")
  const [thinkingApp, setThinkingApp] = useState<string | null>(null)

  // streaming state
  const [streamMsg, setStreamMsg] = useState<ChatMessage | null>(null)
  const [streamShown, setStreamShown] = useState(0)
  const pendingStreamRef = useRef<{ message: ChatMessage; words: string[]; shown: number } | null>(null)
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // demo toggle
  const [showDemoStates, setShowDemoStates] = useState(false)
  // add tools modal
  const [showAddTools, setShowAddTools] = useState(false)
  // connected apps modal (clicking the app stack in composer)
  const [showConnectedApps, setShowConnectedApps] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  // welcome coachmark
  const showWelcome = !state.seenTips.includes("chat-welcome") && state.onboarding.completed
  useEffect(() => {
    if (showWelcome) dispatch({ type: "MARK_TIP_SEEN", payload: "chat-welcome" })
  }, [showWelcome, dispatch])

  // thinking phase transitions (while sending)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!sending) {
      setThinkingPhase("thinking")
      setThinkingApp(null)
      return
    }
    const t1 = setTimeout(() => {
      setThinkingPhase("searching")
      setThinkingApp(connectedAppIds[0] ?? null)
    }, 500)
    const t2 = setTimeout(() => setThinkingPhase("writing"), 1200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [sending])

  // streaming word-by-word effect
  useEffect(() => {
    if (!streamMsg) return
    const ref = pendingStreamRef.current
    if (!ref) return
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)

    streamIntervalRef.current = setInterval(() => {
      ref.shown++
      setStreamShown(ref.shown)

      if (ref.shown >= ref.words.length) {
        clearInterval(streamIntervalRef.current!)
        streamIntervalRef.current = null
        const finished = ref.message
        pendingStreamRef.current = null
        setStreamMsg(null)
        setStreamShown(0)
        setMessages((p) => [...p, finished])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
      }
    }, 20)

    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)
    }
  }, [streamMsg?.id])

  const showCoachmark = (receiptId: string) =>
    !state.seenTips.includes("first-receipt") && Object.keys(localReceipts)[0] === receiptId

  async function send(content: string) {
    if (!content.trim() || sending) return
    if (creditsRemaining <= 0) { onCreditsExhausted?.(); return }
    const cost = calcCredits(content)
    setSending(true)
    dispatch({ type: "USE_CREDIT", payload: Math.min(cost, creditsRemaining) })
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content, createdAt: Date.now() }
    setMessages((p) => [...p, userMsg])
    setInput("")
    setMentionOpen(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)

    const response = await mockSendMessage({ workspaceId: activeWs?.id ?? "", content, connectedAppIds })

    if (response.receipt) {
      dispatch({ type: "ADD_RECEIPT", payload: response.receipt })
      setLocalReceipts((p) => ({ ...p, [response.receipt!.id]: response.receipt! }))
      if (!state.seenTips.includes("first-receipt")) {
        dispatch({ type: "MARK_TIP_SEEN", payload: "first-receipt" })
      }
    }

    setSending(false)

    // start streaming
    const words = response.message.content.split(" ")
    pendingStreamRef.current = { message: response.message, words, shown: 1 }
    setStreamShown(1)
    setStreamMsg(response.message)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setInput(val)
    setMentionOpen(val.endsWith("@") && connectedAppIds.length > 0)
  }

  function insertMention(appId: string) {
    const lastAt = input.lastIndexOf("@")
    setInput(input.slice(0, lastAt) + `@${appId} `)
    setMentionOpen(false)
  }

  const inConversation = messages.length > 0 || streamMsg !== null
  const creditsRemaining = TOTAL_CREDITS - (state.creditsUsed ?? 0)
  const userInitials = state.user
    ? (state.user.firstName[0] + (state.user.email?.[0] ?? "")).toUpperCase()
    : "U"
  const avatarColor = getUserAvatarColor(state.user?.email ?? state.user?.firstName ?? userInitials)

  // ── demo toggle — dev-only ────────────────────────────────────────────────
  const demoToggle = isDevMode() ? (
    <div className="flex justify-end pt-5 pb-1">
      <button
        type="button"
        onClick={() => {
          setShowDemoStates((v) => !v)
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 120)
        }}
        className="text-[11px] text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
      >
        {showDemoStates ? "hide states" : "check all states"}
      </button>
    </div>
  ) : null

  return (
    <div className="flex min-h-svh flex-1 flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex h-header shrink-0 items-center justify-between border-b-[1.5px] border-border px-6">
        <div className="flex items-center gap-1">
          <span className="text-[13px] font-medium text-muted-foreground">Chatting in</span>
          <button
            type="button"
            className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[13px] font-semibold hover:bg-muted"
          >
            {wsName}
            <ArrowRight01Icon className="ml-0.5 size-3 rotate-90 text-muted-foreground" />
          </button>
        </div>
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: avatarColor.bg, color: avatarColor.fg }}
          title={state.user?.firstName ?? "User"}
        >
          <User02Icon className="size-3.5" />
        </div>
      </header>





      {/* ── Content B: app tiles ─────────────────────────────────────────── */}
      {cs === "no-apps" && (
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto w-full max-w-[640px]">
            <p className="mb-3 text-[13px] font-medium">Connect an app to get started</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {getSuggestedApps(state.intent).slice(0, 6).map((appId) => {
                const connected = connectedAppIds.includes(appId)
                return (
                  <div key={appId} className="flex flex-col items-center gap-1.5 rounded-xl border border-border p-3 text-center">
                    <AppLogo name={appId} initials={getInitials(appId)} className="size-7" />
                    <span className="text-[11px] font-medium">{appId}</span>
                    {connected ? (
                      <span className="text-[10px] text-muted-foreground">Connected</span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setConnectingApp(appId)}
                          className="rounded border border-border px-2 py-0.5 text-[11px] hover:bg-muted"
                        >
                          Connect
                        </button>
                        <AppConnectFlow
                          appId={appId}
                          workspaceId={activeWs?.id ?? ""}
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
            {showDemoStates && <DemoStatesSection connectedAppIds={connectedAppIds} />}
            {demoToggle}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* ── Content C: ready, no messages ────────────────────────────────── */}
      {cs === "ready" && !inConversation && (
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10">
          <div className="w-full max-w-[640px] text-center">
            <h2 className="text-[32px] font-[500] leading-tight tracking-tight">
              {state.user?.firstName ? `Hi ${state.user.firstName}` : "Hello"}
            </h2>
            <p className="text-[32px] font-[500] leading-tight tracking-tight">
              What can I help you with?
            </p>
            {connectedAppIds.length > 0 && (
              <div className="mt-7 flex justify-center animate-[slide-up-fade_0.45s_cubic-bezier(0,0,0.2,1)_both]">
                <AppStack
                  connectedApps={connectedAppIds}
                  onOpenConnectedApps={() => setShowConnectedApps(true)}
                  onOpenAddTools={() => setShowAddTools(true)}
                />
              </div>
            )}
            {showDemoStates && <div className="mt-10"><DemoStatesSection connectedAppIds={connectedAppIds} /></div>}
            {demoToggle}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* ── Content D: in conversation ───────────────────────────────────── */}
      {cs === "ready" && inConversation && (
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-[640px] flex-col gap-5">
            {messages.map((msg) => {
              const receipt = msg.receiptId ? localReceipts[msg.receiptId] : undefined
              return (
                <MessageRow
                  key={msg.id}
                  msg={msg}
                  receipt={receipt}
                  showCoachmark={receipt ? showCoachmark(receipt.id) : false}
                  onReplay={setReplayReceipt}
                />
              )
            })}

            {/* Streaming message */}
            {streamMsg && (
              <StreamingRow
                content={streamMsg.content}
                shown={streamShown}
              />
            )}

            {/* Thinking indicator (while awaiting response, not streaming) */}
            {sending && !streamMsg && (
              <ThinkingRow phase={thinkingPhase} appId={thinkingApp ?? undefined} />
            )}

            {/* Demo states */}
            {showDemoStates && <DemoStatesSection connectedAppIds={connectedAppIds} />}
            {demoToggle}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* ── Unified sticky footer ─────────────────────────────────────────── */}
      <div className="shrink-0 bg-background px-6 pt-3 pb-5">
        <div className="mx-auto max-w-[640px]">
          {cs === "ready" && !inConversation && connectedAppIds.length > 0 && (
            <div className="mb-2 flex flex-col divide-y divide-border">
              {getReadyStatePrompts(connectedAppIds).slice(0, 3).map((prompt) => (
                <button
                  key={prompt.text}
                  type="button"
                  onClick={() => creditsRemaining > 0 ? send(prompt.text) : setInput(prompt.text)}
                  className="flex items-center gap-3 px-1 py-2.5 text-left transition-colors hover:bg-muted/40"
                >
                  <AppLogo
                    name={prompt.appIds[0]}
                    initials={getInitials(prompt.appIds[0])}
                    className="size-5 shrink-0 rounded-[3px]"
                  />
                  <span className="flex-1 text-[13px] text-foreground/70">{prompt.text}</span>
                </button>
              ))}
            </div>
          )}
          <ComposerArea
            input={input}
            onChange={handleInputChange}
            onSend={() => send(input)}
            sending={sending}
            mentionOpen={mentionOpen}
            connectedApps={connectedAppIds}
            onInsertMention={insertMention}
            onOpenAddTools={() => setShowAddTools(true)}
            onOpenConnectedApps={() => setShowConnectedApps(true)}
            showToolStrip={inConversation || cs === "no-apps"}
            placeholder={cs === "no-apps" ? "Ask a general question…" : "Ask anything…"}
          />
        </div>
      </div>

      <AddToolsModal
        open={showAddTools}
        onClose={() => setShowAddTools(false)}
        connectedAppIds={connectedAppIds}
        workspaceId={activeWs?.id ?? ""}
      />

      <ConnectedAppsModal
        open={showConnectedApps}
        onClose={() => setShowConnectedApps(false)}
        connectedAppIds={connectedAppIds}
        workspaceId={activeWs?.id ?? ""}
      />

      {replayReceipt && (
        <ReceiptReplayPanel receipt={replayReceipt} onClose={() => setReplayReceipt(null)} />
      )}

    </div>
  )
}

// ─── MessageRow ──────────────────────────────────────────────────────────────

function MessageRow({
  msg, receipt, showCoachmark, onReplay,
}: {
  msg: ChatMessage
  receipt?: Receipt
  showCoachmark: boolean
  onReplay: (r: Receipt) => void
}) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[72%] rounded-2xl rounded-br-sm bg-muted px-4 py-2.5 text-[13px] leading-relaxed">
          <span className="whitespace-pre-wrap">{renderInline(msg.content)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2.5">
      <div className="flex flex-col gap-2">
        <div className="max-w-[80%] text-[13px] leading-relaxed">
          <MarkdownText content={msg.content} />
        </div>
        {receipt && (
          <div className="mt-1">
            <ReceiptCard
              receipt={receipt}
              onReplay={onReplay}
              showCoachmark={showCoachmark}
              onCoachmarkDismiss={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── StreamingRow ─────────────────────────────────────────────────────────────

function StreamingRow({ content, shown }: { content: string; shown: number }) {
  const words = content.split(" ")
  const visible = words.slice(0, shown).join(" ")

  return (
    <div className="flex justify-start gap-2.5">
      <AiAvatar active />
      <div className="max-w-[75%] py-1 text-[13px] leading-relaxed">
        <span className="whitespace-pre-wrap">{visible}</span>
        <span className="ml-0.5 inline-block h-[13px] w-[2px] translate-y-[2px] bg-foreground/50 animate-[cursor-blink_1s_step-end_infinite]" />
      </div>
    </div>
  )
}

// ─── ThinkingRow ──────────────────────────────────────────────────────────────

function ThinkingRow({ phase, appId }: { phase: ThinkingPhase; appId?: string }) {
  return (
    <div className="flex justify-start gap-2.5">
      <AiAvatar active />
      <div className="pt-2">
        {phase === "thinking" && (
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-[dot-bounce_1.2s_ease_0s_infinite]" />
            <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-[dot-bounce_1.2s_ease_0.15s_infinite]" />
            <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-[dot-bounce_1.2s_ease_0.3s_infinite]" />
          </div>
        )}
        {phase === "searching" && (
          <div className="flex items-center gap-2">
            {appId ? (
              <AppLogo name={appId} initials={appId.slice(0, 2).toUpperCase()} className="size-4 rounded-sm" />
            ) : (
              <span className="size-4 rounded-sm bg-muted" />
            )}
            <span className="text-[12px] text-muted-foreground">Searching {appId ?? "tool"}…</span>
            <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-pulse" />
          </div>
        )}
        {phase === "writing" && (
          <div className="flex items-center gap-2">
            <span className="inline-block h-[13px] w-[2px] bg-foreground/50 animate-[cursor-blink_1s_step-end_infinite]" />
            <span className="text-[12px] text-muted-foreground">Writing response…</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── AiAvatar ────────────────────────────────────────────────────────────────

function AiAvatar({ active = false }: { active?: boolean }) {
  return (
    <div className={cn(
      "mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border",
      active ? "border-foreground/25" : "border-border"
    )}>
      {active ? (
        <div className="flex items-center gap-[3px]">
          <span className="size-1 rounded-full bg-foreground/60 animate-[dot-bounce_1.2s_ease_0s_infinite]" />
          <span className="size-1 rounded-full bg-foreground/60 animate-[dot-bounce_1.2s_ease_0.2s_infinite]" />
          <span className="size-1 rounded-full bg-foreground/60 animate-[dot-bounce_1.2s_ease_0.4s_infinite]" />
        </div>
      ) : (
        <span className="text-[9px] font-bold tracking-tight text-muted-foreground">AI</span>
      )}
    </div>
  )
}

// ─── MarkdownText ─────────────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|@\w+)/g)
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">{p.slice(1, -1)}</code>
    if (/^@\w+$/.test(p)) return <span key={i} className="inline-flex items-center rounded-[4px] bg-foreground/[0.07] px-1.5 py-px text-[12px] font-medium text-foreground">{p}</span>
    return p
  })
}

function MarkdownText({ content }: { content: string }) {
  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const listMatch = line.match(/^(\d+)\.\s+(.+)$/)
    if (listMatch) {
      const items: string[] = [listMatch[2]]
      let j = i + 1
      while (j < lines.length && lines[j].match(/^\d+\.\s+/)) {
        items.push(lines[j].replace(/^\d+\.\s+/, ""))
        j++
      }
      elements.push(
        <ol key={i} className="ml-0 flex flex-col gap-0.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-1.5">
              <span className="shrink-0 font-medium text-muted-foreground">{idx + 1}.</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      )
      i = j
      continue
    }
    if (line.trim() === "") { elements.push(<div key={`sp${i}`} className="h-1.5" />); i++; continue }
    elements.push(<p key={i}>{renderInline(line)}</p>)
    i++
  }
  return <div className="flex flex-col gap-0.5">{elements}</div>
}

// ─── Countdown ───────────────────────────────────────────────────────────────

function Countdown({ expiresAt }: { expiresAt: number }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, expiresAt - Date.now()))
  useEffect(() => {
    const id = setInterval(() => {
      const r = Math.max(0, expiresAt - Date.now())
      setRemaining(r)
      if (r <= 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt])
  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  const s = Math.floor((remaining % 60000) / 1000)
  return <span className="font-mono font-semibold tabular-nums">{String(h).padStart(2,"0")}:{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</span>
}

// ─── CreditsExhaustedModal ───────────────────────────────────────────────────

const PLANS: Array<{
  name: string
  price: number | null
  origPrice: number | null
  highlight?: boolean
  features: string[]
}> = [
  {
    name: "Starter",
    price: 12,
    origPrice: 15,
    features: [
      "50 credits / month",
      "1 workspace",
      "3 app connections",
      "Receipt audit log",
    ],
  },
  {
    name: "Pro",
    price: 31,
    origPrice: 39,
    highlight: true,
    features: [
      "200 credits / month",
      "5 workspaces",
      "Unlimited app connections",
      "Full receipt history",
      "Governance policies",
      "Priority support",
    ],
  },
  {
    name: "Custom",
    price: null,
    origPrice: null,
    features: [
      "Unlimited credits",
      "Unlimited workspaces",
      "Custom integrations",
      "Dedicated account manager",
      "SSO & enterprise audit",
    ],
  },
]

export function CreditsExhaustedModal({ open, onClose, offerExpiresAt }: {
  open: boolean
  onClose: () => void
  offerExpiresAt: number
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>You&apos;re out of credits</DialogTitle>
          <DialogDescription>
            Upgrade to keep going. Special launch offer ends in{" "}
            <Countdown expiresAt={offerExpiresAt} />.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2.5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-xl border p-4",
                plan.highlight ? "border-foreground bg-foreground text-background" : "border-border"
              )}
            >
              {/* Plan header: name + price */}
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold">{plan.name}</span>
                  {plan.highlight && (
                    <span className="rounded-sm bg-background/20 px-1.5 py-0.5 text-[10px] font-medium">Popular</span>
                  )}
                </div>
                {plan.price !== null ? (
                  <div className="shrink-0 text-right">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[17px] font-bold">${plan.price}</span>
                      <span className={cn("text-[11px]", plan.highlight ? "text-background/60" : "text-muted-foreground")}>/mo</span>
                    </div>
                    <div className={cn("text-[10px] line-through", plan.highlight ? "text-background/40" : "text-muted-foreground/50")}>${plan.origPrice}</div>
                  </div>
                ) : (
                  <span className={cn("shrink-0 text-[12px] font-medium", plan.highlight ? "text-background/70" : "text-muted-foreground")}>Contact us</span>
                )}
              </div>
              {/* Feature list */}
              <div className="flex flex-col gap-1.5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Tick02Icon className={cn("size-3 shrink-0", plan.highlight ? "text-background/50" : "text-muted-foreground")} />
                    <span className={cn("text-[12px]", plan.highlight ? "text-background/80" : "")}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-center text-[11px] text-muted-foreground">20% launch discount applied. Cancel anytime.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── AddToolsModal ───────────────────────────────────────────────────────────

function AddToolsModal({ open, onClose, connectedAppIds, workspaceId }: {
  open: boolean
  onClose: () => void
  connectedAppIds: string[]
  workspaceId: string
}) {
  const [search, setSearch] = useState("")
  const [connectingApp, setConnectingApp] = useState<string | null>(null)

  const available = integrations.filter(
    (i) => i.status !== "coming-soon" &&
      i.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="px-6 pb-3 pt-6">
          <DialogTitle>Connect tools</DialogTitle>
          <DialogDescription>Add apps your agent can use in this workspace.</DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-3">
          <div className="relative">
            <Search01Icon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools…"
              autoFocus
              className="w-full rounded-md border border-border bg-background py-2 pl-8 pr-3 text-[13px] outline-none focus:border-foreground/20"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto border-t border-border">
          <div className="flex flex-col divide-y divide-border px-6">
            {available.map((app) => {
              const connected = connectedAppIds.includes(app.name)
              return (
                <div key={app.name} className="flex items-center gap-3 py-3">
                  <AppLogo name={app.name} initials={app.initials} className="size-7 shrink-0 rounded-[5px]" />
                  <span className="flex-1 truncate text-[13px] font-medium">{app.name}</span>
                  {connected ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Tick02Icon className="size-3 shrink-0" />
                      <span className="text-[12px]">Connected</span>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setConnectingApp(app.name)}
                        className="rounded-md border border-border px-3 py-1 text-[12px] transition-colors hover:bg-muted"
                      >
                        Connect
                      </button>
                      <AppConnectFlow
                        appId={app.name}
                        workspaceId={workspaceId}
                        open={connectingApp === app.name}
                        onOpenChange={(v) => { if (!v) setConnectingApp(null) }}
                        onConnected={() => setConnectingApp(null)}
                      />
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div className="shrink-0 border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── ConnectedAppsModal ──────────────────────────────────────────────────────

function ConnectedAppsModal({ open, onClose, connectedAppIds }: {
  open: boolean
  onClose: () => void
  connectedAppIds: string[]
  workspaceId: string
}) {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)
  const connected = integrations.filter((i) => connectedAppIds.includes(i.name))

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[70vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-sm">
        <DialogHeader className="px-5 pb-3 pt-5">
          <DialogTitle>Connected apps</DialogTitle>
          <DialogDescription>Apps available to your agent in this workspace.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto border-t border-border">
          {connected.length === 0 ? (
            <p className="px-5 py-6 text-[13px] text-muted-foreground">No apps connected yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border px-5">
              {connected.map((app) => (
                <div
                  key={app.name}
                  className="group flex items-center gap-3 py-3"
                  onMouseEnter={() => setHoveredApp(app.name)}
                  onMouseLeave={() => setHoveredApp(null)}
                >
                  <AppLogo name={app.name} initials={app.initials} className="size-6 shrink-0 rounded-[4px]" />
                  <span className="flex-1 truncate text-[13px] font-medium">{app.name}</span>
                  <button
                    type="button"
                    aria-label={`${app.name} settings`}
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 transition-all",
                      hoveredApp === app.name ? "opacity-100 hover:bg-muted hover:text-muted-foreground" : "opacity-0",
                    )}
                  >
                    <Settings01Icon className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── DemoStatesSection ───────────────────────────────────────────────────────

function DemoStatesSection({ connectedAppIds }: { connectedAppIds: string[] }) {
  const appId = connectedAppIds[0] ?? "GitHub"

  const mockUserMsg: ChatMessage = {
    id: "demo-user-1",
    role: "user",
    content: "Summarise my open PRs and draft a Slack update",
    createdAt: Date.now() - 90000,
  }
  const mockAiMsg: ChatMessage = {
    id: "demo-ai-1",
    role: "assistant",
    content: "4 open PRs on acme/app:\n\n1. **feat: receipt-replay** (#142) · awaiting review — @dana flagged it's blocking her panel work\n2. **fix: sidebar-collapse** (#140) · 2 review comments, all checks passing\n3. **chore: update-deps** (#139) · ready to merge\n4. **feat: chat-composer** (#137) · still in draft\n\nDraft for #eng below — approve to post.",
    createdAt: Date.now() - 89000,
  }

  return (
    <div className="mt-8">
      {/* Section header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10.5px] font-medium uppercase tracking-widest text-muted-foreground/40">
          All states
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-8">

        {/* ── State 1: User message ───────────────────────────────────────── */}
        <DemoState label="1 · User message">
          <MessageRow msg={mockUserMsg} showCoachmark={false} onReplay={() => {}} />
        </DemoState>

        {/* ── State 2: AI thinking ────────────────────────────────────────── */}
        <DemoState label="2 · Thinking">
          <ThinkingRow phase="thinking" />
        </DemoState>

        {/* ── State 3: Searching tool ─────────────────────────────────────── */}
        <DemoState label={`3 · Searching · ${appId}`}>
          <ThinkingRow phase="searching" appId={appId} />
        </DemoState>

        {/* ── State 4: Streaming / writing response ──────────────────────── */}
        <DemoState label="4 · Writing response">
          <StreamingRow
            content="Here's a summary of your open pull requests across connected repositories. I've also drafted the Slack update below."
            shown={8}
          />
        </DemoState>

        {/* ── State 5: Response complete ──────────────────────────────────── */}
        <DemoState label="5 · Response complete">
          <MessageRow msg={mockAiMsg} showCoachmark={false} onReplay={() => {}} />
        </DemoState>

        {/* ── State 6: Response + receipt ─────────────────────────────────── */}
        <DemoState label="6 · Response + receipt">
          <div className="flex flex-col gap-2">
            <MessageRow msg={{ ...mockAiMsg, id: "demo-ai-2" }} showCoachmark={false} onReplay={() => {}} />
            <ReceiptCard
              receipt={MOCK_RECEIPT}
              onReplay={() => {}}
              showCoachmark={false}
              onCoachmarkDismiss={() => {}}
            />
          </div>
        </DemoState>

        {/* ── State 7: Write action — approval required ───────────────────── */}
        <DemoState label="7 · Approval required">
          <div className="max-w-[80%] overflow-hidden rounded-2xl rounded-tl-sm border-2 border-primary text-[13px]">
              {/* Action Required header band */}
              <div className="bg-muted px-4 py-2">
                <span className="text-[10.5px] font-semibold uppercase tracking-widest text-foreground/70">
                  Action Required
                </span>
              </div>
              {/* Body */}
              <div className="bg-background px-4 py-3">
                <p className="mb-3">
                  I'd like to post this update to <span className="font-semibold">#eng</span>:
                </p>
                <div className="mb-4 rounded-lg bg-muted px-3 py-2 font-mono text-[11.5px] text-muted-foreground leading-relaxed">
                  *PR update (Nov 5):* 4 open PRs. feat/receipt-replay awaiting review, fix/sidebar-collapse has 2 comments, chore/update-deps ready to merge.
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-[12px] font-medium text-background transition-opacity hover:opacity-90"
                  >
                    <Tick02Icon className="size-3" />
                    Approve
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] transition-colors hover:bg-muted"
                  >
                    <Cancel01Icon className="size-3" />
                    Decline
                  </button>
                </div>
              </div>
            </div>
        </DemoState>

        {/* ── State 8: Action blocked ─────────────────────────────────────── */}
        <DemoState label="8 · Action blocked by policy">
          <div className="max-w-[75%] py-1 text-[13px] leading-relaxed">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                Blocked by policy
              </span>
            </div>
            <p>Access to billing data requires explicit authorization from a workspace admin.</p>
            <p className="mt-1.5 text-[11.5px] text-muted-foreground">
              This attempt was recorded in your receipt.
            </p>
          </div>
        </DemoState>

        {/* ── State 9: Error ──────────────────────────────────────────────── */}
        <DemoState label="9 · Error">
          <div className="max-w-[75%] py-1 text-[13px] leading-relaxed">
            <p className="mb-1.5 text-[11px] font-semibold text-destructive">Request failed</p>
            <p>The connection to GitHub timed out. Check your connection and try again.</p>
            <button
              type="button"
              className="mt-2 text-[12px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Retry
            </button>
          </div>
        </DemoState>

        {/* ── State 10: Multi-turn follow-up ──────────────────────────────── */}
        <DemoState label="10 · Multi-turn follow-up">
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-muted px-4 py-2.5 text-[13px]">
                Which one is ready to merge?
              </div>
            </div>
            <div className="max-w-[80%] py-1 text-[13px] leading-relaxed">
              <strong>#139 chore: update-deps</strong> — all checks pass, no pending reviews.
            </div>
          </div>
        </DemoState>

      </div>
    </div>
  )
}

function DemoState({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground/40">
        {label}
      </p>
      {children}
    </div>
  )
}

// ─── AppStack ────────────────────────────────────────────────────────────────

const APP_STACK_SHOW = 4

function AppStack({
  connectedApps,
  onOpenConnectedApps,
  onOpenAddTools,
}: {
  connectedApps: string[]
  onOpenConnectedApps?: () => void
  onOpenAddTools?: () => void
}) {
  const displayed = connectedApps.slice(0, APP_STACK_SHOW)
  const overflow = Math.max(0, connectedApps.length - APP_STACK_SHOW)
  const hasOverflow = overflow > 0

  return (
    <div className="flex items-center">
      {/* Stacked app icons — clickable */}
      <button
        type="button"
        onClick={onOpenConnectedApps}
        aria-label="Manage connected apps"
        className="flex items-center"
      >
        {displayed.map((appId, i) => (
          <div
            key={appId}
            className="relative size-7 overflow-hidden rounded-full border-[1.5px] border-background"
            style={{ marginLeft: i === 0 ? 0 : -7, zIndex: i + 1 }}
            title={appId}
          >
            <AppLogo name={appId} initials={appId.slice(0, 2).toUpperCase()} className="size-full rounded-full" />
          </div>
        ))}
        {hasOverflow && (
          <div
            className="relative flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-background bg-muted text-[9px] font-semibold text-muted-foreground"
            style={{ marginLeft: -7, zIndex: displayed.length + 1 }}
          >
            +{overflow}
          </div>
        )}
      </button>

      {/* Plus button — overlaps stack when no overflow; breaks out with gap when +n badge shown */}
      <button
        type="button"
        onClick={onOpenAddTools}
        aria-label="Add tools"
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground/50 transition-colors hover:text-muted-foreground",
          hasOverflow
            ? "border border-border hover:border-foreground/20"
            : "border-[1.5px] border-background",
        )}
        style={{ marginLeft: hasOverflow ? 12 : -7, zIndex: connectedApps.length + 2 }}
      >
        <Add01Icon className="size-3.5" />
      </button>
    </div>
  )
}

// ─── ComposerArea ─────────────────────────────────────────────────────────────

/** Paper plane send icon — faces upper-right (classic send direction). */
function PaperPlaneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" transform="rotate(-30 12 12)" />
    </svg>
  )
}

function ComposerArea({
  input, onChange, onSend, sending, mentionOpen, connectedApps, onInsertMention,
  onOpenAddTools, onOpenConnectedApps, showToolStrip = true, placeholder = "Ask anything…",
}: {
  input: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSend: () => void
  sending: boolean
  mentionOpen: boolean
  connectedApps: string[]
  onInsertMention: (appId: string) => void
  onOpenAddTools?: () => void
  onOpenConnectedApps?: () => void
  showToolStrip?: boolean
  placeholder?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus textarea when user starts typing anywhere on the page
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        document.activeElement !== textareaRef.current &&
        !e.ctrlKey && !e.metaKey && !e.altKey &&
        e.key.length === 1
      ) {
        textareaRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (!input && textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [input])

  function adjustHeight() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  function handleSend() {
    onSend()
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  const canSend = !!input.trim() && !sending

  return (
    <div className="relative">
      {/* Mention picker */}
      {mentionOpen && connectedApps.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-52 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
          {connectedApps.map((appId) => (
            <button
              key={appId}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onInsertMention(appId) }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] hover:bg-muted"
            >
              <AppLogo name={appId} initials={appId.slice(0, 2).toUpperCase()} className="size-5 rounded-[4px]" />
              <span>{appId}</span>
            </button>
          ))}
        </div>
      )}

      {/* Composer container */}
      <div className={cn(
        "overflow-hidden rounded-2xl border border-border bg-background transition-all duration-150",
        "focus-within:border-foreground/20 focus-within:shadow-[0_0_0_4px_oklch(0_0_0/0.04)]",
      )}>

        {/* Textarea row: upload | text | mic + send */}
        <div className="flex items-end gap-2 px-3 pt-3 pb-2.5">
          {/* Upload — inside textarea area, top-aligned */}
          <button
            type="button"
            aria-label="Upload file"
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Upload01Icon className="size-3.5" />
          </button>

          {/* Growing textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => { onChange(e); adjustHeight() }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
            }}
            placeholder={placeholder}
            className="max-h-40 flex-1 resize-none overflow-y-auto bg-transparent text-center text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground/40"
            aria-label="Chat message"
          />

          {/* Mic + Send — bottom-aligned with textarea */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              aria-label="Voice input"
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Mic01Icon className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send"
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full transition-all duration-150",
                canSend
                  ? "bg-foreground text-background hover:opacity-85"
                  : "bg-muted text-muted-foreground/30",
              )}
            >
              {sending ? (
                <span className="block size-2.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <PaperPlaneIcon className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Tool strip — only when in conversation or no-apps state */}
        {showToolStrip && (
          <div className="flex items-center border-t border-border bg-muted/40 px-3 py-1.5 animate-[slide-up-fade_0.3s_cubic-bezier(0,0,0.2,1)_both]">
            {connectedApps.length > 0 ? (
              <AppStack
                connectedApps={connectedApps}
                onOpenConnectedApps={onOpenConnectedApps}
                onOpenAddTools={onOpenAddTools}
              />
            ) : (
              <button
                type="button"
                onClick={onOpenAddTools}
                aria-label="Add tools"
                className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground/50 transition-colors hover:border-foreground/20 hover:text-muted-foreground"
              >
                <Add01Icon className="size-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
