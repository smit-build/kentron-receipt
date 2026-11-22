import { appLogos } from "@/lib/app-logos"
import { cn } from "@/lib/utils"

interface AppLogoProps {
  name: string
  initials: string
  className?: string
}

export function AppLogo({ name, initials, className }: AppLogoProps) {
  const logo = appLogos[name]

  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground",
        className
      )}
    >
      {logo ? (
        <logo.Icon className="size-[1.125rem]" color={logo.hex} />
      ) : (
        <span className="text-[9px] font-bold tracking-wide">{initials}</span>
      )}
    </div>
  )
}
