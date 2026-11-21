/**
 * "How Receipt works" diagram.
 * size="compact": static visual. Used in onboarding, Chat state B, connect-client dialog.
 * size="full": animated loop (phases 0-6). blocked prop shows blocked flow variant.
 */
import { useEffect, useRef, useState } from "react"
import { ArrowDown01Icon, ArrowRight01Icon, Cancel01Icon, File01Icon, Settings01Icon, Shield01Icon, Tick01Icon } from "hugeicons-react"
import { AppLogo } from "@/components/app-logo"
import { integrations } from "@/lib/integrations"
import { cn } from "@/lib/utils"
import receiptLogo from "@/assets/receipt-logo.png"

interface HowReceiptWorksProps {
  size?: "full" | "compact"
  workspaceName?: string
  connectedAppIds?: string[]
  animated?: boolean
  blocked?: boolean
  className?: string
}

const CLIENT_TILES = [
  { abbr: "CL", label: "Claude" },
  { abbr: "CU", label: "Cursor" },
  { abbr: "CX", label: "Codex" },
]

const DEFAULT_FADED_APPS = ["GitHub", "Slack", "Notion"]

// Animation phase durations (ms)
const PHASE_DURATIONS = [600, 500, 500, 500, 500, 800, 1200]

function getInitials(name: string): string {
  const found = integrations.find((i) => i.name === name)
  return found?.initials ?? name.slice(0, 2).toUpperCase()
}

export function HowReceiptWorks({
  size = "compact",
  workspaceName = "Your workspace",
  connectedAppIds,
  animated = false,
  blocked = false,
  className,
}: HowReceiptWorksProps) {
  const hasApps = connectedAppIds && connectedAppIds.length > 0
  const appList = hasApps ? connectedAppIds.slice(0, 4) : DEFAULT_FADED_APPS
  const faded = !hasApps

  // Animation state (only used when size=full && animated=true)
  const [phase, setPhase] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Respect prefers-reduced-motion
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const shouldAnimate = size === "full" && animated && !prefersReduced

  useEffect(() => {
    if (!shouldAnimate || paused) return
    const duration = PHASE_DURATIONS[phase] ?? 600
    timerRef.current = setTimeout(() => {
      setPhase((p) => (p + 1) % PHASE_DURATIONS.length)
    }, duration)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [phase, paused, shouldAnimate])

  // Derived display states from phase
  const leftConnectorActive = phase >= 1
  const row1Active = phase >= 2
  const row2Active = phase >= 3
  const row3Active = phase >= 4
  const rightConnectorActive = phase >= 4
  const chipVisible = phase >= 5

  const caption =
    size === "compact"
      ? "Every request is checked, limited and recorded."
      : "Your AI client never talks to your apps directly. Every request goes through this workspace, gets checked against your guardrails, is limited to the tools you allowed, and is recorded as a receipt you can replay and verify."

  const rows = [
    { Icon: Shield01Icon, label: blocked ? "Checks your guardrails" : "Checks your guardrails", active: row1Active, blocked: blocked && row1Active },
    { Icon: Settings01Icon, label: "Uses only allowed tools", active: row2Active, blocked: false },
    { Icon: File01Icon, label: "Writes a receipt", active: row3Active, blocked: false },
  ]

  return (
    <div
      className={cn("rounded-lg border border-border bg-muted/30 p-4", className)}
      onMouseEnter={() => { if (shouldAnimate) setPaused(true) }}
      onMouseLeave={() => { if (shouldAnimate) setPaused(false) }}
    >
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-2">
        {/* Left: AI clients */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex flex-wrap justify-center gap-1">
            <div
              className={cn(
                "flex size-7 items-center justify-center overflow-hidden rounded-[5px] border bg-background transition-colors duration-300",
                shouldAnimate && leftConnectorActive ? "border-foreground" : "border-border"
              )}
              title="Receipt Chat"
            >
              <img src={receiptLogo} alt="" className="size-5 rounded-[2px] object-cover" />
            </div>
            {CLIENT_TILES.map(({ abbr, label }) => (
              <div
                key={abbr}
                className={cn(
                  "flex size-7 items-center justify-center rounded-[5px] border bg-muted transition-colors duration-300",
                  shouldAnimate && leftConnectorActive ? "border-foreground" : "border-border"
                )}
                title={label}
              >
                <span className="text-[8px] font-bold text-muted-foreground">{abbr}</span>
              </div>
            ))}
          </div>
          <span className="text-center text-[11px] font-medium">Your AI client</span>
          <span className="text-center text-[10px] text-muted-foreground">Sends a request</span>
        </div>

        {/* Left connector */}
        <div className="hidden shrink-0 items-center self-center sm:flex">
          <div className={cn("h-px w-5 transition-colors duration-300", shouldAnimate && leftConnectorActive ? "bg-foreground" : "bg-border")} />
          <ArrowRight01Icon className={cn("size-3 transition-colors duration-300", shouldAnimate && leftConnectorActive ? "text-foreground" : "text-muted-foreground")} />
        </div>
        <div className="flex sm:hidden">
          <ArrowDown01Icon className={cn("size-3 transition-colors duration-300", shouldAnimate && leftConnectorActive ? "text-foreground" : "text-muted-foreground")} />
        </div>

        {/* Middle: Workspace card */}
        <div className="flex w-full flex-1 flex-col items-center gap-1.5">
          <div className="w-full rounded-md border border-border bg-background px-3 py-2.5">
            <div className="mb-2 truncate text-center text-[11px] font-semibold">{workspaceName}</div>
            <div className="flex flex-col gap-1.5">
              {rows.map(({ Icon, label, active, blocked: rowBlocked }) => (
                <div key={label} className={cn("flex items-center gap-1.5 transition-opacity duration-300", shouldAnimate && !active && "opacity-30")}>
                  <Icon className={cn("size-3 shrink-0 transition-colors duration-300", active ? "text-foreground" : "text-muted-foreground")} />
                  <span className={cn("text-[11px] transition-colors duration-300", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                  <span className={cn("ml-auto text-[11px] font-medium transition-all duration-300", active ? "opacity-100" : "opacity-0")}>
                    {rowBlocked
                      ? <Cancel01Icon className="size-2.5 text-destructive" />
                      : <Tick01Icon className="size-2.5" />}
                  </span>
                </div>
              ))}
            </div>

            {/* Receipt chip (animated height) */}
            {shouldAnimate && (
              <div
                className="overflow-hidden transition-[grid-template-rows] duration-500"
                style={{ display: "grid", gridTemplateRows: chipVisible ? "1fr" : "0fr" }}
              >
                <div className="min-h-0">
                  <div className={cn(
                    "mt-2 flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[11px] transition-colors duration-300",
                    blocked ? "border-border bg-muted/60 text-muted-foreground" : "border-foreground/20 bg-foreground/5 text-foreground"
                  )}>
                    <File01Icon className="size-3 shrink-0" />
                    <span>{blocked ? "Blocked · still recorded" : "Receipt created"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Static tick marks (compact / non-animated full) */}
            {!shouldAnimate && (
              <div className="flex flex-col gap-1.5 mt-0">
                {/* rows already rendered above with static opacity */}
              </div>
            )}
          </div>
        </div>

        {/* Right connector */}
        <div className="hidden shrink-0 items-center self-center sm:flex">
          <div className={cn("h-px w-5 transition-colors duration-300", shouldAnimate && rightConnectorActive ? "bg-foreground" : "bg-border")} />
          <ArrowRight01Icon className={cn("size-3 transition-colors duration-300", shouldAnimate && rightConnectorActive ? "text-foreground" : "text-muted-foreground")} />
        </div>
        <div className="flex sm:hidden">
          <ArrowDown01Icon className={cn("size-3 transition-colors duration-300", shouldAnimate && rightConnectorActive ? "text-foreground" : "text-muted-foreground")} />
        </div>

        {/* Right: Apps */}
        <div className="flex flex-col items-center gap-1.5">
          <div className={cn(
            "flex flex-wrap justify-center gap-1 transition-opacity duration-300",
            faded && "opacity-35",
            shouldAnimate && !rightConnectorActive && "opacity-30"
          )}>
            {appList.map((appId) => (
              <AppLogo
                key={appId}
                name={appId}
                initials={getInitials(appId)}
                className="size-7 rounded-[5px]"
              />
            ))}
          </div>
          <span className="text-center text-[11px] font-medium">Your apps</span>
          {faded && (
            <span className="text-center text-[10px] text-muted-foreground">Connect apps</span>
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">{caption}</p>
    </div>
  )
}
