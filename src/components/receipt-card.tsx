/**
 * Receipt card — shown under assistant replies that used tools.
 * Collapsed: icon · "Receipt" · step count · Verified · duration · Replay.
 * Expanded: ordered step rows with app logo, tool name, status, duration.
 */
import { useState } from "react"
import { ArrowDown01Icon, ArrowRight01Icon, File01Icon, MoreHorizontalIcon, Tick01Icon } from "hugeicons-react"
import type { Receipt } from "@/lib/store"
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

interface ReceiptCardProps {
  receipt: Receipt
  onReplay: (receipt: Receipt) => void
  showCoachmark?: boolean
  onCoachmarkDismiss?: () => void
}

export function ReceiptCard({ receipt, onReplay, showCoachmark, onCoachmarkDismiss }: ReceiptCardProps) {
  const [expanded, setExpanded] = useState(false)

  const hasBlocked = receipt.steps.some((s) => s.status === "blocked")
  const hasAwaiting = receipt.steps.some((s) => s.status === "awaiting")
  const overallStatus = hasBlocked ? "blocked" : hasAwaiting ? "awaiting" : "verified"

  return (
    <div className="relative mt-2">
      {/* Coachmark */}
      {showCoachmark && (
        <div className="mb-2 rounded-md border border-border bg-muted/60 px-3 py-2.5">
          <p className="text-[12px] text-foreground">
            <span className="font-semibold">This is a receipt.</span> Every action the agent took, in
            order, and it can't be edited. Replay it anytime.
          </p>
          <button
            type="button"
            onClick={onCoachmarkDismiss}
            className="mt-1 text-[11px] text-muted-foreground underline underline-offset-2"
          >
            Got it
          </button>
        </div>
      )}

      <div className="rounded-md border border-border bg-muted/30">
        {/* Collapsed header */}
        <div className="flex items-center gap-2 px-3 py-2">
          <File01Icon className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-[12px] font-medium">Receipt</span>
          <span className="text-[12px] text-muted-foreground">{receipt.steps.length} steps</span>

          <span
            className={cn(
              "ml-auto rounded-sm px-1.5 py-0.5 text-[11px] font-medium",
              overallStatus === "verified" && "bg-foreground/8 text-foreground",
              overallStatus === "awaiting" && "bg-muted text-muted-foreground",
              overallStatus === "blocked" && "bg-destructive/10 text-destructive"
            )}
          >
            {overallStatus === "verified" && <><Tick01Icon className="mr-0.5 inline size-3" />Verified</>}
            {overallStatus === "awaiting" && "Awaiting approval"}
            {overallStatus === "blocked" && "Blocked"}
          </span>

          <span className="text-[11px] text-muted-foreground">{fmtDuration(receipt.durationMs)}</span>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded px-1.5 py-0.5 text-[12px] text-muted-foreground hover:text-foreground"
            aria-label={expanded ? "Collapse receipt" : "Expand receipt"}
          >
            {expanded ? <ArrowDown01Icon className="size-3.5" /> : <ArrowRight01Icon className="size-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => onReplay(receipt)}
            className="rounded px-2 py-0.5 text-[12px] font-medium text-foreground hover:bg-muted"
          >
            Replay
          </button>
        </div>

        {/* Expanded steps */}
        {expanded && (
          <div className="border-t border-border">
            {receipt.steps.map((step, i) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-2.5 px-3 py-2",
                  i < receipt.steps.length - 1 && "border-b border-border"
                )}
              >
                <div className="flex shrink-0 flex-col items-center pt-0.5">
                  <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                </div>
                <AppLogo name={step.appId} initials={getInitials(step.appId)} className="size-5 rounded-[3px]" />
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-medium">{step.toolName.replace(/_/g, " ")}</span>
                    <span
                      className={cn(
                        "rounded-sm px-1 py-0.5 text-[10px]",
                        step.status === "success" && "text-muted-foreground",
                        step.status === "awaiting" && "bg-muted text-muted-foreground",
                        step.status === "blocked" && "text-destructive"
                      )}
                    >
                      {step.status === "success" ? "" : step.status === "awaiting" ? "Awaiting approval" : "Blocked"}
                    </span>
                    <div className="ml-auto">
                      {step.durationMs > 0 ? (
                        <span className="text-[11px] text-muted-foreground">{fmtDuration(step.durationMs)}</span>
                      ) : (
                        <button
                          type="button"
                          className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Step options"
                        >
                          <MoreHorizontalIcon className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{step.inputSummary}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
