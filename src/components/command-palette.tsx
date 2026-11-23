import { useEffect, useRef, useState } from "react"
import { Search01Icon } from "hugeicons-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { AppLogo } from "@/components/app-logo"
import { integrations, type Integration } from "@/lib/integrations"
import { cn } from "@/lib/utils"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectIntegration?: (integration: Integration) => void
}

export function CommandPalette({ open, onOpenChange, onSelectIntegration }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = query.trim()
    ? integrations.filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          i.category.toLowerCase().includes(query.toLowerCase())
      )
    : integrations

  useEffect(() => {
    if (open) {
      setQuery("")
      setActiveIndex(0)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const item = list.children[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = filtered[activeIndex]
      if (item) {
        onSelectIntegration?.(item)
        onOpenChange(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden p-0 sm:max-w-lg"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">Search integrations</DialogTitle>

        {/* Search bar */}
        <div className="flex items-center gap-2.5 border-b border-border px-3.5 py-3">
          <Search01Icon className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search integrations…"
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
            aria-label="Search integrations"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            esc
          </kbd>
        </div>

        {/* Results */}
        <ul ref={listRef} className="max-h-[360px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <li className="py-10 text-center text-[13px] text-muted-foreground">
              No integrations found
            </li>
          ) : (
            filtered.map((integration, i) => (
              <li key={`${integration.name}-${i}`}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
                    i === activeIndex ? "bg-muted" : "hover:bg-muted/60"
                  )}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => {
                    onSelectIntegration?.(integration)
                    onOpenChange(false)
                  }}
                >
                  <AppLogo
                    name={integration.name}
                    initials={integration.initials}
                    className="size-7 rounded text-[9px]"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium leading-tight">
                      {integration.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{integration.category}</span>
                  </div>
                  {integration.status === "connected" && (
                    <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-foreground/40" />
                      Connected
                    </span>
                  )}
                  {integration.status === "coming-soon" && (
                    <span className="shrink-0 text-[11px] text-muted-foreground/50">Soon</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>

        {/* Footer hint */}
        <div className="flex items-center gap-4 border-t border-border px-3.5 py-2">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">↵</kbd>
            open
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
