/**
 * Execution trace panel — v2
 *
 * Key changes from v1:
 * - Two tabs: Summary | Work
 * - "Verify chain" button removed — auto-verified, "Chain intact" badge in header
 * - Summary: outcome + 4 stat tiles + outcomes breakdown + per-app breakdown
 * - Work: filter pills + card-style step rows + "then" connectors + animation
 */
import { useEffect, useMemo, useState } from "react"
import { Cancel01Icon, Tick02Icon } from "hugeicons-react"
import type { Receipt, ReceiptStep } from "@/lib/store"
import { AppLogo } from "@/components/app-logo"
import { integrations } from "@/lib/integrations"
import { cn } from "@/lib/utils"

function getInitials(name: string) {
  return integrations.find((i) => i.name === name)?.initials ?? name.slice(0, 2).toUpperCase()
}

function fmtDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

type Tab = "summary" | "work"
type Filter = "all" | "success" | "awaiting" | "blocked"

interface ReceiptReplayPanelProps {
  receipt: Receipt
  onClose: () => void
}

export function ReceiptReplayPanel({ receipt, onClose }: ReceiptReplayPanelProps) {
  const reduced = prefersReducedMotion()
  const [visibleCount, setVisibleCount] = useState(reduced ? receipt.steps.length : 0)
  const [tab, setTab] = useState<Tab>("work")
  const [filter, setFilter] = useState<Filter>("all")

  const counts = useMemo(() => ({
    success: receipt.steps.filter((s) => s.status === "success").length,
    awaiting: receipt.steps.filter((s) => s.status === "awaiting").length,
    blocked: receipt.steps.filter((s) => s.status === "blocked").length,
  }), [receipt.steps])

  const appBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    receipt.steps.forEach((s) => map.set(s.appId, (map.get(s.appId) ?? 0) + 1))
    return [...map.entries()].map(([appId, calls]) => ({ appId, calls }))
  }, [receipt.steps])

  const successRate = receipt.steps.length > 0
    ? Math.round((counts.success / receipt.steps.length) * 100)
    : 0

  const overallStatus = counts.blocked > 0 ? "blocked" : counts.awaiting > 0 ? "awaiting" : "completed"

  // Replay animation
  useEffect(() => {
    if (reduced) { setVisibleCount(receipt.steps.length); return }
    setVisibleCount(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    receipt.steps.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleCount(i + 1), (i + 1) * 700))
    })
    return () => timers.forEach(clearTimeout)
  }, [receipt.id, receipt.steps.length, reduced])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // Filtered steps — keep original index for animation tracking
  const filteredSteps = useMemo(() =>
    receipt.steps
      .map((step, originalIndex) => ({ step, originalIndex }))
      .filter(({ step }) => filter === "all" || step.status === filter),
    [receipt.steps, filter]
  )

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm sm:hidden"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Execution trace"
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-background sm:w-[420px]"
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold">Execution trace</p>
              <span className="inline-flex items-center gap-1 rounded-sm bg-foreground/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-foreground/60">
                <Tick02Icon className="size-2.5" />
                Chain intact
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {receipt.steps.length} steps · {fmtDuration(receipt.durationMs)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-muted"
            aria-label="Close execution trace"
          >
            <Cancel01Icon className="size-4" />
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex border-b border-border">
          {(["summary", "work"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "relative px-5 py-2.5 text-[12.5px] font-medium transition-colors",
                tab === t
                  ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {tab === "summary" ? (
            <SummaryTab
              receipt={receipt}
              counts={counts}
              successRate={successRate}
              appBreakdown={appBreakdown}
              overallStatus={overallStatus}
            />
          ) : (
            <WorkTab
              receipt={receipt}
              filter={filter}
              setFilter={setFilter}
              filteredSteps={filteredSteps}
              visibleCount={visibleCount}
              counts={counts}
            />
          )}
        </div>
      </div>
    </>
  )
}

// ── Summary tab ─────────────────────────────────────────────────────────────

interface SummaryTabProps {
  receipt: Receipt
  counts: { success: number; awaiting: number; blocked: number }
  successRate: number
  appBreakdown: { appId: string; calls: number }[]
  overallStatus: "completed" | "awaiting" | "blocked"
}

function SummaryTab({ receipt, counts, successRate, appBreakdown, overallStatus }: SummaryTabProps) {
  return (
    <div className="divide-y divide-border">
      {/* Outcome */}
      <div className="px-5 py-4">
        <p className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Outcome
        </p>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-semibold",
            overallStatus === "completed" && "bg-foreground/[0.07] text-foreground",
            overallStatus === "awaiting" && "bg-muted text-muted-foreground",
            overallStatus === "blocked" && "bg-destructive/10 text-destructive"
          )}
        >
          {overallStatus === "completed" && <Tick02Icon className="size-3.5" />}
          {overallStatus === "completed" ? "Completed" : overallStatus === "awaiting" ? "Awaiting approval" : "Blocked"}
        </span>
      </div>

      {/* Stats 2×2 */}
      <div className="grid grid-cols-2">
        {[
          { label: "Duration", value: fmtDuration(receipt.durationMs) },
          { label: "Steps", value: String(receipt.steps.length) },
          { label: "Apps used", value: String(appBreakdown.length) },
          { label: "Success rate", value: `${successRate}%` },
        ].map(({ label, value }, i) => (
          <div
            key={label}
            className={cn(
              "px-5 py-4",
              i % 2 === 0 && "border-r border-border",
              i < 2 && "border-b border-border"
            )}
          >
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-[20px] font-semibold tabular-nums tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Outcomes */}
      <div className="px-5 py-4">
        <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Outcomes
        </p>
        <div className="flex flex-col gap-2">
          {[
            { label: "Succeeded", count: counts.success, dot: "bg-foreground" },
            { label: "Awaiting approval", count: counts.awaiting, dot: "bg-muted-foreground/50" },
            { label: "Blocked", count: counts.blocked, dot: "bg-destructive" },
          ].map(({ label, count, dot }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className={cn("size-1.5 shrink-0 rounded-full", dot)} />
              <span className="text-[12.5px] text-foreground/80">{label}</span>
              <span className="ml-auto font-mono text-[12.5px] tabular-nums text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Apps */}
      <div className="px-5 py-4">
        <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Apps
        </p>
        <div className="flex flex-col gap-3">
          {appBreakdown.map(({ appId, calls }) => (
            <div key={appId} className="flex items-center gap-2.5">
              <AppLogo name={appId} initials={getInitials(appId)} className="size-5 shrink-0 rounded-[3px]" />
              <span className="text-[12.5px]">{appId}</span>
              <span className="ml-auto text-[11.5px] text-muted-foreground">
                {calls} {calls === 1 ? "call" : "calls"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Work tab ────────────────────────────────────────────────────────────────

interface WorkTabProps {
  receipt: Receipt
  filter: Filter
  setFilter: (f: Filter) => void
  filteredSteps: { step: ReceiptStep; originalIndex: number }[]
  visibleCount: number
  counts: { success: number; awaiting: number; blocked: number }
}

function WorkTab({ receipt, filter, setFilter, filteredSteps, visibleCount, counts }: WorkTabProps) {
  const pills: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: receipt.steps.length },
    { key: "success", label: "Succeeded", count: counts.success },
    ...(counts.awaiting > 0 ? [{ key: "awaiting" as Filter, label: "Awaiting", count: counts.awaiting }] : []),
    ...(counts.blocked > 0 ? [{ key: "blocked" as Filter, label: "Blocked", count: counts.blocked }] : []),
  ]

  return (
    <div>
      {/* Filter pills */}
      <div className="flex items-center gap-1.5 border-b border-border px-5 py-2.5">
        {pills.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors",
              filter === key
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            <span className={cn(
              "font-mono text-[10px] tabular-nums",
              filter === key ? "text-background/60" : "text-muted-foreground/60"
            )}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Steps */}
      <div className="px-4 py-4">
        {filteredSteps.map(({ step, originalIndex }, i) => {
          const visible = originalIndex < visibleCount
          const isLast = i === filteredSteps.length - 1
          const isActive = originalIndex === visibleCount - 1 && step.status === "awaiting"

          return (
            <div key={step.id}>
              {/* Step card */}
              <div
                className={cn(
                  "overflow-hidden rounded-lg border border-border transition-all duration-500",
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
                )}
              >
                {/* Card header */}
                <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
                  {/* Status dot */}
                  <div
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all duration-500",
                      !visible && "border-border bg-background opacity-30",
                      visible && step.status === "success" && "border-foreground bg-foreground",
                      visible && step.status === "awaiting" && "border-foreground/40 bg-background",
                      visible && step.status === "blocked" && "border-destructive bg-destructive/10"
                    )}
                  >
                    {visible && step.status === "success" && (
                      <Tick02Icon className="size-2.5 text-background" />
                    )}
                    {visible && step.status === "awaiting" && (
                      <span className="block size-1.5 rounded-full border border-foreground/40 border-t-transparent animate-spin" />
                    )}
                    {visible && step.status === "blocked" && (
                      <Cancel01Icon className="size-2.5 text-destructive" />
                    )}
                    {!visible && <span className="size-1.5 rounded-full bg-muted-foreground/20" />}
                  </div>

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                    Step {originalIndex + 1} · Tool
                  </span>

                  <span
                    className={cn(
                      "ml-auto text-[10.5px] font-medium",
                      step.status === "success" && "text-foreground/60",
                      step.status === "awaiting" && "text-muted-foreground",
                      step.status === "blocked" && "text-destructive"
                    )}
                  >
                    {step.status === "success" ? "Succeeded" : step.status === "awaiting" ? "Awaiting" : "Blocked"}
                  </span>

                  {step.durationMs > 0 && (
                    <span className="font-mono text-[10px] text-muted-foreground/50">
                      {fmtDuration(step.durationMs)}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="flex items-start gap-2.5 px-3 py-2.5">
                  <AppLogo
                    name={step.appId}
                    initials={getInitials(step.appId)}
                    className="mt-0.5 size-4 shrink-0 rounded-[3px]"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[13px] font-medium leading-tight">
                      {step.toolName.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] leading-snug text-muted-foreground">
                      {step.inputSummary}
                    </span>
                    {isActive && (
                      <span className="mt-0.5 text-[10.5px] italic text-muted-foreground/60">
                        Awaiting approval…
                      </span>
                    )}
                    <span className="mt-0.5 font-mono text-[10px] text-muted-foreground/35">
                      #{step.hash}
                    </span>
                  </div>
                </div>
              </div>

              {/* "then" connector */}
              {!isLast && (
                <div className="flex items-center gap-2 py-1.5 pl-3">
                  <div className="flex w-4 justify-center">
                    <div
                      className={cn(
                        "h-4 w-px transition-colors duration-500",
                        visible ? "bg-foreground/20" : "bg-border"
                      )}
                    />
                  </div>
                  <span className="text-[9.5px] font-semibold uppercase tracking-widest text-muted-foreground/35">
                    then
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
