/**
 * ConnectClientDialog — full "Connect an AI client" flow.
 * Steps: pick → setup → waiting → success | timeout
 * Dev panel "Simulate client call" resolves waiting immediately.
 */
import { useEffect, useRef, useState } from "react"
import {
  Copy01Icon,
  Tick02Icon,
  ArrowLeft01Icon,
  AlertCircleIcon,
  File01Icon,
} from "hugeicons-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { HowReceiptWorks } from "@/components/how-receipt-works"
import { useStore } from "@/lib/store"
import { waitForClientCall, type ClientType, CLIENT_LABELS } from "@/lib/services/clients"
import { clientLogos } from "@/lib/app-logos"
import { buildSampleReceipts } from "@/lib/services/receipts"
import type { Receipt } from "@/lib/store"

type DialogStep = "pick" | "setup" | "waiting" | "success" | "timeout"

interface ConnectClientDialogProps {
  workspaceId: string
  workspaceName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// 2 min timeout
const WAIT_TIMEOUT_MS = 120_000

interface ClientCard {
  type: ClientType
  abbr: string
  description: string
}

const CLIENTS: ClientCard[] = [
  { type: "claude-ai", abbr: "CL", description: "Browser chat at claude.ai" },
  { type: "claude-desktop", abbr: "CD", description: "Mac & Windows desktop app" },
  { type: "claude-code", abbr: "CC", description: "CLI for coding with Claude" },
  { type: "cursor", abbr: "CU", description: "AI-first code editor" },
  { type: "codex", abbr: "CX", description: "OpenAI Codex" },
  { type: "other", abbr: "?", description: "Any MCP-compatible client" },
]

function getSetupSteps(type: ClientType, workspaceId: string): Array<{ label: string; command?: string }> {
  const endpoint = `https://mcp.receipt.ai/ws/${workspaceId}`
  switch (type) {
    case "claude-ai":
      return [
        { label: "Open Claude.ai → Settings → Integrations" },
        { label: 'Click "Add MCP server" and paste your endpoint', command: endpoint },
        { label: "Save and reload Claude.ai" },
      ]
    case "claude-desktop":
      return [
        { label: "Open your Claude Desktop config file", command: "open ~/Library/Application\\ Support/Claude/claude_desktop_config.json" },
        {
          label: "Add the Receipt server block",
          command: JSON.stringify({ mcpServers: { receipt: { command: "npx", args: ["@receipt/mcp", workspaceId] } } }, null, 2),
        },
        { label: "Restart Claude Desktop" },
      ]
    case "claude-code":
      return [
        { label: "Add Receipt via the Claude Code CLI", command: `claude mcp add receipt -- npx @receipt/mcp ${workspaceId}` },
        { label: "Restart any running Claude Code sessions" },
      ]
    case "cursor":
      return [
        { label: "Open Cursor → Settings → MCP Servers" },
        { label: "Add a new server with this command", command: `npx @receipt/mcp ${workspaceId}` },
        { label: "Reload Cursor" },
      ]
    case "codex":
      return [
        { label: "Add to your Codex config", command: `codex mcp add --name receipt --command "npx @receipt/mcp ${workspaceId}"` },
        { label: "Restart Codex" },
      ]
    default:
      return [
        { label: "Start the Receipt MCP server", command: `npx @receipt/mcp ${workspaceId}` },
        { label: "Point your client's MCP config at the running server" },
      ]
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
      aria-label="Copy"
    >
      {copied ? <Tick02Icon className="size-3.5" /> : <Copy01Icon className="size-3.5" />}
    </button>
  )
}

export function ConnectClientDialog({
  workspaceId,
  workspaceName = "Your workspace",
  open,
  onOpenChange,
}: ConnectClientDialogProps) {
  const { dispatch } = useStore()
  const [step, setStep] = useState<DialogStep>("pick")
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null)
  const [connectedReceipt, setConnectedReceipt] = useState<Receipt | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const cancelWaitRef = useRef<(() => void) | null>(null)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep("pick")
      setSelectedClient(null)
      setConnectedReceipt(null)
      setElapsed(0)
    } else {
      cancelWaitRef.current?.()
    }
  }, [open])

  function handleSelectClient(type: ClientType) {
    setSelectedClient(type)
    setStep("setup")
  }

  function startWaiting() {
    setStep("waiting")
    setElapsed(0)

    // Elapsed counter
    elapsedTimerRef.current = setInterval(() => {
      setElapsed((s) => s + 1)
    }, 1000)

    const cancel = waitForClientCall(
      workspaceId,
      () => handleClientConnected(),
      WAIT_TIMEOUT_MS,
    )
    cancelWaitRef.current = cancel

    // Also set a timeout for the dialog to show timeout state
    setTimeout(() => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current)
      setStep((prev) => (prev === "waiting" ? "timeout" : prev))
    }, WAIT_TIMEOUT_MS)
  }

  function handleClientConnected() {
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current)
    cancelWaitRef.current = null

    if (!selectedClient) return

    // Dispatch CONNECT_CLIENT
    dispatch({
      type: "CONNECT_CLIENT",
      payload: {
        workspaceId,
        client: {
          id: crypto.randomUUID(),
          clientType: selectedClient,
          connectedAt: Date.now(),
        },
      },
    })

    // Create a sample receipt for the successful call
    const receipts = buildSampleReceipts(workspaceId)
    const receipt: Receipt = {
      ...receipts[0],
      id: crypto.randomUUID(),
      workspaceId,
      createdAt: Date.now(),
      isSample: false,
    }
    dispatch({ type: "ADD_RECEIPT", payload: receipt })
    setConnectedReceipt(receipt)
    setStep("success")
  }

  function handleCheckAgain() {
    startWaiting()
  }

  const setupSteps = selectedClient ? getSetupSteps(selectedClient, workspaceId) : []

  // Copy all commands
  const allCommands = setupSteps.filter((s) => s.command).map((s) => s.command!).join("\n")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Pick step */}
        {step === "pick" && (
          <>
            <DialogHeader>
              <DialogTitle>Connect an AI client</DialogTitle>
              <DialogDescription className="text-[13px]">
                Choose the client you want to connect. It will route through{" "}
                <span className="font-medium text-foreground">{workspaceName}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-1">
              <HowReceiptWorks size="compact" workspaceName={workspaceName} className="mb-4" />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CLIENTS.map((c) => (
                  <button
                    key={c.type}
                    type="button"
                    onClick={() => handleSelectClient(c.type)}
                    className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-3 text-center hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex size-9 items-center justify-center rounded-[6px] border border-border bg-background text-muted-foreground">
                      {clientLogos[c.type] ? (
                        (() => { const l = clientLogos[c.type]; return <l.Icon className="size-[1.125rem]" color={l.hex} /> })()
                      ) : (
                        <span className="text-[11px] font-bold">{c.abbr}</span>
                      )}
                    </div>
                    <span className="text-[12px] font-medium">{CLIENT_LABELS[c.type]}</span>
                    <span className="text-[11px] text-muted-foreground leading-tight">{c.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Setup step */}
        {step === "setup" && selectedClient && (
          <>
            <DialogHeader>
              <div className="mb-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep("pick")}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                  aria-label="Back"
                >
                  <ArrowLeft01Icon className="size-4" />
                </button>
                <DialogTitle>{CLIENT_LABELS[selectedClient]}</DialogTitle>
              </div>
              <DialogDescription className="text-[13px]">
                Follow these steps, then click "I'm ready" to wait for your first call.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-1">
              {setupSteps.map((s, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-[13px]">{s.label}</span>
                  </div>
                  {s.command && (
                    <div className="ml-6 flex items-start gap-1 rounded-md border border-border bg-muted/50 px-2.5 py-2">
                      <code className="flex-1 break-all text-[11px] font-mono leading-relaxed text-foreground">
                        {s.command}
                      </code>
                      <CopyButton text={s.command} />
                    </div>
                  )}
                </div>
              ))}
              {allCommands && (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(allCommands).catch(() => {})}
                  className="ml-6 self-start text-[12px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Copy all commands
                </button>
              )}
              <div className="mt-2 flex justify-end">
                <Button onClick={startWaiting}>I&apos;m ready, waiting for call</Button>
              </div>
            </div>
          </>
        )}

        {/* Waiting step */}
        {step === "waiting" && (
          <>
            <DialogHeader>
              <DialogTitle>Waiting for first call</DialogTitle>
              <DialogDescription className="text-[13px]">
                Make a request in {CLIENT_LABELS[selectedClient ?? "other"]}. Receipt will intercept it.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <span className="inline-block size-2 animate-pulse rounded-full bg-foreground" />
                Listening… {elapsed > 0 && <span className="tabular-nums">{elapsed}s</span>}
              </div>
              <div className="w-full rounded-md border border-border bg-muted/40 px-4 py-3">
                <p className="mb-1.5 text-[12px] font-semibold">Try this test prompt in your client:</p>
                <p className="text-[13px] text-muted-foreground italic">
                  "List my open GitHub pull requests"
                </p>
              </div>
              <p className="text-center text-[12px] text-muted-foreground">
                Times out in {Math.max(0, Math.floor((WAIT_TIMEOUT_MS / 1000) - elapsed))}s.
                Need help? Check your config above.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  cancelWaitRef.current?.()
                  if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current)
                  setStep("setup")
                }}
              >
                Back to setup
              </Button>
            </div>
          </>
        )}

        {/* Success step */}
        {step === "success" && (
          <>
            <DialogHeader>
              <DialogTitle>Client connected</DialogTitle>
              <DialogDescription className="text-[13px]">
                {CLIENT_LABELS[selectedClient ?? "other"]} is now routing through{" "}
                <span className="font-medium text-foreground">{workspaceName}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-4 py-3">
                <div className="flex size-8 items-center justify-center rounded-full border border-foreground/20 bg-foreground/5">
                  <Tick02Icon className="size-4 text-foreground" />
                </div>
                <div>
                  <p className="text-[13px] font-medium">First call received</p>
                  <p className="text-[12px] text-muted-foreground">Your receipt was created and verified.</p>
                </div>
              </div>
              {connectedReceipt && (
                <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5">
                  <File01Icon className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[12px] font-medium">
                      {connectedReceipt.steps[0]?.toolName.replace(/_/g, " ") ?? "Tool call"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{connectedReceipt.steps[0]?.appId} · verified</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Done
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Timeout step */}
        {step === "timeout" && (
          <>
            <DialogHeader>
              <DialogTitle>No call received</DialogTitle>
              <DialogDescription className="text-[13px]">
                We didn't receive a call within 2 minutes. Check the items below.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-2">
              <div className="rounded-md border border-border bg-muted/40 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertCircleIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <p className="text-[12px] font-semibold">Troubleshooting checklist</p>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {[
                    "MCP server is running (check terminal for errors)",
                    "Config file saved and client restarted",
                    "Workspace ID in the command matches this workspace",
                    "Network allows outbound connections to mcp.receipt.ai",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-[12px] text-muted-foreground">
                      <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStep("setup")}>
                  Back to setup
                </Button>
                <Button size="sm" onClick={handleCheckAgain}>
                  Check again
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
