import { AppLogo } from "@/components/app-logo"
import { Badge } from "@/components/ui/badge"

interface AppUsage {
  name: string
  initials: string
  toolsUsed: number
  toolsTotal: number
  calls: number
  errors: number
  trend: string
}

const usage: AppUsage[] = [
  {
    name: "GitHub",
    initials: "GI",
    toolsUsed: 9,
    toolsTotal: 14,
    calls: 742,
    errors: 0,
    trend: "M1 18 14 14 27 16 40 8 53 11 66 5 79 9",
  },
  {
    name: "Slack",
    initials: "SL",
    toolsUsed: 6,
    toolsTotal: 20,
    calls: 391,
    errors: 3,
    trend: "M1 12 14 16 27 9 40 13 53 6 66 12 79 10",
  },
  {
    name: "Notion",
    initials: "NO",
    toolsUsed: 9,
    toolsTotal: 27,
    calls: 151,
    errors: 0,
    trend: "M1 20 14 19 27 20 40 16 53 17 66 14 79 15",
  },
]

export function UsageByApp() {
  return (
    <div className="flex flex-col">
      {usage.map((app) => (
        <div
          key={app.name}
          className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-t border-border py-2.5 first:border-t-0"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <AppLogo name={app.name} initials={app.initials} className="size-8" />
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-semibold leading-tight">
                {app.name}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                {app.toolsUsed} of {app.toolsTotal} tools
              </div>
            </div>
          </div>

          <svg
            className="h-6 w-20 shrink-0 text-foreground/70"
            viewBox="0 0 80 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d={app.trend}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="text-right font-mono text-[12.5px] tabular-nums">
            {app.calls}
          </div>

          <Badge
            variant={app.errors > 0 ? "destructive" : "secondary"}
            className="justify-self-end"
          >
            {app.errors} error{app.errors === 1 ? "" : "s"}
          </Badge>
        </div>
      ))}
    </div>
  )
}
