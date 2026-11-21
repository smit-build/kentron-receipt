import { useState } from "react"
import { Add01Icon } from "hugeicons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export interface Workspace {
  id: string
  name: string
  isSample?: boolean
}

interface WorkspaceSwitcherProps {
  workspaces: Workspace[]
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
}

const COLLAPSED_VISIBLE_COUNT = 3

export function WorkspaceSwitcherList({
  workspaces,
  activeId,
  onSelect,
  onCreate,
}: WorkspaceSwitcherProps) {
  const [expanded, setExpanded] = useState(false)
  const canExpand = workspaces.length > COLLAPSED_VISIBLE_COUNT

  return (
    <SidebarGroup>
      <div className="rounded-lg bg-sidebar-accent/60 p-1.5 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
        <SidebarGroupLabel className="justify-between pr-1 text-[14px]" asChild>
          <div>
            <span>Workspace</span>
            <button
              type="button"
              onClick={onCreate}
              className="flex h-5 shrink-0 items-center gap-1 rounded-sm px-1 text-[11px] font-medium hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
            >
              <Add01Icon className="size-3.5" />
              Create new
            </button>
          </div>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu
            className={cn(
              !expanded && canExpand && "max-h-[112px] overflow-hidden"
            )}
          >
            {workspaces.map((ws) => (
              <SidebarMenuItem key={ws.id}>
                <SidebarMenuButton
                  isActive={ws.id === activeId}
                  tooltip={ws.name}
                  onClick={() => onSelect(ws.id)}
                  className={cn(ws.id === activeId && "font-medium")}
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.isSample && (
                    <span className="ml-auto shrink-0 rounded-sm bg-muted px-1 py-0.5 text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
                      Sample
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          {canExpand && (
            <div className="mt-1 flex justify-center group-data-[collapsible=icon]:hidden">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="rounded-md px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
              >
                {expanded ? "Hide" : "View more"}
              </button>
            </div>
          )}
        </SidebarGroupContent>
      </div>
    </SidebarGroup>
  )
}
