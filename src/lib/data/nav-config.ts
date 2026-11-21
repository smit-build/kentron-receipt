/**
 * Nav config — single source of truth for sidebar items.
 * label, description, icon name (hugeicons-react), route, unlockStage.
 * Stage 1: always visible. Stage 2: org has ≥1 connected app. Stage 3: org has ≥1 receipt.
 */

export interface NavItem {
  id: string
  label: string
  description: string
  iconName: string
  route: string
  unlockStage: 1 | 2 | 3
  group?: "agents" | "manage"
  children?: NavItem[]
}

export const NAV_ITEMS: NavItem[] = [
  // ── Top level ──────────────────────────────────────────────────────────────
  {
    id: "chat",
    label: "Chat",
    description: "Ask questions and run tasks across your connected apps.",
    iconName: "BubbleChatIcon",
    route: "/chat",
    unlockStage: 1,
  },

  // ── Agents group ───────────────────────────────────────────────────────────
  {
    id: "activity",
    label: "Activity",
    description: "Every tool call across your workspaces, with its receipt.",
    iconName: "Pulse01Icon",
    route: "/activity",
    unlockStage: 2,
    group: "agents",
  },
  {
    id: "org-brain",
    label: "Org Brain",
    description: "[TODO founder]",
    iconName: "File01Icon",
    route: "/org-brain",
    unlockStage: 3,
    group: "agents",
  },
  {
    id: "governance",
    label: "Governance",
    description: "Rules and policies that govern your agents.",
    iconName: "JusticeScale01Icon",
    route: "/governance",
    unlockStage: 3,
    group: "agents",
    children: [
      {
        id: "guardrails",
        label: "Guardrails",
        description: "Rules that block risky actions or require approval.",
        iconName: "Shield01Icon",
        route: "/governance/guardrails",
        unlockStage: 3,
      },
      {
        id: "policies",
        label: "Policies",
        description: "[TODO founder]",
        iconName: "TickDouble01Icon",
        route: "/governance/policies",
        unlockStage: 3,
      },
      {
        id: "skills",
        label: "Skills",
        description: "[TODO founder]",
        iconName: "MagicWand01Icon",
        route: "/governance/skills",
        unlockStage: 3,
      },
    ],
  },

  // ── Manage group ───────────────────────────────────────────────────────────
  {
    id: "docs",
    label: "Docs",
    description: "Guides and reference.",
    iconName: "File01Icon",
    route: "/docs",
    unlockStage: 1,
    group: "manage",
  },
  {
    id: "add-to-slack",
    label: "Add to Slack",
    description: "Use Receipt from Slack. [TODO founder: confirm]",
    iconName: "SlackIcon",
    route: "/add-to-slack",
    unlockStage: 3,
    group: "manage",
  },
]
