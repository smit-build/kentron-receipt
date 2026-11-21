/**
 * Sheet for selecting which tools agents can use for a given app.
 * Read tools: on by default. Write tools: off by default.
 * [TODO founder: confirm default tool selection per app]
 */
import { useState } from "react"
import { defaultTools } from "@/lib/services/integrations-svc"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AppLogo } from "@/components/app-logo"
import { integrations } from "@/lib/integrations"
import { cn } from "@/lib/utils"

/** Write tools per app — off by default. [TODO founder: confirm] */
const WRITE_TOOLS: Record<string, string[]> = {
  GitHub: ["create_issue", "create_pr", "merge_pr", "post_comment"],
  Slack: ["post_message", "send_dm", "create_channel"],
  Notion: ["create_page", "update_page", "delete_page"],
  Linear: ["create_issue", "update_issue", "close_issue"],
  Jira: ["create_issue", "update_issue", "transition_issue"],
  Gmail: ["send_email", "reply_to_email", "delete_email"],
  "Google Calendar": ["create_event", "update_event", "delete_event"],
  "Google Drive": ["upload_file", "move_file", "delete_file"],
  "Google Docs": ["create_document", "update_document"],
  "Google Sheet": ["update_cell", "append_row", "delete_row"],
  HubSpot: ["update_deal", "create_contact", "send_email"],
  "Stripe App": ["create_charge", "refund_charge", "cancel_subscription"],
  Datadog: ["update_monitor", "mute_monitor", "create_monitor"],
  Confluence: ["create_page", "update_page"],
  Airtable: ["create_record", "update_record", "delete_record"],
  Apollo: ["update_contact", "send_email", "create_sequence"],
  Vercel: ["trigger_deployment", "rollback_deployment"],
  YouTube: ["update_video", "delete_video"],
  Zoom: ["start_meeting", "end_meeting"],
}

function getInitials(name: string): string {
  const found = integrations.find((i) => i.name === name)
  return found?.initials ?? name.slice(0, 2).toUpperCase()
}

interface ChooseToolsSheetProps {
  appId: string
  initialEnabledTools: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (tools: string[]) => void
}

export function ChooseToolsSheet({
  appId,
  initialEnabledTools,
  open,
  onOpenChange,
  onSaved,
}: ChooseToolsSheetProps) {
  const readTools = defaultTools(appId)
  const writeTools = WRITE_TOOLS[appId] ?? []
  const allTools = [...readTools, ...writeTools]

  const [enabled, setEnabled] = useState<Set<string>>(() => new Set(initialEnabledTools))

  function toggle(tool: string) {
    setEnabled((prev) => {
      const next = new Set(prev)
      if (next.has(tool)) next.delete(tool)
      else next.add(tool)
      return next
    })
  }

  function handleSave() {
    onSaved(Array.from(enabled))
  }

  const enabledCount = enabled.size
  const totalCount = allTools.length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <AppLogo name={appId} initials={getInitials(appId)} className="size-7 rounded-[5px]" />
            <SheetTitle className="text-sm">{appId}</SheetTitle>
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Agents can only use the tools you turn on. Change this anytime.
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Read tools */}
          {readTools.length > 0 && (
            <div>
              <div className="px-5 pb-1 pt-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Read
                </span>
              </div>
              <div className="flex flex-col">
                {readTools.map((tool) => (
                  <ToolRow
                    key={tool}
                    tool={tool}
                    enabled={enabled.has(tool)}
                    onToggle={() => toggle(tool)}
                    isWrite={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Write tools */}
          {writeTools.length > 0 && (
            <div>
              <Separator className="my-1" />
              <div className="px-5 pb-1 pt-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Write
                </span>
              </div>
              <div className="flex flex-col">
                {writeTools.map((tool) => (
                  <ToolRow
                    key={tool}
                    tool={tool}
                    enabled={enabled.has(tool)}
                    onToggle={() => toggle(tool)}
                    isWrite={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-border px-5 py-4">
          <div className="flex w-full items-center justify-between">
            <span className="text-[12px] text-muted-foreground">
              {enabledCount} of {totalCount} tools on
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function ToolRow({
  tool,
  enabled,
  onToggle,
  isWrite,
}: {
  tool: string
  enabled: boolean
  onToggle: () => void
  isWrite: boolean
}) {
  const id = `tool-${tool}`
  const label = tool.replace(/_/g, " ")
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-muted/50",
        "transition-colors"
      )}
    >
      <div className="flex flex-col">
        <Label
          htmlFor={id}
          className="cursor-pointer text-[13px] font-normal capitalize"
        >
          {label}
        </Label>
        {isWrite && (
          <span className="text-[11px] text-muted-foreground">Write action</span>
        )}
      </div>
      <Switch id={id} checked={enabled} onCheckedChange={onToggle} aria-label={label} />
    </div>
  )
}
