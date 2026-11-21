/**
 * App → suggested prompts map, plus cross-app prompts.
 */

export interface PromptDef {
  text: string
  appIds: string[] // logos to show on the card
  isWrite?: boolean // write actions show "Awaiting approval"
}

export const APP_PROMPTS: Record<string, PromptDef[]> = {
  GitHub: [
    { text: "List my open pull requests", appIds: ["GitHub"] },
    { text: "What changed in my repos this week?", appIds: ["GitHub"] },
  ],
  Slack: [
    { text: "Summarise today's messages in #general", appIds: ["Slack"] },
  ],
  Notion: [
    { text: "Find our latest meeting notes", appIds: ["Notion"] },
  ],
  Linear: [
    { text: "Show issues assigned to me", appIds: ["Linear"] },
  ],
  Jira: [
    { text: "List my open tickets in this sprint", appIds: ["Jira"] },
  ],
  Gmail: [
    { text: "Summarise my unread emails from today", appIds: ["Gmail"] },
  ],
  "Google Calendar": [
    { text: "What's on my calendar tomorrow?", appIds: ["Google Calendar"] },
  ],
  "Google Drive": [
    { text: "Find the most recent doc shared with me", appIds: ["Google Drive"] },
  ],
  HubSpot: [
    { text: "Show deals closing this month", appIds: ["HubSpot"] },
  ],
  "Stripe App": [
    { text: "How many new subscriptions this week?", appIds: ["Stripe App"] },
  ],
  "Google Analytics": [
    { text: "Top 5 pages by traffic last week", appIds: ["Google Analytics"] },
  ],
  Datadog: [
    { text: "Are any alerts firing right now?", appIds: ["Datadog"] },
  ],
}

/** Fallback for any app not in APP_PROMPTS */
export function getDefaultPrompt(appId: string): PromptDef {
  return { text: `What can you do with ${appId}?`, appIds: [appId] }
}

/** Cross-app prompts — only shown when both referenced apps are connected. */
export const CROSS_APP_PROMPTS: Array<{
  text: string
  appIds: string[]
  isWrite?: boolean
  requiredApps: string[]
}> = [
  {
    text: "Summarise my open PRs and draft a Slack update",
    appIds: ["GitHub", "Slack"],
    isWrite: true,
    requiredApps: ["GitHub", "Slack"],
  },
  {
    text: "Find recent emails from people I'm meeting tomorrow",
    appIds: ["Gmail", "Google Calendar"],
    requiredApps: ["Gmail", "Google Calendar"],
  },
  {
    text: "Find last week's meeting notes and draft the action items for Slack",
    appIds: ["Notion", "Slack"],
    isWrite: true,
    requiredApps: ["Notion", "Slack"],
  },
  {
    text: "Post blocked issues to #eng",
    appIds: ["Linear", "Slack"],
    isWrite: true,
    requiredApps: ["Linear", "Slack"],
  },
  {
    text: "Post blocked issues to #eng",
    appIds: ["Jira", "Slack"],
    isWrite: true,
    requiredApps: ["Jira", "Slack"],
  },
]

/**
 * Returns 4–6 prompt cards for the Chat ready state.
 * Reads-first, then writes. Includes cross-app prompts when both apps connected.
 */
export function getReadyStatePrompts(connectedAppIds: string[]): PromptDef[] {
  const result: PromptDef[] = []
  const seen = new Set<string>()

  // Cross-app prompts first (read ones)
  for (const cp of CROSS_APP_PROMPTS) {
    if (!cp.isWrite && cp.requiredApps.every((a) => connectedAppIds.includes(a))) {
      if (!seen.has(cp.text)) {
        seen.add(cp.text)
        result.push({ text: cp.text, appIds: cp.appIds })
      }
    }
  }

  // Single-app read prompts
  for (const appId of connectedAppIds) {
    const prompts = APP_PROMPTS[appId] ?? [getDefaultPrompt(appId)]
    for (const p of prompts) {
      if (!seen.has(p.text) && result.length < 5) {
        seen.add(p.text)
        result.push(p)
      }
    }
  }

  // Cross-app write prompts (at end)
  for (const cp of CROSS_APP_PROMPTS) {
    if (cp.isWrite && cp.requiredApps.every((a) => connectedAppIds.includes(a))) {
      if (!seen.has(cp.text) && result.length < 6) {
        seen.add(cp.text)
        result.push({ text: cp.text, appIds: cp.appIds, isWrite: true })
      }
    }
  }

  return result.slice(0, 6)
}
