/**
 * Setup checklist — "Get to your first receipt".
 * Required items: 4. Optional: 2. Driven by store checklistStatus.
 * Hides permanently once all 4 required items are done, or when user clicks Hide.
 */
import { Tick02Icon } from "hugeicons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore, checklistStatus } from "@/lib/store"
import { cn } from "@/lib/utils"

interface WorkspaceSetupCardProps {
  onConnectApp?: () => void
  onAddKey?: () => void
  onFirstPrompt?: () => void
  onInvite?: () => void
  onConnectClient?: () => void
}

export function WorkspaceSetupCard({
  onConnectApp,
  onAddKey,
  onFirstPrompt,
  onInvite,
  onConnectClient,
}: WorkspaceSetupCardProps) {
  const { state, dispatch } = useStore()
  const status = checklistStatus(state)

  if (state.checklistHidden) return null

  const required = [
    { key: "createWorkspace" as const, label: "Create a workspace", done: status.createWorkspace },
    { key: "connectApp" as const, label: "Connect an app", done: status.connectApp, action: onConnectApp, actionLabel: "Connect" },
    { key: "addOpenAIKey" as const, label: "Add your OpenAI API key", done: status.addOpenAIKey, action: onAddKey, actionLabel: "Add key" },
    { key: "firstReceipt" as const, label: "Run your first prompt in Chat", done: status.firstReceipt, action: onFirstPrompt, actionLabel: "Open Chat" },
  ]

  const optional = [
    { key: "inviteTeammate" as const, label: "Invite a teammate", done: status.inviteTeammate, action: onInvite, actionLabel: "Invite" },
    { key: "connectClient" as const, label: "Connect an AI client", done: status.connectClient, action: onConnectClient, actionLabel: "Connect" },
  ]

  const doneCount = required.filter((s) => s.done).length

  // All required done — hide permanently
  if (doneCount === required.length) return null

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="gap-1 px-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm">Get to your first receipt</CardTitle>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              {doneCount} of {required.length} done
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_CHECKLIST_HIDDEN", payload: true })}
            className="mt-0.5 shrink-0 text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Hide
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex flex-col">
          {required.map((step) => (
            <ChecklistRow
              key={step.key}
              label={step.label}
              done={step.done}
              action={step.action}
              actionLabel={step.actionLabel}
            />
          ))}
          <div className="mt-2 border-t border-dashed border-border pt-2">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recommended</p>
            {optional.map((step) => (
              <ChecklistRow
                key={step.key}
                label={step.label}
                done={step.done}
                action={step.action}
                actionLabel={step.actionLabel}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ChecklistRow({
  label,
  done,
  action,
  actionLabel,
}: {
  label: string
  done: boolean
  action?: () => void
  actionLabel?: string
}) {
  return (
    <div className="flex items-center gap-3 border-t border-dashed border-border py-2.5 first:border-t-0">
      <div
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border border-input text-background",
          done && "border-foreground bg-foreground"
        )}
      >
        {done && <Tick02Icon className="size-3" strokeWidth={3} />}
      </div>
      <div className={cn("min-w-0 flex-1 text-[13px]", done && "text-muted-foreground line-through")}>
        {label}
      </div>
      {!done && action && actionLabel && (
        <Button size="sm" variant="outline" onClick={action} className="shrink-0">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
