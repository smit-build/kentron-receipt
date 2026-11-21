import { Delete02Icon, Notification01Icon, SlidersHorizontalIcon } from "hugeicons-react"

import { AppLogo } from "@/components/app-logo"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Integration } from "@/lib/integrations"

interface IntegrationCardProps extends Integration {
  /** Override connected state (workspace-level, not static integrations.ts field) */
  isConnected?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
  onManageTools?: () => void
  onNotify?: () => void
  /** Disable all actions (sample workspace) */
  disabled?: boolean
}

export function IntegrationCard({
  name,
  initials,
  status,
  isConnected,
  onConnect,
  onDisconnect,
  onManageTools,
  onNotify,
  disabled,
}: IntegrationCardProps) {
  const connected = isConnected ?? status === "connected"

  if (connected) {
    return (
      <article className="flex min-h-[72px] items-center gap-2.5 rounded-lg border border-foreground/15 bg-foreground/[0.03] p-2.5">
        <AppLogo name={name} initials={initials} />
        <div className="min-w-0 flex-1 truncate text-[12.5px] font-semibold leading-tight">
          {name}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Manage tools"
                onClick={onManageTools}
                disabled={disabled}
              >
                <SlidersHorizontalIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{disabled ? "Not available in the sample workspace" : "Manage tools"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Disconnect"
                onClick={onDisconnect}
                disabled={disabled}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive disabled:text-muted-foreground"
              >
                <Delete02Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{disabled ? "Not available in the sample workspace" : "Disconnect"}</TooltipContent>
          </Tooltip>
        </div>
      </article>
    )
  }

  if (status === "coming-soon") {
    return (
      <article className="flex min-h-[72px] items-center gap-2.5 rounded-lg border border-border bg-card p-2.5 opacity-60">
        <AppLogo name={name} initials={initials} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-semibold leading-tight text-muted-foreground">
            {name}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
            <span className="size-1 rounded-full bg-muted-foreground/60" />
            Coming soon
          </div>
        </div>
        {onNotify && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-[11px]"
            onClick={onNotify}
          >
            <Notification01Icon className="size-3.5" />
            Notify me
          </Button>
        )}
      </article>
    )
  }

  return (
    <article className="flex min-h-[72px] items-center gap-2.5 rounded-lg border border-border bg-card p-2.5">
      <AppLogo name={name} initials={initials} />
      <div className="min-w-0 flex-1 truncate text-[12.5px] font-semibold leading-tight">
        {name}
      </div>
      {onConnect && (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={onConnect}
          disabled={disabled}
        >
          Connect
        </Button>
      )}
    </article>
  )
}
