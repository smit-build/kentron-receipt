import {
  ArrowDown01Icon,
  File01Icon,
  JusticeScale01Icon,
  MagicWand01Icon,
  Plug01Icon,
  Pulse01Icon,
  Settings01Icon,
  Shield01Icon,
  TickDouble01Icon,
} from "hugeicons-react"
import type { ComponentType } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { WorkspaceSwitcherList, type Workspace } from "@/components/workspace-switcher"
import { NAV_ITEMS, type NavItem } from "@/lib/data/nav-config"
import { useStore, navStage as getNavStage, TOTAL_CREDITS } from "@/lib/store"
import { cn } from "@/lib/utils"
import receiptLogo from "@/assets/receipt-logo.png"

interface AppSidebarProps {
  workspaces: Workspace[]
  activeId: string | null
  onSelectWorkspace: (id: string) => void
  onCreateWorkspace: () => void
  currentRoute?: string
  onNavigate?: (route: string) => void
  onGetCredits?: () => void
}

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Pulse01Icon,
  File01Icon,
  JusticeScale01Icon,
  Shield01Icon,
  TickDouble01Icon,
  MagicWand01Icon,
  SlackIcon: Plug01Icon, // hugeicons has no SlackIcon
  Plug01Icon,
}

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name]
  if (!Icon) return null
  return <Icon className={className} />
}

function NewDot() {
  return (
    <span className="ml-auto size-1 shrink-0 rounded-full bg-foreground group-data-[collapsible=icon]:hidden" />
  )
}

export function AppSidebar({
  workspaces,
  activeId,
  onSelectWorkspace,
  onCreateWorkspace,
  currentRoute = "/chat",
  onNavigate,
  onGetCredits,
}: AppSidebarProps) {
  const { state, dispatch } = useStore()
  const nav = onNavigate ?? (() => {})
  const stage = getNavStage(state)

  function isVisible(item: NavItem): boolean {
    return state.showAllFeatures || item.unlockStage <= stage
  }

  function isNew(item: NavItem): boolean {
    return (
      item.unlockStage > 1 &&
      item.unlockStage <= stage &&
      !state.seenTips.includes(`nav-${item.id}`)
    )
  }

  function handleNav(route: string, itemId: string) {
    dispatch({ type: "MARK_TIP_SEEN", payload: `nav-${itemId}` })
    nav(route)
  }

  function handleSubNav(route: string, itemId: string) {
    dispatch({ type: "MARK_TIP_SEEN", payload: `nav-${itemId}` })
    nav(route)
  }

  const agentItems = NAV_ITEMS.filter((i) => i.group === "agents")
  const manageItems = NAV_ITEMS.filter((i) => i.group === "manage")
  const chatItem = NAV_ITEMS.find((i) => i.id === "chat")

  const creditsUsed = state.creditsUsed ?? 0
  const creditsPct = Math.min(100, Math.round((creditsUsed / TOTAL_CREDITS) * 100))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-10 shrink-0 flex-row items-center justify-between border-b border-border px-2 py-0">
        <div className="flex items-center gap-2 px-1">
          <img src={receiptLogo} alt="" className="size-5 shrink-0 rounded-[3px] object-cover" />
          <span className="text-[13px] font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Receipt AI
          </span>
        </div>
        <SidebarTrigger className="group-data-[collapsible=icon]:mx-auto" />
      </SidebarHeader>
      <SidebarContent>
        {/* Chat */}
        {chatItem && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        tooltip="Chat"
                        isActive={currentRoute === "/chat"}
                        onClick={() => handleNav("/chat", "chat")}
                      >
                        <img src={receiptLogo} alt="" className="size-4 shrink-0 rounded-[3px] object-cover" />
                        <span>Chat</span>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-[12px]">
                      {chatItem.description}
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <WorkspaceSwitcherList
          workspaces={workspaces}
          activeId={activeId}
          onSelect={(id) => onSelectWorkspace(id)}
          onCreate={onCreateWorkspace}
        />

        {/* Agents group */}
        {agentItems.some(isVisible) && (
          <SidebarGroup>
            <SidebarGroupLabel>Agents</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {agentItems.filter(isVisible).map((item) => {
                  if (item.children) {
                    // Collapsible group (Governance)
                    return (
                      <Collapsible key={item.id} defaultOpen className={`group/${item.id}`}>
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.label}>
                              <NavIcon name={item.iconName} />
                              <span>{item.label}</span>
                              {isNew(item) && <NewDot />}
                              <ArrowDown01Icon
                                className={cn(
                                  "ml-auto size-3.5 transition-transform",
                                  `group-data-[state=open]/${item.id}:rotate-180`,
                                  isNew(item) && "hidden"
                                )}
                              />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children
                                .filter((child) => state.showAllFeatures || child.unlockStage <= stage)
                                .map((child) => (
                                  <SidebarMenuSubItem key={child.id}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <SidebarMenuSubButton
                                          isActive={currentRoute === child.route}
                                          onClick={() => handleSubNav(child.route, child.id)}
                                        >
                                          <NavIcon name={child.iconName} />
                                          <span>{child.label}</span>
                                          {isNew(child) && <NewDot />}
                                        </SidebarMenuSubButton>
                                      </TooltipTrigger>
                                      <TooltipContent side="right" className="text-[12px]">
                                        {child.description}
                                      </TooltipContent>
                                    </Tooltip>
                                  </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  }

                  return (
                    <SidebarMenuItem key={item.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.label}
                            isActive={currentRoute === item.route}
                            onClick={() => handleNav(item.route, item.id)}
                          >
                            <NavIcon name={item.iconName} />
                            <span>{item.label}</span>
                            {isNew(item) && <NewDot />}
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-[12px]">
                          {item.description}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Manage group */}
        {manageItems.some(isVisible) && (
          <SidebarGroup>
            <SidebarGroupLabel>Manage</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {manageItems.filter(isVisible).map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.label}
                          isActive={currentRoute === item.route}
                          onClick={() => handleNav(item.route, item.id)}
                        >
                          <NavIcon name={item.iconName} />
                          <span>{item.label}</span>
                          {isNew(item) && <NewDot />}
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-[12px]">
                        {item.description}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        {/* Credits card */}
        <div className="mx-1 mb-1 rounded-lg border border-border bg-muted/40 p-3 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium">Free credits</span>
            <span className="text-[11px] text-muted-foreground">{creditsUsed}/{TOTAL_CREDITS} used</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                creditsPct >= 85 ? "bg-foreground/60" : creditsPct >= 50 ? "bg-foreground/40" : "bg-foreground/20"
              )}
              style={{ width: `${creditsPct}%` }}
            />
          </div>
          <button
            type="button"
            onClick={onGetCredits}
            className="mt-2 w-full rounded-md px-2 py-1 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Get credits
          </button>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings01Icon />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
